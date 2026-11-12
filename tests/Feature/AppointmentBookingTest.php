<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Pet;
use App\Models\User;
use Database\Seeders\ClerkUpcomingAppointmentDemoSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AppointmentBookingTest extends TestCase
{
    public function test_demo_upcoming_appointment_is_visible_to_a_clerk(): void
    {
        $this->seed(ClerkUpcomingAppointmentDemoSeeder::class);
        $clerk = $this->makeUser('clerk');

        $this->actingAs($clerk)
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('upcomingAppointments', 1)
                ->where('upcomingAppointments.0.referenceNumber', 987654321)
                ->where('upcomingAppointments.0.owner', 'Demo Pet Owner')
                ->where('upcomingAppointments.0.pet', 'Buddy'));
    }

    public function test_customer_can_add_a_pet_for_booking(): void
    {
        $customer = $this->makeUser('customer');

        $this->actingAs($customer)
            ->post(route('pets.store'), [
                'petName' => 'Milo',
                'species' => 'Dog',
                'breed' => 'Aspin',
                'age' => 3,
            ])
            ->assertRedirect(route('dashboard.role', ['role' => 'customer']));

        $this->assertDatabaseHas('pets', [
            'petName' => 'Milo',
            'petOwnerID' => $customer->id,
        ]);

        $this->actingAs($customer)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('pets.0.name', 'Milo'));
    }

    public function test_customer_can_book_an_appointment_with_a_pet_they_own(): void
    {
        Storage::fake('local');
        $customer = $this->makeUser('customer');
        $pet = $this->makePet($customer);

        $response = $this->actingAs($customer)->post(route('appointments.store'), $this->bookingData($pet));

        $response->assertRedirect(route('dashboard.role', ['role' => 'customer']));
        $this->assertDatabaseHas('appointments', [
            'pet_id' => $pet->petID,
            'user_id' => $customer->id,
            'status' => 'Pending',
            'notes' => 'Wellness check',
        ]);

        $appointment = Appointment::firstOrFail();
        Storage::disk('local')->assertExists($appointment->proof_of_down_payment_path);
        $this->assertNotEmpty($appointment->reference_number);
    }

    public function test_customer_cannot_book_another_customers_pet(): void
    {
        Storage::fake('local');
        $customer = $this->makeUser('customer');
        $otherCustomer = $this->makeUser('customer');
        $otherPet = $this->makePet($otherCustomer);

        $this->actingAs($customer)
            ->post(route('appointments.store'), $this->bookingData($otherPet))
            ->assertSessionHasErrors('pet_id');

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_customer_cannot_book_a_past_appointment_date(): void
    {
        Storage::fake('local');
        $customer = $this->makeUser('customer');
        $pet = $this->makePet($customer);
        $data = $this->bookingData($pet);
        $data['app_date_time'] = now()->subDay()->toDateTimeString();

        $this->actingAs($customer)
            ->post(route('appointments.store'), $data)
            ->assertSessionHasErrors('app_date_time');

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_booking_requires_proof_of_down_payment(): void
    {
        Storage::fake('local');
        $customer = $this->makeUser('customer');
        $pet = $this->makePet($customer);
        $data = $this->bookingData($pet);
        unset($data['proof_of_down_payment']);

        $this->actingAs($customer)
            ->post(route('appointments.store'), $data)
            ->assertSessionHasErrors('proof_of_down_payment');

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_booking_appears_on_the_clerk_upcoming_appointments_page(): void
    {
        Storage::fake('local');
        $customer = $this->makeUser('customer');
        $clerk = $this->makeUser('clerk');
        $pet = $this->makePet($customer);

        $bookingResponse = $this->actingAs($customer)
            ->post(route('appointments.store'), $this->bookingData($pet));
        $bookingResponse->assertRedirect(route('dashboard.role', ['role' => 'customer']));
        $referenceNumber = Appointment::firstOrFail()->reference_number;

        $this->actingAs($clerk)
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->component('Dashboard')
                ->has('upcomingAppointments', 1)
                ->where('upcomingAppointments.0.referenceNumber', $referenceNumber)
                ->where('upcomingAppointments.0.owner', $customer->name)
                ->where('upcomingAppointments.0.pet', $pet->petName));
    }

    private function makeUser(string $role): User
    {
        return User::factory()->create([
            'role' => $role,
            'status' => 'Active',
        ]);
    }

    private function makePet(User $owner): Pet
    {
        return Pet::create([
            'petName' => 'Milo',
            'species' => 'Dog',
            'breed' => 'Aspin',
            'age' => 3,
            'petOwnerID' => $owner->id,
        ]);
    }

    private function bookingData(Pet $pet): array
    {
        return [
            'ar_first_name' => 'Jamie',
            'ar_last_name' => 'Sample',
            'pet_id' => $pet->petID,
            'notes' => 'Wellness check',
            'app_date_time' => now()->addDay()->setTime(10, 0)->toDateTimeString(),
            'proof_of_down_payment' => UploadedFile::fake()->create('receipt.pdf', 10, 'application/pdf'),
        ];
    }
}
