<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PetController;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

Route::inertia('/', 'landingpage')->name('home');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:6,1');
    Route::get('/register', [AuthController::class, 'showRegistration'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');
    Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::get('/appointments/availability', [AppointmentController::class, 'availability'])
        ->name('appointments.availability');
    Route::post('/pets', [PetController::class, 'store'])->name('pets.store');
    Route::post('/pets/{pet}/photo', [PetController::class, 'updatePhoto'])->name('pets.photo.update');
    Route::get('/dashboard', function (Request $request) {
        return redirect()->route('dashboard.role', ['role' => $request->user()->role]);
    })->name('dashboard');
    Route::get('/dashboard/{role}', function (Request $request, string $role) {
        if ($request->user()->role !== $role) {
            return redirect()->route('dashboard');
        }

        $props = [
            'role' => $role,
            'username' => $request->user()->name,
        ];

        if ($role === 'customer') {
            $props['owner'] = $request->user()->only(['name', 'phone', 'email', 'address']);
            $customerAppointments = Appointment::query()
                ->with('pet')
                ->where('user_id', $request->user()->getAuthIdentifier())
                ->orderBy('app_date_time')
                ->get();
            $appointmentToArray = fn (Appointment $appointment) => [
                'id' => $appointment->id,
                'referenceNumber' => $appointment->reference_number,
                'pet' => $appointment->pet?->petName ?? 'Unknown pet',
                'species' => $appointment->pet?->species,
                'breed' => $appointment->pet?->breed,
                'photoUrl' => $appointment->pet?->photo_path
                    ? Storage::disk(config('filesystems.default'))->temporaryUrl($appointment->pet->photo_path, now()->addMinutes(30))
                    : null,
                'serviceType' => $appointment->service_type,
                'notes' => $appointment->notes,
                'startsAt' => $appointment->app_date_time->toIso8601String(),
                'status' => $appointment->status,
                'rejectionReason' => $appointment->rejection_reason,
            ];
            $props['customerAppointments'] = $customerAppointments
                ->map($appointmentToArray)
                ->values();
            $incomingAppointment = $customerAppointments->first(fn (Appointment $appointment) =>
                $appointment->app_date_time->greaterThanOrEqualTo(now())
                && ! in_array($appointment->status, ['Rejected', 'Cancelled'], true)
            );
            $props['incomingAppointment'] = $incomingAppointment ? $appointmentToArray($incomingAppointment) : null;
            $props['upcomingAppointmentCount'] = $customerAppointments
                ->filter(fn (Appointment $appointment) =>
                    $appointment->app_date_time->greaterThanOrEqualTo(now())
                    && ! in_array($appointment->status, ['Rejected', 'Cancelled'], true)
                )
                ->count();
            $props['pets'] = $request->user()->pets()
                ->get(['petID', 'petName', 'species', 'breed', 'age', 'sex', 'dateOfBirth', 'weight', 'photo_path'])
                ->map(fn ($pet) => [
                    'id' => $pet->petID,
                    'name' => $pet->petName,
                    'species' => $pet->species,
                    'breed' => $pet->breed,
                    'age' => $pet->age,
                    'sex' => $pet->sex,
                    'dateOfBirth' => $pet->dateOfBirth?->toDateString(),
                    'weight' => $pet->weight,
                    'photoUrl' => $pet->photo_path
                        ? Storage::disk(config('filesystems.default'))->temporaryUrl($pet->photo_path, now()->addMinutes(30))
                        : null,
                ]);
        }

        if ($role === 'clerk') {
            $props['upcomingAppointments'] = Appointment::query()
                ->with(['pet', 'user'])
                ->where('app_date_time', '>=', now())
                ->where('status', '!=', 'Cancelled')
                ->orderBy('app_date_time')
                ->get()
                ->map(fn (Appointment $appointment) => [
                    'id' => $appointment->id,
                    'referenceNumber' => $appointment->reference_number,
                    'owner' => $appointment->user?->name ?? 'Unknown owner',
                    'phone' => $appointment->user?->phone ?? '',
                    'pet' => $appointment->pet?->petName ?? 'Unknown pet',
                    'photo' => null,
                    'date' => $appointment->app_date_time->format('M j, Y'),
                    'time' => $appointment->app_date_time->format('g:i A'),
                    'type' => $appointment->notes ?? 'Appointment',
                    'status' => $appointment->status,
                ]);
        }

        return Inertia::render('Dashboard', $props);
    })->whereIn('role', ['customer', 'clerk', 'admin', 'veterinarian', 'owner'])
        ->name('dashboard.role');
    Route::get('/customers', fn () => redirect()->route('dashboard'))->name('customers');
});
