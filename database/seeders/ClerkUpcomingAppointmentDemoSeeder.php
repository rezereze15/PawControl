<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class ClerkUpcomingAppointmentDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) {
            throw new RuntimeException('Demo appointment data can only be seeded outside production.');
        }

        $customer = User::firstOrCreate(
            ['email' => 'demo.owner@example.test'],
            [
                'name' => 'Demo Pet Owner',
                'username' => 'demo-pet-owner',
                'password' => Hash::make('password'),
                'phone' => '09170000000',
                'address' => 'Demo Address',
                'role' => 'customer',
                'status' => 'Active',
            ],
        );

        $pet = Pet::firstOrCreate(
            [
                'petOwnerID' => $customer->getAuthIdentifier(),
                'petName' => 'Buddy',
            ],
            [
                'species' => 'Dog',
                'breed' => 'Aspin',
                'age' => 3,
                'sex' => 'Male',
                'weight' => 8.50,
            ],
        );

        Appointment::firstOrCreate(
            ['reference_number' => 987654321],
            [
                'ar_first_name' => 'Demo',
                'ar_last_name' => 'Owner',
                'pet_id' => $pet->petID,
                'notes' => 'Wellness check',
                'app_date_time' => now()->addDays(7)->startOfDay()->setTime(10, 30),
                'proof_of_down_payment_path' => 'demo/placeholder-receipt.pdf',
                'status' => 'Pending',
                'user_id' => $customer->getAuthIdentifier(),
            ],
        );
    }
}
