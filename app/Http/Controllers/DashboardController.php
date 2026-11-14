<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Pet;
use App\Models\Role;
use App\Models\User;
use App\Support\RegistrationRules;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class DashboardController extends Controller
{
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
            'veterinarian' => $this->veterinarianProps(),
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
        ];
    }

    /** @return array<string, mixed> */
    private function clerkProps(): array
    {
        $appointments = Appointment::query()
            ->with(['pet', 'user', 'reviewer:id,name'])
            ->where('app_date_time', '>=', now()->startOfDay())
            ->where('status', '!=', Appointment::STATUS_CANCELLED)
            ->orderBy('app_date_time')
            ->get()
            ->map(fn (Appointment $appointment) => [
                'id' => $appointment->id,
                'referenceNumber' => $appointment->reference_number,
                'owner' => $appointment->user?->name ?? 'Unknown owner',
                'phone' => $appointment->user?->phone ?? '',
                'email' => $appointment->user?->email ?? '',
                'representative' => trim($appointment->ar_first_name.' '.$appointment->ar_last_name),
                'pet' => $appointment->pet?->petName ?? 'Unknown pet',
                'petId' => $appointment->pet_id,
                'species' => $appointment->pet?->species,
                'breed' => $appointment->pet?->breed,
                'photo' => $this->petPhotoUrl($appointment->pet),
                'date' => $appointment->app_date_time->format('M j, Y'),
                'time' => $appointment->app_date_time->format('g:i A'),
                'startsAt' => $appointment->app_date_time->toIso8601String(),
                'type' => $appointment->service_type ?? 'Appointment',
                'notes' => $appointment->notes,
                'status' => $appointment->status,
                'rejectionReason' => $appointment->rejection_reason,
                'reviewedBy' => $appointment->reviewer?->name,
                'reviewedAt' => $appointment->reviewed_at?->toIso8601String(),
                'paymentAmount' => Appointment::DOWN_PAYMENT,
                'proofUrl' => $appointment->proofUrl(),
                'proofIsPdf' => $appointment->proofIsPdf(),
            ]);

        return ['upcomingAppointments' => $appointments];
    }

    /** @return array<string, mixed> */
    private function veterinarianProps(): array
    {
        $confirmed = Appointment::query()
            ->with(['pet', 'user'])
            ->where('status', Appointment::STATUS_CONFIRMED)
            ->orderBy('app_date_time')
            ->get();

        $patients = $confirmed
            ->groupBy('pet_id')
            ->map(fn (Collection $visits) => $this->patientRecord($visits))
            ->sortByDesc('lastVisitAt')
            ->values();

        $startOfToday = now()->startOfDay();

        return [
            'confirmedAppointments' => $confirmed
                ->filter(fn (Appointment $appointment) => $appointment->app_date_time->greaterThanOrEqualTo($startOfToday))
                ->map(fn (Appointment $appointment) => [
                    'id' => $appointment->id,
                    'petId' => $appointment->pet_id,
                    'pet' => $appointment->pet?->petName ?? 'Unknown pet',
                    'photo' => $this->petPhotoUrl($appointment->pet),
                    'owner' => $appointment->user?->name ?? 'Unknown owner',
                    'phone' => $appointment->user?->phone ?? '',
                    'date' => $appointment->app_date_time->format('M j, Y'),
                    'time' => $appointment->app_date_time->format('g:i A'),
                    'startsAt' => $appointment->app_date_time->toIso8601String(),
                    'type' => $appointment->service_type ?? 'Appointment',
                    'notes' => $appointment->notes,
                    'status' => $appointment->status,
                ])
                ->values(),
            'patientRecords' => $patients,
        ];
    }

    /** @return array<string, mixed> */
    private function ownerProps(): array
    {
        $pets = Pet::query()
            ->with([
                'owner:id,name,email,phone',
                'appointments' => fn ($query) => $query
                    ->where('status', Appointment::STATUS_CONFIRMED)
                    ->orderByDesc('app_date_time'),
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
     * Every registered pet, with a status derived from its confirmed appointments:
     * Ongoing (one today), Upcoming (one in the future), Completed (only past ones),
     * or No Visits.
     *
     * @return array<string, mixed>
     */
    private function petRecord(Pet $pet): array
    {
        $now = now();
        $visits = $pet->appointments;
        $lastVisit = $visits->first(fn (Appointment $appointment) => $appointment->app_date_time->lessThanOrEqualTo($now));

        $status = match (true) {
            $visits->contains(fn (Appointment $appointment) => $appointment->app_date_time->isToday()) => 'Ongoing',
            $visits->contains(fn (Appointment $appointment) => $appointment->app_date_time->greaterThan($now)) => 'Upcoming',
            $visits->isNotEmpty() => 'Completed',
            default => 'No Visits',
        };

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
                'name' => $pet->owner?->name ?? 'Unknown owner',
                'email' => $pet->owner?->email,
                'phone' => $pet->owner?->phone,
            ],
            'status' => $status,
            'lastVisitAt' => $lastVisit?->app_date_time->toIso8601String(),
            'veterinarian' => null, // appointments don't record an assigned vet yet
            'visits' => $visits->map(fn (Appointment $appointment) => [
                'id' => $appointment->id,
                'startsAt' => $appointment->app_date_time->toIso8601String(),
                'type' => $appointment->service_type ?? 'Appointment',
                'notes' => $appointment->notes,
                'status' => $appointment->status,
            ])->values(),
        ];
    }

    /**
     * @param  Collection<int, Appointment>  $visits  confirmed appointments for one pet
     * @return array<string, mixed>
     */
    private function patientRecord(Collection $visits): array
    {
        /** @var Appointment $first */
        $first = $visits->first();
        $pet = $first->pet;
        $owner = $first->user;
        $past = $visits->filter(fn (Appointment $appointment) => $appointment->app_date_time->lessThan(now()));
        $lastVisit = $past->last() ?? $visits->first();

        return [
            'id' => $first->pet_id,
            'name' => $pet?->petName ?? 'Unknown pet',
            'species' => $pet?->species,
            'breed' => $pet?->breed,
            'sex' => $pet?->sex,
            'dateOfBirth' => $pet?->dateOfBirth?->toDateString(),
            'age' => $pet?->dateOfBirth ? $pet->dateOfBirth->age : $pet?->age,
            'weight' => $pet?->weight,
            'photo' => $this->petPhotoUrl($pet),
            'owner' => [
                'name' => $owner?->name ?? 'Unknown owner',
                'email' => $owner?->email,
                'phone' => $owner?->phone,
            ],
            'lastVisitAt' => $lastVisit->app_date_time->toIso8601String(),
            'visits' => $visits
                ->sortByDesc('app_date_time')
                ->map(fn (Appointment $appointment) => [
                    'id' => $appointment->id,
                    'startsAt' => $appointment->app_date_time->toIso8601String(),
                    'type' => $appointment->service_type ?? 'Appointment',
                    'notes' => $appointment->notes,
                    'status' => $appointment->status,
                ])
                ->values(),
        ];
    }

    private function petPhotoUrl(?Pet $pet): ?string
    {
        return $pet?->photoUrl();
    }
}
