<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Pet;
use App\Models\User;
use Database\Seeders\ClerkUpcomingAppointmentDemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AppointmentBookingTest extends TestCase
{
    use RefreshDatabase;

    private const SUPABASE = 'https://project.supabase.test';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.supabase.url' => self::SUPABASE,
            'services.supabase.secret_key' => 'sb_secret_test',
            'services.supabase.payment_proofs_bucket' => 'payment-proofs',
        ]);

        Http::fake([
            self::SUPABASE.'/storage/v1/object/sign/*' => Http::response(['signedURL' => '/object/sign/payment-proofs/x.png?token=abc']),
            self::SUPABASE.'/storage/v1/object/*' => Http::response(['Key' => 'ok']),
        ]);
    }

    public function test_demo_upcoming_appointment_is_visible_to_a_clerk(): void
    {
        $this->seed(ClerkUpcomingAppointmentDemoSeeder::class);
        $clerk = $this->makeUser('clerk');

        $this->actingAs($clerk)
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('upcomingAppointments', 1)
                ->where('upcomingAppointments.0.referenceNumber', '987654321')
                ->where('upcomingAppointments.0.owner', 'Demo Pet Owner')
                ->where('upcomingAppointments.0.pet', 'Buddy'));
    }

    public function test_customer_can_book_and_the_proof_is_uploaded_to_a_private_supabase_bucket(): void
    {
        $customer = $this->makeUser('customer');
        $pet = $this->makePet($customer);

        $this->actingAs($customer)
            ->post(route('appointments.store'), $this->bookingData($pet))
            ->assertRedirect(route('dashboard.role', ['role' => 'customer']));

        $appointment = Appointment::firstOrFail();
        $this->assertSame('Pending', $appointment->status);
        $this->assertSame('supabase', $appointment->proof_of_down_payment_disk);
        $this->assertSame('123456789', $appointment->reference_number);
        $this->assertMatchesRegularExpression('#^'.$customer->id.'/[0-9a-f]{32}\.png$#', $appointment->proof_of_down_payment_path);

        Http::assertSent(fn (HttpRequest $request) => $request->method() === 'POST'
            && $request->url() === self::SUPABASE.'/storage/v1/object/payment-proofs/'.$appointment->proof_of_down_payment_path
            && $request->hasHeader('apikey', 'sb_secret_test')
            && ! $request->hasHeader('Authorization'));
    }

    public function test_booking_fails_cleanly_when_supabase_rejects_the_upload(): void
    {
        Http::swap(new HttpFactory);
        Http::fake(['*' => Http::response(['error' => 'nope'], 500)]);
        $customer = $this->makeUser('customer');
        $pet = $this->makePet($customer);

        $this->actingAs($customer)
            ->post(route('appointments.store'), $this->bookingData($pet))
            ->assertSessionHasErrors('proof_of_down_payment');

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_customer_cannot_book_another_customers_pet(): void
    {
        $customer = $this->makeUser('customer');
        $otherPet = $this->makePet($this->makeUser('customer'));

        $this->actingAs($customer)
            ->post(route('appointments.store'), $this->bookingData($otherPet))
            ->assertSessionHasErrors('pet_id');

        $this->assertDatabaseCount('appointments', 0);
        Http::assertNothingSent();
    }

    public function test_booking_requires_proof_of_down_payment(): void
    {
        $customer = $this->makeUser('customer');
        $data = $this->bookingData($this->makePet($customer));
        unset($data['proof_of_down_payment']);

        $this->actingAs($customer)
            ->post(route('appointments.store'), $data)
            ->assertSessionHasErrors('proof_of_down_payment');

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_clerk_sees_reference_number_and_proof_url(): void
    {
        $appointment = $this->makeAppointment();

        $this->actingAs($this->makeUser('clerk'))
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('upcomingAppointments.0.referenceNumber', '555')
                ->where('upcomingAppointments.0.status', 'Pending')
                ->where('upcomingAppointments.0.proofUrl', route('appointments.proof', $appointment))
                ->where('upcomingAppointments.0.paymentAmount', 200));
    }

    public function test_clerk_and_booking_owner_can_view_proof_but_others_cannot(): void
    {
        $appointment = $this->makeAppointment();

        $this->actingAs($this->makeUser('clerk'))
            ->get(route('appointments.proof', $appointment))
            ->assertRedirect(self::SUPABASE.'/storage/v1/object/sign/payment-proofs/x.png?token=abc');

        $this->actingAs($appointment->user)
            ->get(route('appointments.proof', $appointment))
            ->assertRedirect();

        $this->actingAs($this->makeUser('customer'))
            ->get(route('appointments.proof', $appointment))
            ->assertForbidden();

        $this->actingAs($this->makeUser('veterinarian'))
            ->get(route('appointments.proof', $appointment))
            ->assertForbidden();
    }

    public function test_clerk_can_accept_and_vet_then_sees_the_appointment_with_pet_record(): void
    {
        $appointment = $this->makeAppointment();
        $clerk = $this->makeUser('clerk');
        $vet = $this->makeUser('veterinarian');

        $this->actingAs($vet)
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertInertia(fn (Assert $page) => $page->has('confirmedAppointments', 0));

        $this->actingAs($clerk)
            ->post(route('appointments.accept', $appointment))
            ->assertSessionHasNoErrors();

        $appointment->refresh();
        $this->assertSame('Confirmed', $appointment->status);
        $this->assertSame($clerk->id, $appointment->reviewed_by);

        $this->actingAs($vet)
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('confirmedAppointments', 1)
                ->where('confirmedAppointments.0.pet', 'Milo')
                ->has('patientRecords', 1)
                ->where('patientRecords.0.breed', 'Aspin')
                ->where('patientRecords.0.owner.name', $appointment->user->name)
                ->has('patientRecords.0.visits', 1)
                ->missing('confirmedAppointments.0.proofUrl')
                ->missing('confirmedAppointments.0.referenceNumber'));
    }

    public function test_clerk_cannot_accept_into_a_slot_that_is_already_confirmed(): void
    {
        $first = $this->makeAppointment(['status' => 'Confirmed']);
        $second = $this->makeAppointment(['reference_number' => '556', 'app_date_time' => $first->app_date_time]);

        $this->actingAs($this->makeUser('clerk'))
            ->post(route('appointments.accept', $second))
            ->assertSessionHasErrors('appointment');

        $this->assertSame('Pending', $second->fresh()->status);
    }

    public function test_clerk_must_give_a_reason_to_reject(): void
    {
        $appointment = $this->makeAppointment();
        $clerk = $this->makeUser('clerk');

        $this->actingAs($clerk)
            ->post(route('appointments.reject', $appointment), ['rejection_reason' => '  '])
            ->assertSessionHasErrors('rejection_reason');
        $this->assertSame('Pending', $appointment->fresh()->status);

        $reason = 'Proof of payment is unclear / blurry — the reference number is not visible.';
        $this->actingAs($clerk)
            ->post(route('appointments.reject', $appointment), ['rejection_reason' => $reason])
            ->assertSessionHasNoErrors();

        $appointment->refresh();
        $this->assertSame('Rejected', $appointment->status);
        $this->assertSame($reason, $appointment->rejection_reason);

        $this->actingAs($appointment->user)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('customerAppointments.0.status', 'Rejected')
                ->where('customerAppointments.0.rejectionReason', $reason));
    }

    public function test_reviewed_appointments_cannot_be_reviewed_again(): void
    {
        $appointment = $this->makeAppointment(['status' => 'Rejected', 'rejection_reason' => 'Payment was not received']);
        $clerk = $this->makeUser('clerk');

        $this->actingAs($clerk)->post(route('appointments.accept', $appointment))->assertSessionHasErrors('appointment');
        $this->actingAs($clerk)->post(route('appointments.reject', $appointment), ['rejection_reason' => 'Something else'])->assertSessionHasErrors('appointment');
        $this->assertSame('Payment was not received', $appointment->fresh()->rejection_reason);
    }

    public function test_only_clerks_can_accept_or_reject(): void
    {
        $appointment = $this->makeAppointment();

        foreach (['customer', 'veterinarian'] as $role) {
            $user = $this->makeUser($role);
            $this->actingAs($user)->post(route('appointments.accept', $appointment))->assertForbidden();
            $this->actingAs($user)->post(route('appointments.reject', $appointment), ['rejection_reason' => 'Not allowed here'])->assertForbidden();
        }

        $this->assertSame('Pending', $appointment->fresh()->status);
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

    /** @param array<string, mixed> $overrides */
    private function makeAppointment(array $overrides = []): Appointment
    {
        $owner = $this->makeUser('customer');

        return Appointment::create([
            'ar_first_name' => 'Jamie',
            'ar_last_name' => 'Sample',
            'pet_id' => $this->makePet($owner)->petID,
            'service_type' => 'Advanced Diagnosis',
            'notes' => 'Limping',
            'app_date_time' => now()->addDays(2)->setTime(10, 0),
            'proof_of_down_payment_path' => $owner->id.'/receipt.png',
            'proof_of_down_payment_disk' => 'supabase',
            'reference_number' => '555',
            'status' => 'Pending',
            'user_id' => $owner->id,
            ...$overrides,
        ]);
    }

    private function bookingData(Pet $pet): array
    {
        return [
            'ar_first_name' => 'Jamie',
            'ar_last_name' => 'Sample',
            'pet_id' => $pet->petID,
            'service_type' => 'Advanced Diagnosis',
            'notes' => 'Wellness check',
            'app_date_time' => now()->addDay()->setTime(10, 0)->toDateTimeString(),
            'terms_accepted' => '1',
            'reference_number' => '123456789',
            'proof_of_down_payment' => UploadedFile::fake()->createWithContent('receipt.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')),
        ];
    }
}
