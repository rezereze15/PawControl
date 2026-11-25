<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Billing;
use App\Models\BillingItem;
use App\Models\MedicalRecord;
use App\Models\MedicalRecordFile;
use App\Models\MedicalSupply;
use App\Models\Pet;
use App\Models\Role;
use App\Models\Service;
use App\Models\User;
use App\Support\RegistrationRules;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class DashboardController extends Controller
{
    /** Relations a medical record needs for recordVisit(), loaded up front (no N+1 queries). */
    private const RECORD_RELATIONS = ['appointment', 'creator:id,name', 'veterinarian:id,name', 'services', 'supplies', 'files'];

    public function redirect(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role === null) {
            // Roles live in the `roles` table, linked by users.roleID. Without that column
            // the database is missing the roles migration (2026_11_15_000000).
            throw new RuntimeException(array_key_exists('roleID', $user->getAttributes())
                ? "User #{$user->id} has no valid role (roleID {$user->roleID})."
                : 'This database has not been migrated for roles: the users table has no roleID column. Run `php artisan migrate`, and check DB_CONNECTION in .env points to the database you expect (it is currently ['.config('database.default').']).');
        }

        return redirect()->route('dashboard.role', ['role' => $user->role]);
    }

    public function show(Request $request, string $role): Response|RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== $role) {
            return redirect()->route('dashboard');
        }

        // Google sign-up that still needs username/phone/address: send only what the
        // "complete your profile" modal needs. No dashboard data until it's saved.
        if (! $user->hasCompleteProfile()) {
            return Inertia::render('Dashboard', [
                'role' => $role,
                'username' => $user->name,
                'profile' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'photoUrl' => $user->profilePhotoUrl(),
                ],
                'profileCompletion' => [
                    'email' => $user->email,
                    ...RegistrationRules::splitName($user->name),
                ],
            ]);
        }

        $props = [
            'role' => $role,
            'username' => $user->name,
            'profile' => $this->profile($user),
        ];

        $props += match ($role) {
            'customer' => $this->customerProps($user),
            'clerk' => $this->clerkProps(),
            'veterinarian' => $this->veterinarianProps($user),
            'owner' => $this->ownerProps(),
            'admin' => $this->adminProps(),
            default => [],
        };

        return Inertia::render('Dashboard', $props);
    }

    /** @return array<string, mixed> */
    private function profile(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'role' => $user->role,
            'photoUrl' => $user->profilePhotoUrl(),
        ];
    }

    /** @return array<string, mixed> */
    private function customerProps(User $user): array
    {
        $appointments = Appointment::query()
            ->with('pet')
            ->where('user_id', $user->getAuthIdentifier())
            ->orderBy('app_date_time')
            ->get();

        $toArray = fn (Appointment $appointment) => [
            'id' => $appointment->id,
            'referenceNumber' => $appointment->reference_number,
            'pet' => $appointment->pet?->petName ?? 'Unknown pet',
            'species' => $appointment->pet?->species,
            'breed' => $appointment->pet?->breed,
            'photoUrl' => $this->petPhotoUrl($appointment->pet),
            'serviceType' => $appointment->service_type,
            'notes' => $appointment->notes,
            'startsAt' => $appointment->app_date_time->toIso8601String(),
            'status' => $appointment->status,
            'rejectionReason' => $appointment->rejection_reason,
            'proofUrl' => $appointment->proofUrl(),
            'proofIsPdf' => $appointment->proofIsPdf(),
        ];

        $isUpcoming = fn (Appointment $appointment) => $appointment->app_date_time->greaterThanOrEqualTo(now())
            && ! in_array($appointment->status, [Appointment::STATUS_REJECTED, Appointment::STATUS_CANCELLED], true);

        $incoming = $appointments->first($isUpcoming);

        return [
            'owner' => $user->only(['name', 'phone', 'email', 'address']),
            'customerAppointments' => $appointments->map($toArray)->values(),
            // Only records of pets this user owns (not every visit they booked).
            'medicalRecords' => $this->medicalRecordsByPet(
                MedicalRecord::query()->whereHas('pet', fn ($query) => $query->where('petOwnerID', $user->getAuthIdentifier())),
                forPetOwner: true,
            ),
            'incomingAppointment' => $incoming ? $toArray($incoming) : null,
            'upcomingAppointmentCount' => $appointments->filter($isUpcoming)->count(),
            'pets' => $user->pets()
                ->get(['petID', 'petName', 'species', 'breed', 'age', 'sex', 'dateOfBirth', 'weight', 'photo_path'])
                ->map(fn (Pet $pet) => [
                    'id' => $pet->petID,
                    'name' => $pet->petName,
                    'species' => $pet->species,
                    'breed' => $pet->breed,
                    'age' => $pet->age,
                    'sex' => $pet->sex,
                    'dateOfBirth' => $pet->dateOfBirth?->toDateString(),
                    'weight' => $pet->weight,
                    'photoUrl' => $this->petPhotoUrl($pet),
                ]),
            // Only active services can be booked (the admin's Manage Services page decides).
            'bookableServices' => Service::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['name', 'price'])
                ->map(fn (Service $service) => ['name' => $service->name, 'price' => $service->price]),
        ];
    }

    /** @return array<string, mixed> */
    private function clerkProps(): array
    {
        $appointments = Appointment::query()
            ->with(['pet', 'user', 'reviewer:id,name', 'creator:id,name', 'medicalRecord:id,appointment_id,status'])
            ->where('app_date_time', '>=', now()->startOfDay())
            ->where('status', '!=', Appointment::STATUS_CANCELLED)
            ->orderBy('app_date_time')
            ->get()
            ->map(fn (Appointment $appointment) => [
                'id' => $appointment->id,
                'referenceNumber' => $appointment->reference_number,
                'owner' => $appointment->ownerName(),
                'phone' => $appointment->ownerPhone() ?? '',
                'email' => $appointment->ownerEmail() ?? '',
                'representative' => trim($appointment->ar_first_name.' '.$appointment->ar_last_name),
                'pet' => $appointment->pet?->petName ?? 'Unknown pet',
                'petId' => $appointment->pet_id,
                'species' => $appointment->pet?->species,
                'breed' => $appointment->pet?->breed,
                'petAge' => $appointment->pet?->age,
                'petDateOfBirth' => $appointment->pet?->dateOfBirth?->toDateString(),
                'photo' => $this->petPhotoUrl($appointment->pet),
                // Server-side day/time checks so "today"/"tomorrow" match the app clock.
                'day' => $appointment->app_date_time->toDateString(),
                'hasStarted' => $appointment->app_date_time->lessThanOrEqualTo(now()),
                'date' => $appointment->app_date_time->format('M j, Y'),
                'time' => $appointment->app_date_time->format('g:i A'),
                'startsAt' => $appointment->app_date_time->toIso8601String(),
                'type' => $appointment->service_type ?? 'Appointment',
                'notes' => $appointment->notes,
                'status' => $appointment->status,
                'rejectionReason' => $appointment->rejection_reason,
                'reviewedBy' => $appointment->reviewer?->name,
                'reviewedAt' => $appointment->reviewed_at?->toIso8601String(),
                // Saved as the real moment it was sent; shown on the clinic's (Philippine) clock.
                'reminderSentAt' => $appointment->reminder_sent_at?->timezone('Asia/Manila')->format('M j, Y, g:i A'),
                'paymentAmount' => $appointment->is_emergency ? 0 : Appointment::DOWN_PAYMENT,
                'proofUrl' => $appointment->proofUrl(),
                'proofIsPdf' => $appointment->proofIsPdf(),
                ...$this->emergencyFields($appointment),
                ...$this->visitFields($appointment),
                'createdBy' => $appointment->creator?->name,
            ]);

        return [
            'upcomingAppointments' => $appointments,
            'clerkHome' => $this->clerkHomeStats($appointments),
            // The records the clerk's accepted appointments created (same list the vets see).
            'patientRecords' => $this->medicalRecordsByPet(MedicalRecord::query()),
            'billings' => $this->upcomingBillings(),
        ];
    }

    /**
     * Every bill, newest first: one per completed medical record, created when the vet
     * marked it completed. Paid ones stay listed with their Paid status (the list's
     * Status filter separates them). Shaped for the clerk's Billings list and receipt.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function upcomingBillings(): Collection
    {
        return Billing::query()
            ->with(['items', 'veterinarian:id,name', 'payer:id,name', 'medicalRecord.pet', 'medicalRecord.appointment.user', 'medicalRecord.appointment.pet'])
            ->latest('issued_at')
            ->latest('id')
            ->get()
            ->map(function (Billing $billing) {
                $record = $billing->medicalRecord;
                $appointment = $record->appointment;

                return [
                    'id' => $billing->id,
                    'receiptNo' => $billing->receiptNumber(),
                    'dateIssued' => $billing->issued_at->toDateString(),
                    'medicalRecordId' => $record->id,
                    'petId' => $record->pet_id,
                    'pet' => $record->pet?->petName ?? 'Unknown pet',
                    'photo' => $this->petPhotoUrl($record->pet),
                    'owner' => $appointment?->ownerName() ?? 'Unknown owner',
                    'email' => $appointment?->ownerEmail() ?? '',
                    'phone' => $appointment?->ownerPhone() ?? '',
                    'species' => $record->pet?->species,
                    'breed' => $record->pet?->breed,
                    'type' => $record->service_type ?? 'Appointment',
                    // The attending vet: the one who completed the diagnosis.
                    'veterinarian' => $billing->veterinarian?->name,
                    'status' => $billing->status,
                    'lastVisit' => $record->visit_date->toDateString(),
                    'items' => $billing->items->map(fn (BillingItem $item) => [
                        'id' => $item->id,
                        'description' => $item->description,
                        'qty' => $item->quantity,
                        'unitPrice' => (float) $item->unit_price,
                    ])->values(),
                    'other' => ['description' => '', 'qty' => 0, 'unitPrice' => 0],
                    'discount' => (float) $billing->discount,
                    'notes' => $billing->notes ?? '',
                    'referenceNumber' => $billing->reference_number ?? '',
                    'paidAt' => $billing->paid_at?->toDateString(),
                    'paidBy' => $billing->payer?->name,
                    'amountPaid' => $billing->amount_paid === null ? null : (float) $billing->amount_paid,
                ];
            })
            ->values();
    }

    /**
     * Numbers for the clerk home cards.
     *
     * @param  Collection<int, array<string, mixed>>  $appointments  clerk rows from today on (not cancelled)
     * @return array<string, mixed>
     */
    private function clerkHomeStats(Collection $appointments): array
    {
        // Pets have no created_at, so a "new patient" is a pet whose first-ever
        // appointment was booked this month.
        $newPatientsThisMonth = Appointment::query()
            ->select('pet_id')
            ->groupBy('pet_id')
            ->havingRaw('MIN(created_at) >= ?', [now()->startOfMonth()])
            ->get()
            ->count();

        $active = $appointments->where('status', '!=', Appointment::STATUS_REJECTED);
        $confirmed = $active->where('status', Appointment::STATUS_CONFIRMED);

        return [
            'today' => now()->toDateString(),
            'tomorrow' => now()->addDay()->toDateString(),
            'totalPatients' => Pet::count(),
            'newPatientsThisMonth' => $newPatientsThisMonth,
            // Upcoming (today onward), excluding rejected ones.
            'upcomingAppointments' => $active->count(),
            'pendingAppointments' => $active->where('status', Appointment::STATUS_PENDING)->count(),
            // Bills waiting to be settled: created when a vet completes a visit (same as the Billings list).
            'upcomingBilling' => Billing::query()->where('status', '!=', Billing::STATUS_PAID)->count(),
            // Emergency walk-ins skip the online down payment.
            'downPaymentsReceived' => $confirmed->where('isEmergency', false)->count() * Appointment::DOWN_PAYMENT,
        ];
    }

    /** @return array<string, mixed> */
    private function veterinarianProps(User $user): array
    {
        // "Today" is the clinic's date (Asia/Manila), not the server's (UTC). Booked times are
        // stored as clinic wall-clock time, so compare dates directly.
        $clinicToday = now(config('app.clinic_timezone'))->toDateString();

        $confirmed = Appointment::query()
            ->with(['pet.owner', 'user', 'medicalRecord:id,appointment_id,status'])
            ->where('status', Appointment::STATUS_CONFIRMED)
            ->whereDate('app_date_time', '>=', $clinicToday)
            ->orderBy('app_date_time')
            ->get();

        // Veterinarian Appointments module: only today's accepted appointments.
        $todays = Appointment::query()
            ->with(['pet.owner', 'user', 'medicalRecord:id,appointment_id,status'])
            ->where('status', Appointment::STATUS_CONFIRMED)
            ->whereDate('app_date_time', $clinicToday)
            ->orderBy('app_date_time')
            ->get();

        $row = fn (Appointment $appointment) => [
            'id' => $appointment->id,
            'petId' => $appointment->pet_id,
            'pet' => $appointment->pet?->petName ?? 'Unknown pet',
            'species' => $appointment->pet?->species,
            'breed' => $appointment->pet?->breed,
            'petAge' => $appointment->pet?->age,
            'petDateOfBirth' => $appointment->pet?->dateOfBirth?->toDateString(),
            'photo' => $this->petPhotoUrl($appointment->pet),
            // Server-side day so "today"/"tomorrow" match the app clock.
            'day' => $appointment->app_date_time->toDateString(),
            'owner' => $appointment->ownerName(),
            'phone' => $appointment->ownerPhone() ?? '',
            'date' => $appointment->app_date_time->format('M j, Y'),
            'time' => $appointment->app_date_time->format('g:i A'),
            'startsAt' => $appointment->app_date_time->toIso8601String(),
            'type' => $appointment->service_type ?? 'Appointment',
            'notes' => $appointment->notes,
            'status' => $appointment->status,
            ...$this->emergencyFields($appointment),
            ...$this->visitFields($appointment),
        ];

        return [
            'vetHome' => $this->vetHomeStats($confirmed, $user->id, $clinicToday),
            'confirmedAppointments' => $confirmed->map($row)->values(),
            'todaysAppointments' => $todays->map($row)->values(),
            'clinicToday' => $clinicToday,
            // Every medical record (one per accepted appointment), grouped by pet.
            'patientRecords' => $this->medicalRecordsByPet(MedicalRecord::query()),
            'recordOptions' => $this->recordOptions(),
        ];
    }

    /**
     * Numbers for the veterinarian home cards, all from the database.
     *
     * @param  Collection<int, Appointment>  $confirmed  confirmed appointments from today on
     * @param  int  $vetId  the logged-in vet, for "Mine today"
     * @param  string  $clinicToday  the clinic's date (Y-m-d), so the cards match the Appointments module
     * @return array<string, mixed>
     */
    private function vetHomeStats(Collection $confirmed, int $vetId, string $clinicToday): array
    {
        $today = MedicalRecord::query()
            ->whereDate('visit_date', $clinicToday)
            ->pluck('status');

        return [
            'today' => $clinicToday,
            'tomorrow' => Carbon::parse($clinicToday)->addDay()->toDateString(),
            // Patients = pets with at least one medical record; "new" = first record this month.
            'totalPatients' => MedicalRecord::query()->distinct()->count('pet_id'),
            'newPatientsThisMonth' => MedicalRecord::query()
                ->select('pet_id')
                ->groupBy('pet_id')
                ->havingRaw('MIN(created_at) >= ?', [now()->startOfMonth()])
                ->get()
                ->count(),
            'upcomingAppointments' => $confirmed->count(),
            'appointmentsToday' => $confirmed->filter(fn (Appointment $appointment) => $appointment->app_date_time->toDateString() === $clinicToday)->count(),
            'operationsToday' => $today->count(),
            'ongoingToday' => $today->filter(fn (string $status) => $status === MedicalRecord::STATUS_ONGOING)->count(),
            'completedToday' => $today->filter(fn (string $status) => $status === MedicalRecord::STATUS_COMPLETED)->count(),
            // This vet's share of today's operations: today's visits they selected
            // (Selected, Ongoing or Completed). Counted by visit date, like operationsToday.
            'myOperationsToday' => MedicalRecord::query()
                ->whereDate('visit_date', $clinicToday)
                ->where('veterinarian_id', $vetId)
                ->count(),
            // Diagnoses in progress on any day (e.g. started yesterday and not completed).
            'activeDiagnoses' => MedicalRecord::query()->where('status', MedicalRecord::STATUS_ONGOING)->count(),
        ];
    }

    /**
     * Choices for the vet's diagnosis form: active services (with the supplies each one
     * normally uses, to pre-fill) and active supplies with their current stock.
     *
     * @return array<string, mixed>
     */
    private function recordOptions(): array
    {
        return [
            'services' => Service::query()
                ->where('is_active', true)
                ->with('supplies:id')
                ->orderBy('name')
                ->get()
                ->map(fn (Service $service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'price' => $service->price,
                    'supplies' => $service->supplies->map(fn (MedicalSupply $supply) => [
                        'id' => $supply->id,
                        'quantity' => (int) $supply->pivot->quantity,
                    ])->values(),
                ]),
            'supplies' => MedicalSupply::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'category', 'unit_of_measure', 'stock_quantity', 'unit_price'])
                ->map(fn (MedicalSupply $supply) => [
                    'id' => $supply->id,
                    'name' => $supply->name,
                    'category' => $supply->category,
                    'unit' => $supply->unit_of_measure,
                    'stock' => $supply->stock_quantity,
                    'unitPrice' => $supply->unit_price,
                ]),
            'maxFileKb' => MedicalRecordController::MAX_FILE_KB,
        ];
    }

    /** @return array<string, mixed> */
    private function ownerProps(): array
    {
        $pets = Pet::query()
            ->with([
                'owner:id,name,email,phone',
                'medicalRecords' => fn ($query) => $query
                    ->with(self::RECORD_RELATIONS)
                    ->orderByDesc('visit_date'),
            ])
            ->orderBy('petID')
            ->get();

        return ['petRecords' => $pets->map(fn (Pet $pet) => $this->petRecord($pet))->values()];
    }

    /** @return array<string, mixed> */
    private function adminProps(): array
    {
        $roles = Role::query()->withCount('users')->orderBy('roleID')->get();
        $roleCounts = $roles->mapWithKeys(fn (Role $role) => [$role->roleName => (int) $role->users_count]);

        return [
            'adminStats' => [
                'totalUsers' => (int) $roleCounts->sum(),
                'activeUsers' => User::query()->where('status', User::STATUS_ACTIVE)->count(),
                'activeServices' => Service::query()->where('is_active', true)->count(),
                'totalServices' => Service::query()->count(),
                'activeSupplies' => MedicalSupply::query()->where('is_active', true)->count(),
                'totalSupplies' => MedicalSupply::query()->count(),
                'lowStockCount' => MedicalSupply::query()->lowStock()->count(),
            ],
            // Most urgent first (lowest stock). The card shows the full count; the panel lists up to 5.
            'lowStockSupplies' => MedicalSupply::query()
                ->lowStock()
                ->orderBy('stock_quantity')
                ->limit(5)
                ->get(['id', 'name', 'stock_quantity', 'reorder_level', 'unit_of_measure'])
                ->map(fn (MedicalSupply $supply) => [
                    'id' => $supply->id,
                    'name' => $supply->name,
                    'stockQuantity' => $supply->stock_quantity,
                    'reorderLevel' => $supply->reorder_level,
                    'unitOfMeasure' => $supply->unit_of_measure,
                ]),
            // Full list for the Manage Services page: active first, then A-Z.
            // with() loads every service's supplies in ONE extra query, instead of one query per service.
            'services' => Service::query()
                ->with(['supplies' => fn ($query) => $query->orderBy('name')])
                ->orderByDesc('is_active')
                ->orderBy('name')
                ->get()
                ->map(fn (Service $service) => [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'price' => $service->price,
                    'isActive' => $service->is_active,
                    // What it uses each time, e.g. 2 pcs of Absorbable Suture 3-0.
                    'supplies' => $service->supplies->map(fn (MedicalSupply $supply) => [
                        'id' => $supply->id,
                        'name' => $supply->name,
                        'unitOfMeasure' => $supply->unit_of_measure,
                        'quantity' => $supply->pivot->quantity,
                        'isActive' => $supply->is_active,
                    ]),
                ]),
            // Full list for the Manage Medical Supplies page: active first, then A-Z.
            'supplies' => MedicalSupply::query()
                ->orderByDesc('is_active')
                ->orderBy('name')
                ->get()
                ->map(fn (MedicalSupply $supply) => [
                    'id' => $supply->id,
                    'name' => $supply->name,
                    'description' => $supply->description,
                    'category' => $supply->category,
                    'unitOfMeasure' => $supply->unit_of_measure,
                    'stockQuantity' => $supply->stock_quantity,
                    'reorderLevel' => $supply->reorder_level,
                    'unitPrice' => $supply->unit_price,
                    'isActive' => $supply->is_active,
                    'isLowStock' => $supply->isLowStock(),
                ]),
            // Dropdown choices come from the model, so the page and the server always match.
            'supplyOptions' => [
                'categories' => MedicalSupply::CATEGORIES,
                'units' => MedicalSupply::UNITS,
            ],
            'usersByRole' => $roleCounts
                ->filter()
                ->map(fn ($total, $role) => ['role' => $role, 'count' => $total])
                ->values(),
            'roles' => $roles->map(fn (Role $role) => [
                'id' => $role->roleID,
                'name' => $role->roleName,
                'label' => $role->label(),
                'permissions' => Role::PERMISSIONS[$role->roleName] ?? [],
                'userCount' => (int) $role->users_count,
            ])->values(),
            'managedUsers' => User::query()
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    ...RegistrationRules::splitName($user->name),
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'role' => $user->role,
                    'status' => $user->status,
                    'photoUrl' => $user->profilePhotoUrl(),
                    'lastLoginAt' => $user->last_login_at?->toIso8601String(),
                    'createdAt' => $user->created_at?->toIso8601String(),
                ]),
            // Only what the screen shows: no emails, phones, or other personal details.
            'recentUsers' => User::query()
                ->latest()
                ->limit(5)
                ->get(['id', 'name', 'roleID', 'created_at'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                    'createdAt' => $user->created_at?->toIso8601String(),
                ]),
        ];
    }

    /**
     * Every registered pet, with the status of its medical records:
     * Ongoing (a vet is working on one), Selected (a vet picked one), Upcoming (one not started yet),
     * Completed (all finished), or No Visits.
     *
     * @return array<string, mixed>
     */
    private function petRecord(Pet $pet): array
    {
        $records = $pet->medicalRecords;
        $lastVisit = $records->first(fn (MedicalRecord $record) => $record->visit_date->lessThanOrEqualTo(now()));

        return [
            'id' => $pet->petID,
            'name' => $pet->petName,
            'species' => $pet->species,
            'breed' => $pet->breed,
            'sex' => $pet->sex,
            'dateOfBirth' => $pet->dateOfBirth?->toDateString(),
            'age' => $pet->dateOfBirth ? $pet->dateOfBirth->age : $pet->age,
            'weight' => $pet->weight,
            'photo' => $this->petPhotoUrl($pet),
            'owner' => [
                'name' => $pet->ownerName(),
                'email' => $pet->owner?->email,
                'phone' => $pet->ownerPhone(),
            ],
            'isWalkIn' => $pet->isUnlinkedWalkIn(),
            'status' => $this->petStatus($records),
            'lastVisitAt' => $lastVisit?->visit_date->toIso8601String(),
            'veterinarian' => $this->latestVeterinarian($records),
            'visits' => $records->map(fn (MedicalRecord $record) => $this->recordVisit($record))->values(),
        ];
    }

    /**
     * One status for a pet, from its records: Ongoing beats Selected beats Upcoming beats Completed.
     *
     * @param  Collection<int, MedicalRecord>  $records
     */
    private function petStatus(Collection $records): string
    {
        foreach ([MedicalRecord::STATUS_ONGOING, MedicalRecord::STATUS_SELECTED, MedicalRecord::STATUS_UPCOMING, MedicalRecord::STATUS_COMPLETED] as $status) {
            if ($records->contains('status', $status)) {
                return $status;
            }
        }

        return 'No Visits';
    }

    /**
     * The vet on the pet's most recent record that has one.
     *
     * @param  Collection<int, MedicalRecord>  $records  newest first
     */
    private function latestVeterinarian(Collection $records): ?string
    {
        return $records->first(fn (MedicalRecord $record) => $record->veterinarian !== null)?->veterinarian->name;
    }

    /**
     * Medical records grouped into one entry per pet, most recently seen pet first.
     *
     * @param  Builder<MedicalRecord>  $query
     * @param  bool  $forPetOwner  the pet's owner is viewing: leave out the clinic's internal notes
     * @return Collection<int, array<string, mixed>>
     */
    private function medicalRecordsByPet(Builder $query, bool $forPetOwner = false): Collection
    {
        return $query
            ->with(['pet.owner', 'appointment.user', ...self::RECORD_RELATIONS])
            ->orderByDesc('visit_date')
            ->get()
            ->groupBy('pet_id')
            ->map(fn (Collection $records) => $this->patientRecord($records, $forPetOwner))
            ->sortByDesc('lastVisitAt')
            ->values();
    }

    /**
     * @param  Collection<int, MedicalRecord>  $records  one pet's records, newest first
     * @return array<string, mixed>
     */
    private function patientRecord(Collection $records, bool $forPetOwner = false): array
    {
        /** @var MedicalRecord $latest */
        $latest = $records->first();
        $pet = $latest->pet;
        $appointment = $latest->appointment;
        $lastVisit = $records->first(fn (MedicalRecord $record) => $record->visit_date->lessThan(now())) ?? $records->last();

        return [
            'id' => $latest->pet_id,
            'name' => $pet?->petName ?? 'Unknown pet',
            'species' => $pet?->species,
            'breed' => $pet?->breed,
            'sex' => $pet?->sex,
            'dateOfBirth' => $pet?->dateOfBirth?->toDateString(),
            'age' => $pet?->dateOfBirth ? $pet->dateOfBirth->age : $pet?->age,
            'weight' => $pet?->weight,
            'photo' => $this->petPhotoUrl($pet),
            // The pet's owner (account or walk-in), falling back to whoever booked.
            'owner' => [
                'name' => $pet?->owner?->name ?? $pet?->walk_in_owner_name ?? $appointment?->ownerName() ?? 'Unknown owner',
                'email' => $pet?->owner?->email ?? $appointment?->ownerEmail(),
                'phone' => $pet?->ownerPhone() ?? $appointment?->ownerPhone(),
            ],
            'isWalkIn' => (bool) $pet?->isUnlinkedWalkIn(),
            'lastVisitAt' => $lastVisit->visit_date->toIso8601String(),
            'status' => $this->petStatus($records),
            'veterinarian' => $this->latestVeterinarian($records),
            'visits' => $records->map(fn (MedicalRecord $record) => $this->recordVisit($record, $forPetOwner))->values(),
        ];
    }

    /**
     * One medical record as the record screens show it (vet, clerk, clinic owner, pet owner).
     *
     * @return array<string, mixed>
     */
    private function recordVisit(MedicalRecord $record, bool $forPetOwner = false): array
    {
        return [
            'id' => $record->id,
            'recordNumber' => $record->number(),
            'appointmentId' => $record->appointment_id,
            'startsAt' => $record->visit_date->toIso8601String(),
            'type' => $record->service_type ?? 'Appointment',
            'notes' => $record->chief_complaint,
            'diagnosis' => $record->diagnosis,
            'treatment' => $record->treatment,
            'suggestions' => $record->suggestions,
            'labResults' => $record->lab_results,
            // The clinic's internal notes: never sent to the pet's owner.
            ...($forPetOwner ? [] : ['vetNotes' => $record->vet_notes]),
            'recordStatus' => $record->status,
            'status' => $record->appointment?->status,
            'isEmergency' => (bool) $record->appointment?->is_emergency,
            'veterinarian' => $record->veterinarian?->name,
            'veterinarianId' => $record->veterinarian_id,
            'startedAt' => $record->started_at?->toIso8601String(),
            'completedAt' => $record->completed_at?->toIso8601String(),
            'createdBy' => $record->creator?->name,
            'createdAt' => $record->created_at?->toIso8601String(),
            'services' => $record->services->map(fn (Service $service) => [
                'id' => $service->id,
                'name' => $service->name,
                'price' => $service->pivot->price,
            ])->values(),
            'supplies' => $record->supplies->map(fn (MedicalSupply $supply) => [
                'id' => $supply->id,
                'name' => $supply->name,
                'unit' => $supply->unit_of_measure,
                'quantity' => (int) $supply->pivot->quantity,
            ])->values(),
            'files' => $record->files->map(fn (MedicalRecordFile $file) => [
                'id' => $file->id,
                'name' => $file->original_name,
                'url' => $file->url(),
                'isImage' => $file->isImage(),
                'size' => $file->size,
            ])->values(),
        ];
    }

    /**
     * The medical record behind a confirmed appointment, for the status column.
     *
     * @return array{medicalRecordId: int|null, visitStatus: string|null}
     */
    private function visitFields(Appointment $appointment): array
    {
        return [
            'medicalRecordId' => $appointment->medicalRecord?->id,
            'visitStatus' => $appointment->medicalRecord?->status,
        ];
    }

    /**
     * Emergency walk-in flags shared by the clerk and veterinarian appointment rows.
     *
     * @return array{isEmergency: bool, isWalkIn: bool}
     */
    private function emergencyFields(Appointment $appointment): array
    {
        return [
            'isEmergency' => $appointment->is_emergency,
            'isWalkIn' => $appointment->isWalkInWithoutAccount(),
        ];
    }

    private function petPhotoUrl(?Pet $pet): ?string
    {
        return $pet?->photoUrl();
    }
}
