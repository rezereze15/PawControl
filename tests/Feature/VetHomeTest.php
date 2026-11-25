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

    private function visit(string $petName, CarbonInterface $at, string $appointmentStatus = 'Confirmed', ?string $recordStatus = 'Upcoming', ?CarbonInterface $recordCreatedAt = null, ?User $handledBy = null): Appointment
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
            $record->forceFill([
                'status' => $recordStatus,
                'created_at' => $recordCreatedAt ?? now(),
                'veterinarian_id' => $handledBy?->id,
            ])->save();
        }

        return $appointment;
    }

    public function test_home_numbers_and_lists_come_from_the_database(): void
    {
        $vet = $this->vet();
        $otherVet = $this->vet();
        $this->visit('Milo', now()->setTime(8, 0), recordStatus: 'Ongoing', handledBy: $vet);        // today, in progress, mine
        $this->visit('Luna', now()->setTime(10, 0));                                     // today, not started
        $this->visit('Rex', now()->setTime(7, 0), recordStatus: 'Completed', handledBy: $otherVet); // today, done, another vet's
        $this->visit('Bantay', now()->addDay()->setTime(11, 0));                         // tomorrow
        $this->visit('Old', now()->subMonth(), recordStatus: 'Ongoing', recordCreatedAt: now()->subMonth(), handledBy: $vet); // left open last month, mine
        $this->visit('Waiting', now()->addDays(2), 'Pending', recordStatus: null);      // not accepted: no record

        $this->actingAs($vet)
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
                ->where('vetHome.myOperationsToday', 1)        // Milo only: Rex is another vet's, Old isn't today
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
                ->where('vetHome.myOperationsToday', 0)
                ->where('vetHome.activeDiagnoses', 0)
                ->where('confirmedAppointments', [])
                ->where('patientRecords', []));
    }

    public function test_appointments_module_lists_only_todays_accepted_appointments_by_clinic_date(): void
    {
        // 8 PM UTC on Nov 25 is already 4 AM on Nov 26 at the clinic (Asia/Manila).
        config(['app.clinic_timezone' => 'Asia/Manila']);
        $this->travelTo('2026-11-25 20:00:00');
        $vet = $this->vet();

        $this->visit('Today', now()->setDate(2026, 11, 26)->setTime(10, 0));                       // clinic today, accepted
        $this->visit('Later', now()->setDate(2026, 11, 26)->setTime(15, 0));                       // clinic today, accepted
        $this->visit('UtcToday', now()->setDate(2026, 11, 25)->setTime(15, 0));                    // clinic yesterday
        $this->visit('Tomorrow', now()->setDate(2026, 11, 27)->setTime(9, 0));                     // clinic tomorrow
        $this->visit('Pending', now()->setDate(2026, 11, 26)->setTime(11, 0), 'Pending', recordStatus: null); // not accepted

        $this->actingAs($vet)
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('clinicToday', '2026-11-26')
                ->has('todaysAppointments', 2)
                ->where('todaysAppointments.0.pet', 'Today')
                ->where('todaysAppointments.1.pet', 'Later'));
    }

    public function test_appointments_module_is_empty_when_nothing_is_accepted_for_today(): void
    {
        $this->visit('Tomorrow', now()->addDay()->setTime(10, 0));
        $this->visit('Waiting', now()->setTime(11, 0), 'Pending', recordStatus: null);

        $this->actingAs($this->vet())
            ->get(route('dashboard.role', ['role' => 'veterinarian']))
            ->assertInertia(fn (Assert $page) => $page->has('todaysAppointments', 0));
    }
}
