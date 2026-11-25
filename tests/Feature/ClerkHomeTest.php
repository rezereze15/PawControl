<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Pet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** The clerk home cards (Total Patients, Appointments, Upcoming Billing, Today / Next Day). */
class ClerkHomeTest extends TestCase
{
    use RefreshDatabase;

    private int $reference = 1000;

    protected function setUp(): void
    {
        parent::setUp();

        // Proof URLs are signed by Supabase; fake it so the dashboard can build them.
        config([
            'services.supabase.url' => 'https://project.supabase.test',
            'services.supabase.secret_key' => 'sb_secret_test',
            'services.supabase.payment_proofs_bucket' => 'payment-proofs',
        ]);
        Http::fake(['*' => Http::response(['signedURL' => '/object/sign/payment-proofs/x.png?token=abc'])]);

        // Fixed clock: mid-morning, mid-month.
        $this->travelTo('2026-11-15 09:00:00');
    }

    public function test_clerk_home_shows_live_numbers_and_today_tomorrow_lists(): void
    {
        $owner = User::factory()->create(['role' => 'customer', 'status' => 'Active']);
        $milo = $this->pet($owner, 'Milo');
        $luna = $this->pet($owner, 'Luna');
        $rex = $this->pet($owner, 'Rex');
        $this->pet($owner, 'NeverBooked'); // counts as a patient, not as "new this month"

        // Rex was first booked last month (not new this month).
        $this->appointment($rex, now()->subMonth(), 'Confirmed', createdAt: now()->subMonth());

        $this->appointment($milo, now()->setTime(8, 0), 'Confirmed');      // today, already started
        $this->appointment($luna, now()->setTime(15, 0), 'Pending');       // today, later
        $this->appointment($rex, now()->addDay()->setTime(10, 0), 'Confirmed'); // tomorrow
        $this->appointment($milo, now()->addDays(3)->setTime(9, 0), 'Rejected'); // excluded from counts

        $this->actingAs(User::factory()->create(['role' => 'clerk', 'status' => 'Active']))
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('clerkHome.today', '2026-11-15')
                ->where('clerkHome.tomorrow', '2026-11-16')
                ->where('clerkHome.totalPatients', 4)
                ->where('clerkHome.newPatientsThisMonth', 2)        // Milo, Luna
                ->where('clerkHome.upcomingAppointments', 3)        // today x2 + tomorrow (rejected excluded)
                ->where('clerkHome.pendingAppointments', 1)
                ->where('clerkHome.upcomingBilling', 0)             // no visit completed by a vet yet
                ->where('clerkHome.downPaymentsReceived', 400)
                ->where('upcomingAppointments.0.pet', 'Milo')
                ->where('upcomingAppointments.0.day', '2026-11-15')
                ->where('upcomingAppointments.0.hasStarted', true)
                ->where('upcomingAppointments.0.petAge', 3)
                ->where('upcomingAppointments.1.hasStarted', false)
                ->where('upcomingAppointments.2.day', '2026-11-16'));
    }

    public function test_clerk_home_with_no_appointments_is_all_zero(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'clerk', 'status' => 'Active']))
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('clerkHome.totalPatients', 0)
                ->where('clerkHome.newPatientsThisMonth', 0)
                ->where('clerkHome.upcomingAppointments', 0)
                ->where('clerkHome.pendingAppointments', 0)
                ->where('clerkHome.upcomingBilling', 0)
                ->where('upcomingAppointments', []));
    }

    private function pet(User $owner, string $name): Pet
    {
        return Pet::create(['petName' => $name, 'species' => 'Dog', 'breed' => 'Aspin', 'age' => 3, 'petOwnerID' => $owner->id]);
    }

    private function appointment(Pet $pet, CarbonInterface $at, string $status, ?CarbonInterface $createdAt = null): Appointment
    {
        $appointment = Appointment::create([
            'ar_first_name' => 'Jamie',
            'ar_last_name' => 'Sample',
            'pet_id' => $pet->petID,
            'service_type' => 'Consultation',
            'app_date_time' => $at,
            'proof_of_down_payment_path' => $pet->petOwnerID.'/receipt.png',
            'proof_of_down_payment_disk' => 'supabase',
            'reference_number' => (string) $this->reference++,
            'status' => $status,
            'user_id' => $pet->petOwnerID,
        ]);

        if ($createdAt) {
            $appointment->forceFill(['created_at' => $createdAt])->save();
        }

        return $appointment;
    }
}
