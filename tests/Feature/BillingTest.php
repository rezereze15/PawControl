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

/** Completing a diagnosis sends the visit to the clerk's Upcoming Billings with the attending vet. */
class BillingTest extends TestCase
{
    use RefreshDatabase;

    private int $reference = 7000;

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo('2026-11-26 09:00:00');
    }

    private function user(string $role, array $attributes = []): User
    {
        return User::factory()->create(['role' => $role, 'status' => 'Active', ...$attributes]);
    }

    private function record(string $serviceType = 'Consultation'): MedicalRecord
    {
        $owner = $this->user('customer', ['name' => 'Jamie Owner']);
        $pet = Pet::create(['petName' => 'Milo', 'species' => 'Dog', 'breed' => 'Aspin', 'petOwnerID' => $owner->id]);
        $appointment = Appointment::create([
            'ar_first_name' => 'Jamie', 'ar_last_name' => 'Owner', 'pet_id' => $pet->petID,
            'service_type' => $serviceType, 'notes' => 'Coughing', 'app_date_time' => '2026-11-26 10:00:00',
            'reference_number' => (string) $this->reference++, 'status' => Appointment::STATUS_CONFIRMED,
            'user_id' => $owner->id,
        ]);

        return MedicalRecord::forAcceptedAppointment($appointment, null);
    }

    /** @return array<string, mixed> */
    private function form(array $overrides = []): array
    {
        return ['diagnosis' => 'Kennel cough', 'status' => 'Completed', 'services' => [], 'supplies' => [], ...$overrides];
    }

    public function test_completing_creates_a_billing_priced_from_the_database_with_the_attending_vet(): void
    {
        $vet = $this->user('veterinarian', ['name' => 'Haerin Kang']);
        $record = $this->record();
        $service = Service::create(['name' => 'Deworming', 'price' => 500, 'is_active' => true]);
        $gauze = MedicalSupply::create([
            'name' => 'Gauze', 'category' => 'Medication', 'unit_of_measure' => 'pcs',
            'stock_quantity' => 10, 'reorder_level' => 1, 'unit_price' => 25, 'is_active' => true,
        ]);

        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form([
            'services' => [$service->id],
            'supplies' => [['id' => $gauze->id, 'quantity' => 2]],
        ]))->assertSessionHasNoErrors();

        $billing = Billing::query()->sole();
        $this->assertSame($record->id, $billing->medical_record_id);
        $this->assertSame($vet->id, $billing->veterinarian_id);
        $this->assertSame($vet->id, $record->fresh()->veterinarian_id);
        $this->assertSame(Billing::STATUS_UNPAID, $billing->status);
        $this->assertSame(
            [['Deworming', 1, '500.00'], ['Gauze', 2, '25.00']],
            $billing->items->map(fn ($item) => [$item->description, $item->quantity, $item->unit_price])->all(),
        );

        // A later price change in the admin module doesn't alter the issued bill.
        $service->update(['price' => 900]);

        $this->actingAs($this->user('clerk'))
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('billings', 1)
                ->where('billings.0.receiptNo', 'BILL-2026-'.str_pad((string) $billing->id, 6, '0', STR_PAD_LEFT))
                ->where('billings.0.pet', 'Milo')
                ->where('billings.0.owner', 'Jamie Owner')
                ->where('billings.0.veterinarian', 'Haerin Kang')
                ->where('billings.0.status', 'Unpaid')
                ->where('billings.0.items.0.unitPrice', 500)
                ->where('billings.0.items.1.qty', 2)
                ->where('clerkHome.upcomingBilling', 1));
    }

    public function test_submitting_completed_twice_does_not_create_a_second_billing(): void
    {
        $vet = $this->user('veterinarian');
        $record = $this->record();

        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form())->assertSessionHasNoErrors();
        // Double click / resubmitted form: the record is locked, nothing new is billed.
        $this->actingAs($vet)->put(route('medical-records.update', $record), $this->form())->assertForbidden();

        $this->assertSame(1, Billing::count());

        // Calling the creator again directly returns the same bill.
        $this->assertSame(Billing::query()->sole()->id, Billing::forCompletedRecord($record->fresh(), $vet->id)->id);
        $this->assertSame(1, Billing::count());
        $this->assertSame(0, Billing::query()->sole()->items()->count());
    }

    public function test_without_services_on_the_record_the_booked_service_price_is_billed(): void
    {
        Service::create(['name' => 'Vaccination', 'price' => 750, 'is_active' => true]);
        $record = $this->record('vaccination');

        $this->actingAs($this->user('veterinarian'))
            ->put(route('medical-records.update', $record), $this->form())
            ->assertSessionHasNoErrors();

        $item = Billing::query()->sole()->items()->sole();
        $this->assertSame('Vaccination', $item->description);
        $this->assertSame('750.00', $item->unit_price);
    }

    public function test_saving_without_completing_does_not_bill(): void
    {
        $this->actingAs($this->user('veterinarian'))
            ->put(route('medical-records.update', $this->record()), $this->form(['status' => 'Ongoing']))
            ->assertSessionHasNoErrors();

        $this->assertSame(0, Billing::count());
    }

    public function test_records_completed_before_billing_existed_are_billed_once(): void
    {
        $vet = $this->user('veterinarian');
        Service::create(['name' => 'Consultation', 'price' => 400, 'is_active' => true]);

        // Completed by a vet before automatic billing: no bill yet.
        $byVet = $this->record();
        $byVet->forceFill(['status' => 'Completed', 'veterinarian_id' => $vet->id, 'diagnosis' => 'Otitis', 'completed_at' => '2026-11-24 15:00:00'])->saveQuietly();
        // Past visit auto-completed by the medical-records migration: never diagnosed.
        $autoCompleted = $this->record();
        $autoCompleted->forceFill(['status' => 'Completed', 'completed_at' => '2026-11-20 10:00:00'])->saveQuietly();

        $migration = require database_path('migrations/2026_11_27_010000_bill_records_completed_before_billing.php');
        $migration->up();
        $migration->up(); // running it again bills nothing twice

        $billing = Billing::query()->sole();
        $this->assertSame($byVet->id, $billing->medical_record_id);
        $this->assertSame($vet->id, $billing->veterinarian_id);
        $this->assertSame('2026-11-24', $billing->issued_at->toDateString());
        $this->assertSame('400.00', $billing->items()->sole()->unit_price);
        $this->assertNull($autoCompleted->billing()->first());
    }

    /** A completed visit's bill with one 400 Consultation line. */
    private function bill(): Billing
    {
        Service::firstOrCreate(['name' => 'Consultation'], ['price' => 400, 'is_active' => true]);
        $this->actingAs($this->user('veterinarian'))->put(route('medical-records.update', $this->record()), $this->form());

        return Billing::query()->latest('id')->firstOrFail();
    }

    /** @return array<string, mixed> */
    private function receipt(Billing $billing, array $overrides = []): array
    {
        return [
            'items' => $billing->items->map(fn ($item) => [
                'id' => $item->id, 'description' => $item->description, 'qty' => $item->quantity, 'unitPrice' => (float) $item->unit_price,
            ])->all(),
            'other' => ['description' => '', 'qty' => 0, 'unitPrice' => 0],
            'discount' => 0,
            'notes' => '',
            'referenceNumber' => '',
            ...$overrides,
        ];
    }

    public function test_clerk_marks_a_bill_as_paid_with_the_receipt_as_shown(): void
    {
        $billing = $this->bill();
        $clerk = $this->user('clerk', ['name' => 'Maloi Clerk']);
        $line = $billing->items->sole();

        $this->actingAs($clerk)
            ->post(route('billings.pay', $billing), $this->receipt($billing, [
                'items' => [['id' => $line->id, 'description' => 'Consultation (extended)', 'qty' => 2, 'unitPrice' => 400]],
                'other' => ['description' => 'Pet shampoo', 'qty' => 1, 'unitPrice' => 150],
                'discount' => 50,
                'notes' => 'Senior discount',
                'referenceNumber' => 'OR-1001',
            ]))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $billing->refresh();
        $this->assertSame(Billing::STATUS_PAID, $billing->status);
        $this->assertSame('900.00', $billing->amount_paid); // 2 x 400 + 150 - 50
        $this->assertSame('50.00', $billing->discount);
        $this->assertSame('OR-1001', $billing->reference_number);
        $this->assertSame('Senior discount', $billing->notes);
        $this->assertSame($clerk->id, $billing->paid_by);
        $this->assertTrue($billing->paid_at->equalTo(now()));
        $this->assertSame(
            [['Consultation (extended)', 2, '400.00'], ['Pet shampoo', 1, '150.00']],
            $billing->items()->get()->map(fn ($item) => [$item->description, $item->quantity, $item->unit_price])->all(),
        );

        // Still listed, now as Paid; the home card only counts unpaid bills.
        $this->actingAs($clerk)
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('billings.0.status', 'Paid')
                ->where('billings.0.paidAt', '2026-11-26')
                ->where('billings.0.paidBy', 'Maloi Clerk')
                ->where('billings.0.referenceNumber', 'OR-1001')
                ->where('billings.0.amountPaid', 900)
                ->where('clerkHome.upcomingBilling', 0));
    }

    public function test_a_paid_bill_cannot_be_paid_or_changed_again(): void
    {
        $billing = $this->bill();
        $clerk = $this->user('clerk');

        $this->actingAs($clerk)->post(route('billings.pay', $billing), $this->receipt($billing))->assertSessionHasNoErrors();
        $this->actingAs($clerk)
            ->post(route('billings.pay', $billing), $this->receipt($billing->fresh('items'), ['discount' => 400, 'referenceNumber' => 'CHANGED']))
            ->assertSessionHasErrors('billing');

        $billing->refresh();
        $this->assertSame('400.00', $billing->amount_paid);
        $this->assertNull($billing->reference_number);
    }

    public function test_discount_cannot_exceed_the_subtotal_and_other_bills_lines_are_untouched(): void
    {
        $other = $this->bill();
        $billing = $this->bill();

        $this->actingAs($this->user('clerk'))
            ->post(route('billings.pay', $billing), $this->receipt($billing, [
                'items' => [['id' => $other->items->sole()->id, 'description' => 'Hijacked', 'qty' => 0, 'unitPrice' => 0]],
                'discount' => 99999,
            ]))
            ->assertSessionHasNoErrors();

        $this->assertSame('0.00', $billing->fresh()->amount_paid);
        $this->assertSame('Consultation', $other->items()->sole()->description);
        $this->assertSame(Billing::STATUS_UNPAID, $other->fresh()->status);
    }

    public function test_only_clerks_can_mark_bills_as_paid(): void
    {
        $billing = $this->bill();

        foreach (['veterinarian', 'customer', 'owner'] as $role) {
            $this->actingAs($this->user($role))->post(route('billings.pay', $billing), $this->receipt($billing))->assertForbidden();
        }

        $this->assertSame(Billing::STATUS_UNPAID, $billing->fresh()->status);
    }
}
