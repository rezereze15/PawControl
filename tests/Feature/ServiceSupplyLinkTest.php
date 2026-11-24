<?php

namespace Tests\Feature;

use App\Models\MedicalSupply;
use App\Models\Service;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The services_medical_supplies junction table: which supplies a service uses, and how many.
 * Runs on a throwaway SQLite database with the six services and eight supplies from the migrations.
 */
class ServiceSupplyLinkTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_service_lists_the_supplies_it_uses_with_amounts(): void
    {
        $surgery = $this->service('Surgery & Intensive Monitoring');

        // attach() adds a row to the junction table.
        $surgery->supplies()->attach($this->supply('Absorbable Suture 3-0'), ['quantity' => 2]);
        $surgery->supplies()->attach($this->supply('Surgical Gloves')); // no amount: the database default, 1

        $supplies = $surgery->supplies()->orderBy('name')->get();

        $this->assertSame(['Absorbable Suture 3-0', 'Surgical Gloves'], $supplies->pluck('name')->all());
        $this->assertSame(2, $supplies[0]->pivot->quantity);
        $this->assertSame(1, $supplies[1]->pivot->quantity);
    }

    public function test_a_supply_lists_the_services_that_use_it(): void
    {
        $ringers = $this->supply("Lactated Ringer's Solution 1L");
        $this->service('ICU')->supplies()->attach($ringers, ['quantity' => 2]);
        $this->service('Critical Care')->supplies()->attach($ringers, ['quantity' => 1]);

        $services = $ringers->services()->orderBy('name')->get();

        $this->assertSame(['Critical Care', 'ICU'], $services->pluck('name')->all());
        $this->assertSame([1, 2], $services->pluck('pivot.quantity')->all());
    }

    public function test_the_same_supply_is_linked_only_once_and_its_amount_can_change(): void
    {
        $icu = $this->service('ICU');
        $ringers = $this->supply("Lactated Ringer's Solution 1L");
        $icu->supplies()->attach($ringers, ['quantity' => 2]);

        // A second "ICU + Ringer's" row is refused by the unique rule...
        $this->assertThrows(
            fn () => $icu->supplies()->attach($ringers, ['quantity' => 5]),
            UniqueConstraintViolationException::class,
        );

        // ...so to change the amount, update the row that is already there.
        $icu->supplies()->updateExistingPivot($ringers->id, ['quantity' => 3]);

        $this->assertDatabaseCount('services_medical_supplies', 1);
        $this->assertSame(3, $icu->supplies()->first()->pivot->quantity);
    }

    public function test_linked_services_and_supplies_cannot_be_deleted_only_deactivated(): void
    {
        $surgery = $this->service('Surgery & Intensive Monitoring');
        $suture = $this->supply('Absorbable Suture 3-0');
        $surgery->supplies()->attach($suture, ['quantity' => 2]);

        // ON DELETE RESTRICT: the database refuses, because the link still points at them.
        $this->assertThrows(fn () => $suture->delete(), QueryException::class);
        $this->assertThrows(fn () => $surgery->delete(), QueryException::class);
        $this->assertModelExists($suture);
        $this->assertModelExists($surgery);

        // Deactivating is fine, and the link is kept.
        $suture->update(['is_active' => false]);
        $this->assertSame(1, $surgery->supplies()->count());
    }

    private function service(string $name): Service
    {
        return Service::query()->where('name', $name)->firstOrFail();
    }

    private function supply(string $name): MedicalSupply
    {
        return MedicalSupply::query()->where('name', $name)->firstOrFail();
    }
}
