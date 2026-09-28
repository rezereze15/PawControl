<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'landingpage')->name('home');
Route::inertia('/login', 'Login')->name('login');
Route::inertia('/register', 'Register')->name('register');
Route::inertia('/customers', 'Customers')->name('customers');
Route::get('/dashboard/{role}', fn (string $role) => Inertia::render('Dashboard', ['role' => $role]))
    ->whereIn('role', ['customer', 'clerk', 'admin', 'veterinarian', 'owner'])
    ->name('dashboard.role');
