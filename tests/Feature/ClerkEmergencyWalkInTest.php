<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Clerk-only emergency walk-ins: pet + visit created on the owner's behalf. */
class ClerkEmergencyWalkInTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-11-24 14:30:00');
    }

    private function clerk(): User
    {
        return User::factory()->create(['role' => 'clerk', 'status' => 'Active']);
    }

    private function customer(array $attributes = []): User
    {
        return User::factory()->create(['role' => 'customer', 'status' => 'Active', ...$attributes]);
    }

    /** @return array<string, mixed> */
    private function petFields(array $overrides = []): array
    {
        return [
            'petName' => 'Bantay',
            'species' => 'Dog',
            'breed' => 'Aspin',
            'sex' => 'Male',
            'age' => 4,
            'weight' => '12.5',
            'notes' => 'Hit by a motorcycle, bleeding from the left hind leg.',
            ...$overrides,
        ];
    }

    public function test_clerk_creates_walk_in_for_owner_without_account(): void
    {
        $clerk = $this->clerk();

        $this->actingAs($clerk)
            ->post(route('clerk.emergency.store'), $this->petFields([
                'owner_type' => 'walk_in',
                'walk_in_owner_name' => 'Maria Dela Cruz',
                'walk_in_owner_phone' => '0917 123 4567',
            ]))
            ->assertRedirect()
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $pet = Pet::sole();
        $this->assertNull($pet->petOwnerID);
        $this->assertSame('Maria Dela Cruz', $pet->walk_in_owner_name);
        $this->assertSame('0917 123 4567', $pet->walk_in_owner_phone);
        $this->assertSame(4, $pet->age);

        $appointment = Appointment::sole();
        $this->assertSame($pet->petID, $appointment->pet_id);
        $this->assertNull($appointment->user_id);
        $this->assertTrue($appointment->is_emergency);
        $this->assertSame($clerk->id, $appointment->created_by);
        $this->assertSame($clerk->id, $appointment->reviewed_by);
        $this->assertSame(Appointment::STATUS_CONFIRMED, $appointment->status);
        $this->assertSame(Appointment::EMERGENCY_SERVICE, $appointment->service_type);
        $this->assertSame('Maria Dela', $appointment->ar_first_name);
        $this->assertSame('Cruz', $appointment->ar_last_name);
        $this->assertNull($appointment->proof_of_down_payment_path);
        $this->assertStringStartsWith('EMR-261124-', $appointment->reference_number);
        $this->assertTrue($appointment->app_date_time->equalTo(now()));
    }

    public function test_clerk_attaches_walk_in_to_existing_owner_account(): void
    {
        $owner = $this->customer(['name' => 'Juan Santos', 'phone' => '09181112222']);

        $this->actingAs($this->clerk())
            ->post(route('clerk.emergency.store'), $this->petFields([
                'owner_type' => 'existing',
                'owner_id' => $owner->id,
            ]))
            ->assertSessionHasNoErrors();

        $pet = Pet::sole();
        $this->assertSame($owner->id, $pet->petOwnerID);
        $this->assertNull($pet->walk_in_owner_name);
        $this->assertSame($owner->id, Appointment::sole()->user_id);

        // It shows up in the owner's own account (pets + appointments).
        $this->actingAs($owner)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('pets.0.name', 'Bantay')
                ->where('customerAppointments.0.serviceType', 'Emergency')
                ->where('customerAppointments.0.status', 'Confirmed'));
    }

    public function test_walk_in_appears_in_veterinarian_queue_and_records_immediately(): void
    {
        $this->actingAs($this->clerk())->post(route('clerk.emergency.store'), $this->petFields([
            'owner_type' => 'walk_in',
            'walk_in_owner_name' => 'Maria Dela Cruz',
            'walk_in_owner_phone' => '09171234567',
        ]));
        $appointment = Appointment::sole();

        $this->actingAs(User::factory()->create(['role' => 'veterinarian', 'status' => 'Active']))
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('confirmedAppointments', 1)
                ->where('confirmedAppointments.0.id', $appointment->id)
                ->where('confirmedAppointments.0.pet', 'Bantay')
                ->where('confirmedAppointments.0.owner', 'Maria Dela Cruz')
                ->where('confirmedAppointments.0.phone', '09171234567')
                ->where('confirmedAppointments.0.type', 'Emergency')
                ->where('confirmedAppointments.0.isEmergency', true)
                ->where('confirmedAppointments.0.isWalkIn', true)
                ->has('patientRecords', 1)
                ->where('patientRecords.0.owner.name', 'Maria Dela Cruz')
                ->where('patientRecords.0.isWalkIn', true)
                ->where('patientRecords.0.visits.0.notes', 'Hit by a motorcycle, bleeding from the left hind leg.')
                ->where('patientRecords.0.visits.0.isEmergency', true));
    }

    public function test_clerk_dashboard_lists_walk_in_with_emergency_tag(): void
    {
        $clerk = $this->clerk();
        $this->actingAs($clerk)->post(route('clerk.emergency.store'), $this->petFields([
            'owner_type' => 'walk_in',
            'walk_in_owner_name' => 'Maria Dela Cruz',
            'walk_in_owner_phone' => '09171234567',
        ]));

        $this->actingAs($clerk)
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('upcomingAppointments.0.owner', 'Maria Dela Cruz')
                ->where('upcomingAppointments.0.isEmergency', true)
                ->where('upcomingAppointments.0.createdBy', $clerk->name)
                ->where('upcomingAppointments.0.paymentAmount', 0)
                ->where('upcomingAppointments.0.proofUrl', null)
                ->where('clerkHome.downPaymentsReceived', 0)
                ->where('clerkHome.totalPatients', 1));
    }

    public function test_only_clerks_can_create_emergency_walk_ins(): void
    {
        $payload = $this->petFields(['owner_type' => 'walk_in', 'walk_in_owner_name' => 'A B', 'walk_in_owner_phone' => '09171234567']);

        foreach (['customer', 'veterinarian', 'admin', 'owner'] as $role) {
            $this->actingAs(User::factory()->create(['role' => $role, 'status' => 'Active']))
                ->post(route('clerk.emergency.store'), $payload)
                ->assertForbidden();

            $this->get(route('clerk.emergency.owners', ['search' => 'an']))->assertForbidden();
        }

        $this->assertDatabaseCount('pets', 0);
        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->post(route('clerk.emergency.store'), [])->assertRedirect(route('login'));
    }

    public function test_validation_requires_pet_details_and_symptoms(): void
    {
        $this->actingAs($this->clerk())
            ->post(route('clerk.emergency.store'), [
                'owner_type' => 'walk_in',
                'walk_in_owner_name' => 'Maria',
                'walk_in_owner_phone' => '09171234567',
                'petName' => '  ',
                'species' => 'Dragon',
                'notes' => '',
            ])
            ->assertSessionHasErrors(['petName', 'species', 'breed', 'notes']);

        $this->assertDatabaseCount('pets', 0);
    }

    public function test_walk_in_owner_requires_name_and_valid_contact_number(): void
    {
        $this->actingAs($this->clerk())
            ->post(route('clerk.emergency.store'), $this->petFields(['owner_type' => 'walk_in', 'walk_in_owner_phone' => 'call me']))
            ->assertSessionHasErrors(['walk_in_owner_name', 'walk_in_owner_phone']);

        $this->assertDatabaseCount('pets', 0);
    }

    public function test_existing_owner_must_be_an_active_pet_owner(): void
    {
        $clerk = $this->clerk();

        $this->actingAs($clerk)
            ->post(route('clerk.emergency.store'), $this->petFields(['owner_type' => 'existing']))
            ->assertSessionHasErrors('owner_id');

        foreach ([$this->customer(['status' => 'Inactive']), User::factory()->create(['role' => 'veterinarian', 'status' => 'Active'])] as $notAllowed) {
            $this->actingAs($clerk)
                ->post(route('clerk.emergency.store'), $this->petFields(['owner_type' => 'existing', 'owner_id' => $notAllowed->id]))
                ->assertSessionHasErrors('owner_id');
        }

        $this->assertDatabaseCount('pets', 0);
    }

    public function test_owner_search_returns_only_active_pet_owners(): void
    {
        $match = $this->customer(['name' => 'Juana Reyes', 'email' => 'juana@example.com', 'phone' => '09170000001']);
        Pet::create(['petName' => 'Mingming', 'species' => 'Cat', 'breed' => 'Puspin', 'petOwnerID' => $match->id]);
        $this->customer(['name' => 'Juan Inactive', 'status' => 'Inactive']);
        User::factory()->create(['name' => 'Juan Vet', 'role' => 'veterinarian', 'status' => 'Active']);
        $this->customer(['name' => 'Pedro Cruz']);

        $this->actingAs($this->clerk())
            ->getJson(route('clerk.emergency.owners', ['search' => 'JUAN']))
            ->assertOk()
            ->assertJsonCount(1, 'owners')
            ->assertJsonPath('owners.0.id', $match->id)
            ->assertJsonPath('owners.0.petCount', 1);

        $this->getJson(route('clerk.emergency.owners', ['search' => '0917000']))
            ->assertJsonPath('owners.0.id', $match->id);

        // Too short to search.
        $this->getJson(route('clerk.emergency.owners', ['search' => 'j']))
            ->assertExactJson(['owners' => []]);
    }

    public function test_emergency_walk_in_does_not_block_an_online_booking_slot(): void
    {
        $this->travelTo('2026-11-24 10:00:00');
        $this->actingAs($this->clerk())->post(route('clerk.emergency.store'), $this->petFields([
            'owner_type' => 'walk_in', 'walk_in_owner_name' => 'Maria', 'walk_in_owner_phone' => '09171234567',
        ]));

        $this->actingAs($this->customer())
            ->getJson(route('appointments.availability', ['month' => '2026-11']))
            ->assertExactJson(['confirmedSlots' => []]);
    }
}
