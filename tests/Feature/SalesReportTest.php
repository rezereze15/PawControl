<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Billing;
use App\Models\MedicalRecord;
use App\Models\MedicalSupply;
use App\Models\Pet;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/** The clinic owner's Sales Reports: numbers from the real bills, in clinic time. */
class SalesReportTest extends TestCase
{
    use RefreshDatabase;

    private int $reference = 9000;

    protected function setUp(): void
    {
        parent::setUp();
        // Friday, Nov 27, 2026 at noon in Manila (04:00 UTC).
        $this->travelTo('2026-11-27 04:00:00');
    }

    private function user(string $role): User
    {
        return User::factory()->create(['role' => $role, 'status' => 'Active']);
    }

    private function record(string $petName = 'Milo'): MedicalRecord
    {
        $owner = $this->user('customer');
        $pet = Pet::create(['petName' => $petName, 'species' => 'Dog', 'breed' => 'Aspin', 'petOwnerID' => $owner->id]);
        $appointment = Appointment::create([
            'ar_first_name' => 'Jamie', 'ar_last_name' => 'Owner', 'pet_id' => $pet->petID,
            'service_type' => 'Consultation', 'notes' => 'Check-up', 'app_date_time' => '2026-11-20 10:00:00',
            'reference_number' => (string) $this->reference++, 'status' => Appointment::STATUS_CONFIRMED,
            'user_id' => $owner->id,
        ]);

        return MedicalRecord::forAcceptedAppointment($appointment, null);
    }

    /**
     * A bill with the given lines [description, qty, unit price]. With $paidAt (UTC) it
     * is paid for its total, like the clerk's "Mark as Paid".
     *
     * @param  list<array{0: string, 1: int, 2: float|int}>  $lines
     */
    private function bill(array $lines, ?string $paidAt = null, float $discount = 0, string $issuedAt = '2026-11-01 02:00:00', string $petName = 'Milo'): Billing
    {
        $subtotal = array_sum(array_map(fn (array $line) => $line[1] * $line[2], $lines));

        $billing = Billing::create([
            'medical_record_id' => $this->record($petName)->id,
            'discount' => $discount,
            'issued_at' => $issuedAt,
            ...($paidAt === null ? [] : [
                'status' => Billing::STATUS_PAID,
                'amount_paid' => $subtotal - $discount,
                'paid_at' => $paidAt,
            ]),
        ]);

        foreach ($lines as [$description, $quantity, $price]) {
            $billing->items()->create(['description' => $description, 'quantity' => $quantity, 'unit_price' => $price]);
        }

        return $billing;
    }

    private function ownerDashboard(string $query = '')
    {
        return $this->actingAs($this->user('owner'))->get(route('dashboard.role', 'owner').$query);
    }

