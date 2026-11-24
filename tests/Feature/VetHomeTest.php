<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\MedicalRecord;
use App\Models\Pet;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** The veterinarian home cards and lists come from the database, with empty states. */
class VetHomeTest extends TestCase
{
    use RefreshDatabase;

    private int $reference = 7000;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-11-26 09:00:00');
    }

    private function vet(): User
    {
        return User::factory()->create(['role' => 'veterinarian', 'status' => 'Active']);
    }

    private function visit(string $petName, CarbonInterface $at, string $appointmentStatus = 'Confirmed', ?string $recordStatus = 'Upcoming', ?CarbonInterface $recordCreatedAt = null): Appointment
    {
        $owner = User::factory()->create(['role' => 'customer', 'status' => 'Active']);
        $pet = Pet::create(['petName' => $petName, 'species' => 'Dog', 'breed' => 'Aspin', 'age' => 2, 'petOwnerID' => $owner->id]);
        $appointment = Appointment::create([
            'ar_first_name' => 'A', 'ar_last_name' => 'B', 'pet_id' => $pet->petID, 'service_type' => 'Consultation',
            'app_date_time' => $at, 'reference_number' => (string) $this->reference++, 'status' => $appointmentStatus,
            'user_id' => $owner->id,
        ]);

        if ($recordStatus) {
            $record = MedicalRecord::forAcceptedAppointment($appointment, null);
            $record->forceFill(['status' => $recordStatus, 'created_at' => $recordCreatedAt ?? now()])->save();
        }

        return $appointment;
    }

    public function test_home_numbers_and_lists_come_from_the_database(): void
    {
        $this->visit('Milo', now()->setTime(8, 0), recordStatus: 'Ongoing');          // today, in progress
        $this->visit('Luna', now()->setTime(10, 0));                                     // today, not started
        $this->visit('Rex', now()->setTime(7, 0), recordStatus: 'Completed');          // today, done
        $this->visit('Bantay', now()->addDay()->setTime(11, 0));                         // tomorrow
        $this->visit('Old', now()->subMonth(), recordStatus: 'Ongoing', recordCreatedAt: now()->subMonth()); // left open last month
        $this->visit('Waiting', now()->addDays(2), 'Pending', recordStatus: null);      // not accepted: no record

        $this->actingAs($this->vet())
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('vetHome.today', '2026-11-26')
                ->where('vetHome.tomorrow', '2026-11-27')
                ->where('vetHome.totalPatients', 5)            // pets with a medical record
                ->where('vetHome.newPatientsThisMonth', 4)     // Old's first record was last month
                ->where('vetHome.upcomingAppointments', 4)     // confirmed from today on
                ->where('vetHome.appointmentsToday', 3)
                ->where('vetHome.operationsToday', 3)
                ->where('vetHome.ongoingToday', 1)
                ->where('vetHome.completedToday', 1)
                ->where('vetHome.activeDiagnoses', 2)          // Milo + Old
                ->has('confirmedAppointments', 4)
                ->where('confirmedAppointments.0.pet', 'Rex')
                ->where('confirmedAppointments.0.day', '2026-11-26')
                ->where('confirmedAppointments.0.breed', 'Aspin')
                ->where('confirmedAppointments.0.petAge', 2)
                ->where('confirmedAppointments.0.visitStatus', 'Completed')
                ->where('confirmedAppointments.3.day', '2026-11-27'));
    }

    public function test_empty_database_gives_zeros_not_errors(): void
    {
        $this->actingAs($this->vet())
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('vetHome.totalPatients', 0)
                ->where('vetHome.newPatientsThisMonth', 0)
                ->where('vetHome.upcomingAppointments', 0)
                ->where('vetHome.operationsToday', 0)
                ->where('vetHome.activeDiagnoses', 0)
                ->where('confirmedAppointments', [])
                ->where('patientRecords', []));
    }
}
