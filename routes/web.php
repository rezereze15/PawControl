<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PetController;
use App\Models\Appointment;
use Illuminate\Http\Request;

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
    Route::post('/pets', [PetController::class, 'store'])->name('pets.store');
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
            $props['pets'] = $request->user()->pets()
                ->get(['petID', 'petName', 'species', 'breed', 'age'])
                ->map(fn ($pet) => [
                    'id' => $pet->petID,
                    'name' => $pet->petName,
                    'species' => $pet->species,
                    'breed' => $pet->breed,
                    'age' => $pet->age,
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
