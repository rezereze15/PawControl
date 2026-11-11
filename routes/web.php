<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;
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
    Route::get('/dashboard', function (Request $request) {
        return redirect()->route('dashboard.role', ['role' => $request->user()->role]);
    })->name('dashboard');
    Route::get('/dashboard/{role}', function (Request $request, string $role) {
        if ($request->user()->role !== $role) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Dashboard', [
            'role' => $role,
            'username' => $request->user()->name,
        ]);
    })->whereIn('role', ['customer', 'clerk', 'admin', 'veterinarian', 'owner'])
        ->name('dashboard.role');
    Route::get('/customers', fn () => redirect()->route('dashboard'))->name('customers');
});
