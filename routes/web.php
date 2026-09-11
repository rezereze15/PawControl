<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'landingpage')->name('home');
Route::inertia('/login', 'Login')->name('login');
Route::inertia('/register', 'Register')->name('register');
Route::inertia('/customers', 'Customers')->name('customers');