    public function test_month_totals_average_bill_and_change_use_paid_bills_in_clinic_time(): void
    {
        $this->bill([['Consultation', 1, 1000]], paidAt: '2026-11-10 02:00:00');
        // 17:00 UTC on Oct 31 is 1 AM on Nov 1 in Manila: November.
        $this->bill([['Consultation', 1, 500]], paidAt: '2026-10-31 17:00:00');
        // 11 PM on Oct 31 in Manila: October, but after Oct 27, so outside the comparison too.
        $this->bill([['Consultation', 1, 9999]], paidAt: '2026-10-31 15:00:00');
        // Oct 5: the comparison period (Oct 1 – 27).
        $this->bill([['Consultation', 1, 1000]], paidAt: '2026-10-05 03:00:00');

        $this->ownerDashboard()
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('salesReport.period', 'month')
                ->where('salesReport.today', '2026-11-27')
                ->where('salesReport.rangeLabel', 'Nov 1 – 27, 2026')
                ->where('salesReport.compareLabel', 'Oct 1 – 27, 2026')
                ->where('salesReport.totals.revenue', 1500)
                ->where('salesReport.totals.bills', 2)
                ->where('salesReport.totals.averageBill', 750)
                ->where('salesReport.change.revenue', 50)
                ->where('salesReport.change.bills', 100)
                ->where('salesReport.change.averageBill', -25)
                ->has('salesReport.series', 30)
                ->where('salesReport.series.0.short', 'Nov 1')
                ->where('salesReport.series.0.paid', 500)
                ->where('salesReport.series.9.paid', 1000)
                ->where('salesReport.series.26.paid', 0)   // today, nothing paid yet
                ->where('salesReport.series.27.paid', null)  // tomorrow: no value yet
            );
    }

    public function test_unpaid_balance_counts_every_unpaid_bill_and_flags_old_ones(): void
    {
        // 2 × 300 minus a 100 discount = 500, issued 12 days ago.
        $this->bill([['Consultation', 2, 300]], discount: 100, issuedAt: '2026-11-15 02:00:00');
        $this->bill([['Consultation', 1, 250]], issuedAt: '2026-11-25 02:00:00');
        $this->bill([['Consultation', 1, 999]], paidAt: '2026-11-20 02:00:00');

        $this->ownerDashboard()->assertInertia(fn (Assert $page) => $page
            ->where('salesReport.unpaid.amount', 750)
            ->where('salesReport.unpaid.bills', 2)
            ->where('salesReport.unpaid.olderThanWeek', 1)
        );
    }

    public function test_paid_lines_are_split_into_services_supplies_and_others(): void
    {
        Service::create(['name' => 'Consultation', 'price' => 1000, 'is_active' => true]);
        // Gauze Pads is one of the supplies the migrations add.
        MedicalSupply::firstOrCreate(['name' => 'Gauze Pads'], [
            'category' => 'Consumable', 'unit_of_measure' => 'pack',
            'stock_quantity' => 40, 'reorder_level' => 15, 'unit_price' => 50, 'is_active' => true,
        ]);

        $this->bill([
            ['consultation', 1, 1000],   // matched by name, whatever the case
            ['Gauze Pads', 4, 50],
            ['Nail trim', 1, 150],       // a line the clerk added: Others
        ], paidAt: '2026-11-20 02:00:00', discount: 100);

        $this->ownerDashboard()->assertInertia(fn (Assert $page) => $page
            ->where('salesReport.mix.services', 1000)
            ->where('salesReport.mix.supplies', 200)
            ->where('salesReport.mix.others', 150)
            ->where('salesReport.mix.billed', 1350)
            ->where('salesReport.mix.discounts', 100)
            ->where('salesReport.totals.revenue', 1250)
        );
    }

    public function test_week_and_year_periods(): void
    {
        $this->bill([['Consultation', 1, 800]], paidAt: '2026-11-23 02:00:00');  // Monday this week
        $this->bill([['Consultation', 1, 400]], paidAt: '2026-11-16 02:00:00');  // Monday last week
        $this->bill([['Consultation', 1, 600]], paidAt: '2026-03-10 02:00:00');

        $this->ownerDashboard('?period=week')->assertInertia(fn (Assert $page) => $page
            ->where('salesReport.period', 'week')
            ->where('salesReport.rangeLabel', 'Nov 23 – 27, 2026')
            ->where('salesReport.compareLabel', 'Nov 16 – 20, 2026')
            ->where('salesReport.totals.revenue', 800)
            ->where('salesReport.change.revenue', 100)
            ->has('salesReport.series', 7)
            ->where('salesReport.series.0.short', 'Mon')
            ->where('salesReport.series.0.paid', 800)
            ->where('salesReport.series.4.paid', 0)
            ->where('salesReport.series.5.paid', null)
        );

        $this->ownerDashboard('?period=year')->assertInertia(fn (Assert $page) => $page
            ->where('salesReport.period', 'year')
            ->where('salesReport.rangeLabel', 'Jan 1 – Nov 27, 2026')
            ->where('salesReport.totals.revenue', 1800)
            ->where('salesReport.change.revenue', null)   // no 2025 bills to compare with
            ->has('salesReport.series', 12)
            ->where('salesReport.series.2.label', 'March 2026')
            ->where('salesReport.series.2.paid', 600)
            ->where('salesReport.series.10.paid', 1200)
            ->where('salesReport.series.11.paid', null)
        );

        $this->ownerDashboard('?period=decade')->assertInertia(fn (Assert $page) => $page
            ->where('salesReport.period', 'month')
        );
    }

    public function test_latest_payments_are_the_five_newest_in_clinic_dates(): void
    {
        foreach (range(1, 5) as $day) {
            $this->bill([['Consultation', 1, 100 * $day]], paidAt: "2026-11-0{$day} 02:00:00", petName: "Pet {$day}");
        }
        // 17:00 UTC on Nov 26 is Nov 27 in Manila.
        $newest = $this->bill([['Surgery', 1, 15000]], paidAt: '2026-11-26 17:00:00', petName: 'Bantay');

        $this->ownerDashboard()->assertInertia(fn (Assert $page) => $page
            ->has('salesReport.latestPayments', 5)
            ->where('salesReport.latestPayments.0.receiptNo', $newest->receiptNumber())
            ->where('salesReport.latestPayments.0.pet', 'Bantay')
            ->where('salesReport.latestPayments.0.breed', 'Aspin')
            ->where('salesReport.latestPayments.0.service', 'Consultation')
            ->where('salesReport.latestPayments.0.amount', 15000)
            ->where('salesReport.latestPayments.0.paidOn', 'Nov 27, 2026')
            ->where('salesReport.latestPayments.4.pet', 'Pet 2')   // Pet 1 is the sixth newest
        );
    }

    public function test_an_empty_clinic_gets_zeros_and_nothing_to_compare(): void
    {
        $this->ownerDashboard()->assertInertia(fn (Assert $page) => $page
            ->where('salesReport.totals.revenue', 0)
            ->where('salesReport.totals.bills', 0)
            ->where('salesReport.totals.averageBill', 0)
            ->where('salesReport.change.revenue', null)
            ->where('salesReport.unpaid.amount', 0)
            ->where('salesReport.mix.billed', 0)
            ->has('salesReport.latestPayments', 0)
            ->has('salesReport.series', 30)
        );
    }

    public function test_switching_the_period_reloads_only_the_sales_report(): void
    {
        $this->bill([['Consultation', 1, 800]], paidAt: '2026-11-23 02:00:00');

        $this->ownerDashboard('?period=week')->assertInertia(fn (Assert $page) => $page
            ->has('petRecords')
            ->reloadOnly('salesReport', fn (Assert $reload) => $reload
                ->where('salesReport.period', 'week')
                ->where('salesReport.totals.revenue', 800)
                ->missing('petRecords')
            )
        );
    }

    public function test_only_the_clinic_owner_gets_the_sales_report(): void
    {
        foreach (['clerk', 'veterinarian', 'admin', 'customer'] as $role) {
            $this->actingAs($this->user($role))
                ->get(route('dashboard.role', $role))
                ->assertInertia(fn (Assert $page) => $page->missing('salesReport'));
        }

        $this->ownerDashboard()->assertInertia(fn (Assert $page) => $page->has('salesReport'));
    }
}
