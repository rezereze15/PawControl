<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\UserSettingsController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'landingpage')->name('home');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:6,1');
    Route::get('/register', [AuthController::class, 'showRegistration'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    // Appointments
    Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::get('/appointments/availability', [AppointmentController::class, 'availability'])
        ->name('appointments.availability');
    Route::get('/appointments/{appointment}/proof', [AppointmentController::class, 'proof'])
        ->name('appointments.proof');
    Route::post('/appointments/{appointment}/accept', [AppointmentController::class, 'accept'])
        ->name('appointments.accept');
    Route::post('/appointments/{appointment}/reject', [AppointmentController::class, 'reject'])
        ->name('appointments.reject');

    // Pets
    Route::post('/pets', [PetController::class, 'store'])->name('pets.store');
    Route::get('/pets/{pet}/photo', [PetController::class, 'showPhoto'])->name('pets.photo.show');
    Route::post('/pets/{pet}/photo', [PetController::class, 'updatePhoto'])->name('pets.photo.update');

    // Self-service settings: profile photo, address and password only.
    Route::get('/settings/photo', [UserSettingsController::class, 'showPhoto'])->name('settings.photo.show');
    Route::post('/settings/photo', [UserSettingsController::class, 'updatePhoto'])->name('settings.photo.update');
    Route::put('/settings/address', [UserSettingsController::class, 'updateAddress'])->name('settings.address.update');
    Route::put('/settings/password', [UserSettingsController::class, 'updatePassword'])
        ->middleware('throttle:6,1')
        ->name('settings.password.update');

    Route::get('/dashboard', [DashboardController::class, 'redirect'])->name('dashboard');
    Route::get('/dashboard/{role}', [DashboardController::class, 'show'])
        ->whereIn('role', ['customer', 'clerk', 'admin', 'veterinarian', 'owner'])
        ->name('dashboard.role');
    Route::get('/customers', fn () => redirect()->route('dashboard'))->name('customers');
});
