<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** Accepting an appointment creates the pet's medical record, shown to vets and to the pet's owner. */
class MedicalRecordTest extends TestCase
{
    use RefreshDatabase;

    private int $reference = 5000;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.supabase.url' => 'https://project.supabase.test',
            'services.supabase.secret_key' => 'sb_secret_test',
            'services.supabase.payment_proofs_bucket' => 'payment-proofs',
        ]);
        Http::fake(['*' => Http::response(['signedURL' => '/object/sign/payment-proofs/x.png?token=abc'])]);
        Mail::fake();

        $this->travelTo('2026-11-25 09:00:00');
    }

    private function user(string $role, array $attributes = []): User
    {
        return User::factory()->create(['role' => $role, 'status' => 'Active', ...$attributes]);
    }

    private function pet(User $owner, string $name): Pet
    {
        return Pet::create(['petName' => $name, 'species' => 'Dog', 'breed' => 'Aspin', 'age' => 3, 'petOwnerID' => $owner->id]);
    }

    private function appointment(Pet $pet, string $status = Appointment::STATUS_PENDING, ?string $at = '2026-11-26 10:00:00'): Appointment
    {
        return Appointment::create([
            'ar_first_name' => 'Jamie',
            'ar_last_name' => 'Sample',
            'pet_id' => $pet->petID,
            'service_type' => 'Consultation',
            'notes' => 'Limping on the front leg',
            'app_date_time' => $at,
            'proof_of_down_payment_path' => $pet->petOwnerID.'/receipt.png',
            'proof_of_down_payment_disk' => 'supabase',
            'reference_number' => (string) $this->reference++,
            'status' => $status,
            'user_id' => $pet->petOwnerID,
        ]);
    }

    public function test_accepting_an_appointment_creates_its_medical_record(): void
    {
        $clerk = $this->user('clerk');
        $appointment = $this->appointment($this->pet($this->user('customer'), 'Milo'));

        $this->assertDatabaseCount('medical_records', 0);

        $this->actingAs($clerk)
            ->post(route('appointments.accept', $appointment))
            ->assertSessionHasNoErrors();

        $record = MedicalRecord::sole();
        $this->assertSame($appointment->id, $record->appointment_id);
        $this->assertSame($appointment->pet_id, $record->pet_id);
        $this->assertSame($clerk->id, $record->created_by);
        $this->assertSame('Consultation', $record->service_type);
        $this->assertSame('Limping on the front leg', $record->chief_complaint);
        $this->assertTrue($record->visit_date->equalTo($appointment->app_date_time));
        $this->assertNull($record->diagnosis);
        $this->assertSame($record->id, $appointment->fresh()->medicalRecord->id);
    }

    public function test_accepting_twice_or_rejecting_never_adds_records(): void
    {
        $clerk = $this->user('clerk');
        $owner = $this->user('customer');
        $accepted = $this->appointment($this->pet($owner, 'Milo'));
        $rejected = $this->appointment($this->pet($owner, 'Luna'), at: '2026-11-26 11:00:00');

        $this->actingAs($clerk)->post(route('appointments.accept', $accepted));
        $this->actingAs($clerk)->post(route('appointments.accept', $accepted))
            ->assertSessionHasErrors('appointment');
        $this->actingAs($clerk)->post(route('appointments.reject', $rejected), ['rejection_reason' => 'Payment was not received']);

        $this->assertDatabaseCount('medical_records', 1);
        $this->assertDatabaseMissing('medical_records', ['appointment_id' => $rejected->id]);
    }

    public function test_failed_accept_creates_no_record(): void
    {
        $clerk = $this->user('clerk');
        $owner = $this->user('customer');
        $this->appointment($this->pet($owner, 'Milo'), Appointment::STATUS_CONFIRMED);
        $sameSlot = $this->appointment($this->pet($owner, 'Luna'));

        $this->actingAs($clerk)
            ->post(route('appointments.accept', $sameSlot))
            ->assertSessionHasErrors('appointment');

        $this->assertDatabaseMissing('medical_records', ['appointment_id' => $sameSlot->id]);
    }

    public function test_emergency_walk_in_gets_a_medical_record_immediately(): void
    {
        $clerk = $this->user('clerk');

        $this->actingAs($clerk)->post(route('clerk.emergency.store'), [
            'petName' => 'Bantay', 'species' => 'Dog', 'breed' => 'Aspin',
            'notes' => 'Seizures since this morning',
            'owner_type' => 'walk_in', 'walk_in_owner_name' => 'Maria Cruz', 'walk_in_owner_phone' => '09171234567',
        ])->assertSessionHasNoErrors();

        $record = MedicalRecord::sole();
        $this->assertSame(Appointment::sole()->id, $record->appointment_id);
        $this->assertSame('Emergency', $record->service_type);
        $this->assertSame('Seizures since this morning', $record->chief_complaint);
        $this->assertSame($clerk->id, $record->created_by);
    }

    public function test_veterinarian_sees_every_medical_record(): void
    {
        $clerk = $this->user('clerk');
        $ana = $this->user('customer', ['name' => 'Ana Reyes']);
        $ben = $this->user('customer', ['name' => 'Ben Cruz']);
        $milo = $this->appointment($this->pet($ana, 'Milo'));
        $rex = $this->appointment($this->pet($ben, 'Rex'), at: '2026-11-26 11:00:00');
        $this->appointment($this->pet($ben, 'StillPending'), at: '2026-11-26 12:00:00');

        $this->actingAs($clerk)->post(route('appointments.accept', $milo));
        $this->actingAs($clerk)->post(route('appointments.accept', $rex));
        $miloRecord = MedicalRecord::query()->where('appointment_id', $milo->id)->sole();

        $this->actingAs($this->user('veterinarian'))
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('patientRecords', 2)
                ->where('patientRecords', fn ($patients) => collect($patients)->pluck('name')->sort()->values()->all() === ['Milo', 'Rex'])
                ->where('patientRecords', function ($patients) use ($milo, $miloRecord) {
                    $visit = collect($patients)->firstWhere('name', 'Milo')['visits'][0];

                    return $visit['id'] === $miloRecord->id
                        && $visit['appointmentId'] === $milo->id
                        && $visit['recordNumber'] === $miloRecord->number()
                        && $visit['notes'] === 'Limping on the front leg'
                        && $visit['status'] === 'Confirmed';
                }));
    }

    public function test_clerk_sees_the_records_created_by_accepting(): void
    {
        $clerk = $this->user('clerk');
        $appointment = $this->appointment($this->pet($this->user('customer'), 'Milo'));

        $this->actingAs($clerk)->post(route('appointments.accept', $appointment));

        $this->actingAs($clerk)
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('patientRecords', 1)
                ->where('patientRecords.0.name', 'Milo')
                ->where('patientRecords.0.visits.0.appointmentId', $appointment->id)
                ->where('patientRecords.0.visits.0.createdBy', $clerk->name));
    }

    public function test_pet_owner_sees_only_their_own_pets_records(): void
    {
        $clerk = $this->user('clerk');
        $ana = $this->user('customer');
        $ben = $this->user('customer');
        $anaPet = $this->pet($ana, 'Milo');
        $first = $this->appointment($anaPet, at: '2026-11-26 10:00:00');
        $second = $this->appointment($anaPet, at: '2026-11-27 10:00:00');
        $benVisit = $this->appointment($this->pet($ben, 'Rex'), at: '2026-11-26 11:00:00');

        foreach ([$first, $second, $benVisit] as $appointment) {
            $this->actingAs($clerk)->post(route('appointments.accept', $appointment));
        }

        $this->actingAs($ana)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('medicalRecords', 1)
                ->where('medicalRecords.0.name', 'Milo')
                ->has('medicalRecords.0.visits', 2)
                // Newest first.
                ->where('medicalRecords.0.visits.0.appointmentId', $second->id)
                ->where('medicalRecords.0.visits.1.appointmentId', $first->id));

        $this->actingAs($ben)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('medicalRecords', 1)
                ->where('medicalRecords.0.name', 'Rex'));
    }

    public function test_owner_sees_records_of_their_pet_booked_by_someone_else(): void
    {
        // Ownership is by pet, not by who booked: an emergency walk-in the clerk attached
        // to an existing account shows in that owner's records.
        $owner = $this->user('customer', ['name' => 'Juan Santos']);

        $this->actingAs($this->user('clerk'))->post(route('clerk.emergency.store'), [
            'petName' => 'Bantay', 'species' => 'Dog', 'breed' => 'Aspin', 'notes' => 'Vomiting',
            'owner_type' => 'existing', 'owner_id' => $owner->id,
        ]);

        $this->actingAs($owner)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('medicalRecords.0.name', 'Bantay')
                ->where('medicalRecords.0.visits.0.isEmergency', true));
    }

    public function test_pet_owner_without_accepted_appointments_has_no_records(): void
    {
        $ana = $this->user('customer');
        $this->appointment($this->pet($ana, 'Milo'));

        $this->actingAs($ana)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn (Assert $page) => $page->where('medicalRecords', []));
    }

    public function test_only_clerks_can_accept_and_create_records(): void
    {
        $appointment = $this->appointment($this->pet($this->user('customer'), 'Milo'));

        foreach (['customer', 'veterinarian', 'admin', 'owner'] as $role) {
            $this->actingAs($this->user($role))
                ->post(route('appointments.accept', $appointment))
                ->assertForbidden();
        }

        $this->assertDatabaseCount('medical_records', 0);
    }

    public function test_other_roles_do_not_receive_medical_records_prop(): void
    {
        foreach (['clerk', 'admin', 'owner'] as $role) {
            $this->actingAs($this->user($role))
                ->get(route('dashboard.role', ['role' => $role]))
                ->assertInertia(fn (Assert $page) => $page->missing('medicalRecords'));
        }
    }
}
