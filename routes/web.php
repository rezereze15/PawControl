<?php

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\ProfileCompletionController;
use App\Http\Controllers\UserSettingsController;
use App\Http\Middleware\EnsureProfileIsComplete;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'landingpage')->name('home');

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthController::class, 'create'])->name('login');
    Route::post('/login', [AuthController::class, 'store'])->middleware('throttle:6,1');
    Route::get('/register', [AuthController::class, 'showRegistration'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');

    // Email verification step (pending registration is identified via the session).
    Route::get('/register/verify', [AuthController::class, 'showVerification'])->name('register.verify');
    Route::post('/register/verify', [AuthController::class, 'verify'])
        ->middleware('throttle:10,1')
        ->name('register.verify.store');
    Route::post('/register/resend', [AuthController::class, 'resend'])
        ->middleware('throttle:4,1')
        ->name('register.resend');
    Route::post('/register/cancel', [AuthController::class, 'cancel'])->name('register.cancel');

    // Forgot password: email → 6-digit code → new password (state kept in the session).
    Route::get('/forgot-password', [PasswordResetController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendCode'])
        ->middleware('throttle:5,1')
        ->name('password.email');
    Route::get('/forgot-password/verify', [PasswordResetController::class, 'showCode'])->name('password.code');
    Route::post('/forgot-password/verify', [PasswordResetController::class, 'verifyCode'])
        ->middleware('throttle:10,1')
        ->name('password.code.verify');
    Route::post('/forgot-password/resend', [PasswordResetController::class, 'resend'])
        ->middleware('throttle:4,1')
        ->name('password.code.resend');
    Route::get('/reset-password', [PasswordResetController::class, 'edit'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('password.update');

    // Sign in with Google (OAuth 2.0 via Laravel Socialite).
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])
        ->middleware('throttle:10,1')
        ->name('google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])
        ->middleware('throttle:10,1')
        ->name('google.callback');
});

// Everything below needs a logged-in user. EnsureProfileIsComplete also blocks Google
// sign-ups that haven't filled in the "complete your profile" modal yet; only logout,
// the dashboard (which shows the modal, without data) and the modal's save endpoint are exempt.
// auth.session: signs out other sessions once the user's password changes (e.g. after a reset).
Route::middleware(['auth', 'auth.session', EnsureProfileIsComplete::class])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'destroy'])
        ->withoutMiddleware(EnsureProfileIsComplete::class)
        ->name('logout');

    // Save endpoint for the "complete your profile" modal on the dashboard (no page of its own).
    Route::post('/profile/complete', [ProfileCompletionController::class, 'store'])
        ->withoutMiddleware(EnsureProfileIsComplete::class)
        ->middleware('throttle:10,1')
        ->name('profile.complete');

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

    // Admin: manage user accounts and roles.
    Route::middleware('role:admin')->prefix('admin/users')->name('admin.users.')->group(function (): void {
        Route::post('/', [AdminUserController::class, 'store'])->name('store');
        Route::put('/{user}', [AdminUserController::class, 'update'])->name('update');
        Route::patch('/{user}/status', [AdminUserController::class, 'updateStatus'])->name('status');
    });

    Route::get('/dashboard', [DashboardController::class, 'redirect'])
        ->withoutMiddleware(EnsureProfileIsComplete::class)
        ->name('dashboard');
    Route::get('/dashboard/{role}', [DashboardController::class, 'show'])
        ->withoutMiddleware(EnsureProfileIsComplete::class)
        ->whereIn('role', ['customer', 'clerk', 'admin', 'veterinarian', 'owner'])
        ->name('dashboard.role');
    Route::get('/customers', fn () => redirect()->route('dashboard'))->name('customers');
});
