<?php

namespace Tests\Feature;

use App\Models\MedicalSupply;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Manage Medical Supplies (admin). Runs on a throwaway SQLite database; the supplies
 * migration already adds eight active supplies, three of them low on stock:
 * Absorbable Suture 3-0 (3 of 10), Lactated Ringer's (4 of 10) and Rabies Vaccine (10 of 10).
 */
class AdminSupplyManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sees_supplies_active_first_with_low_stock_flags(): void
    {
        $admin = $this->makeUser('admin');
        $this->supply('Rabies Vaccine')->update(['is_active' => false]);

        $this->actingAs($admin)
            ->get(route('dashboard.role', ['role' => 'admin']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('supplies', 8)
                ->where('supplies.0.name', '5-in-1 Vaccine')
                ->where('supplies.0.isLowStock', false)
                ->where('supplies.1.name', 'Absorbable Suture 3-0')
                ->where('supplies.1.stockQuantity', 3)
                ->where('supplies.1.unitPrice', '250.00')
                ->where('supplies.1.isLowStock', true)
                // Inactive goes last, and is never "low stock" even though 10 <= 10.
                ->where('supplies.7.name', 'Rabies Vaccine')
                ->where('supplies.7.isActive', false)
                ->where('supplies.7.isLowStock', false)
                ->where('supplyOptions.categories', MedicalSupply::CATEGORIES)
                ->where('supplyOptions.units', MedicalSupply::UNITS));
    }

    public function test_admin_can_add_a_supply(): void
    {
        $admin = $this->makeUser('admin');
        $page = route('dashboard.role', ['role' => 'admin']);

        $this->actingAs($admin)
            ->from($page)
            ->post(route('admin.supplies.store'), $this->supplyData([
                'name' => '  Syringe 3ml  ',
                'description' => '   ',
            ]))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Syringe 3ml was added.')
            ->assertRedirect($page);

        $syringe = $this->supply('Syringe 3ml');
        $this->assertNull($syringe->description, 'A blank description is saved as null.');
        $this->assertSame(100, $syringe->stock_quantity);
        $this->assertSame('12.50', $syringe->unit_price);
        $this->assertTrue($syringe->is_active);
        $this->assertSame(9, MedicalSupply::query()->count());
    }

    public function test_restocking_a_supply_clears_its_low_stock_alert(): void
    {
        $admin = $this->makeUser('admin');
        $suture = $this->supply('Absorbable Suture 3-0');

        // Like the Edit form: everything keeps its value except the stock.
        // Keeping its own name is not a duplicate.
        $this->actingAs($admin)
            ->put(route('admin.supplies.update', $suture), $this->editForm($suture, ['stock_quantity' => 50]))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Absorbable Suture 3-0 was updated.');

        $this->assertSame(50, $suture->fresh()->stock_quantity);

        // The table badge and the Home "Low Stock Alerts" count both update (3 -> 2).
        $this->actingAs($admin)
            ->get(route('dashboard.role', ['role' => 'admin']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('supplies.1.name', 'Absorbable Suture 3-0')
                ->where('supplies.1.isLowStock', false)
                ->where('adminStats.lowStockCount', 2));
    }

    public function test_duplicate_supply_names_are_rejected_ignoring_case(): void
    {
        $admin = $this->makeUser('admin');
        $duplicate = ['name' => 'A supply with this name already exists.'];

        // "rabies vaccine" is the same supply as "Rabies Vaccine".
        $this->actingAs($admin)
            ->post(route('admin.supplies.store'), $this->supplyData(['name' => 'rabies vaccine']))
            ->assertSessionHasErrors($duplicate);

        // Extra spaces are trimmed first, so this is still "Gauze Pads".
        $this->actingAs($admin)
            ->post(route('admin.supplies.store'), $this->supplyData(['name' => '  Gauze Pads ']))
            ->assertSessionHasErrors($duplicate);

        // Renaming one supply to another's name is blocked as well.
        $gauze = $this->supply('Gauze Pads');
        $this->actingAs($admin)
            ->put(route('admin.supplies.update', $gauze), $this->editForm($gauze, ['name' => 'RABIES VACCINE']))
            ->assertSessionHasErrors($duplicate);

        $this->assertSame('Gauze Pads', $gauze->fresh()->name);
        $this->assertSame(8, MedicalSupply::query()->count());
    }

    public function test_name_category_and_unit_are_validated(): void
    {
        $admin = $this->makeUser('admin');

        // Blank, or longer than 100 characters.
        foreach (['', str_repeat('A', 101)] as $badName) {
            $this->actingAs($admin)
                ->post(route('admin.supplies.store'), $this->supplyData(['name' => $badName]))
                ->assertSessionHasErrors('name');
        }

        $this->actingAs($admin)
            ->post(route('admin.supplies.store'), $this->supplyData(['description' => str_repeat('A', 256)]))
            ->assertSessionHasErrors('description');

        // Only the choices in the dropdowns are accepted.
        $this->actingAs($admin)
            ->post(route('admin.supplies.store'), $this->supplyData(['category' => 'Snacks', 'unit_of_measure' => 'crate']))
            ->assertSessionHasErrors([
                'category' => 'Please choose a category from the list.',
                'unit_of_measure' => 'Please choose a unit from the list.',
            ]);

        $this->actingAs($admin)
            ->post(route('admin.supplies.store'), $this->supplyData(['category' => '', 'unit_of_measure' => '']))
            ->assertSessionHasErrors(['category', 'unit_of_measure']);

        $this->assertSame(8, MedicalSupply::query()->count());
    }

    public function test_stock_reorder_level_and_price_are_validated(): void
    {
        $admin = $this->makeUser('admin');

        // Counts: blank, half an item, negative, not a number, too high.
        foreach (['stock_quantity', 'reorder_level'] as $field) {
            foreach (['', '2.5', '-1', 'abc', '1000001'] as $badCount) {
                $this->actingAs($admin)
                    ->post(route('admin.supplies.store'), $this->supplyData([$field => $badCount]))
                    ->assertSessionHasErrors($field);
            }
        }

        // Price: blank, negative, 3 decimals, not a number, too high.
        foreach (['', '-1', '12.555', 'abc', '100000000'] as $badPrice) {
            $this->actingAs($admin)
                ->post(route('admin.supplies.store'), $this->supplyData(['unit_price' => $badPrice]))
                ->assertSessionHasErrors('unit_price');
        }

        $this->assertSame(8, MedicalSupply::query()->count());

        // 0 is fine: the supply is simply out of stock, which counts as low stock.
        $this->actingAs($admin)
            ->post(route('admin.supplies.store'), $this->supplyData(['stock_quantity' => '0']))
            ->assertSessionHasNoErrors();
        $this->assertTrue($this->supply('Syringe 3ml')->isLowStock());
    }

    public function test_admin_can_deactivate_and_reactivate_a_supply(): void
    {
        $admin = $this->makeUser('admin');
        $rabies = $this->supply('Rabies Vaccine');

        $this->actingAs($admin)
            ->patch(route('admin.supplies.status', $rabies), ['is_active' => false])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Rabies Vaccine was deactivated.');
        $this->assertFalse($rabies->fresh()->is_active);
        // It leaves the low stock alerts, but its stock record is kept.
        $this->assertSame(2, MedicalSupply::query()->lowStock()->count());
        $this->assertSame(10, $rabies->fresh()->stock_quantity);

        $this->actingAs($admin)
            ->patch(route('admin.supplies.status', $rabies), ['is_active' => true])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Rabies Vaccine is active again.');
        $this->assertTrue($rabies->fresh()->is_active);
        $this->assertSame(3, MedicalSupply::query()->lowStock()->count());

        // Anything that isn't true/false is rejected.
        $this->actingAs($admin)
            ->patch(route('admin.supplies.status', $rabies), ['is_active' => 'maybe'])
            ->assertSessionHasErrors('is_active');
        $this->assertTrue($rabies->fresh()->is_active);
    }

    public function test_only_admins_can_manage_supplies(): void
    {
        $gauze = $this->supply('Gauze Pads');

        foreach (['customer', 'clerk', 'veterinarian', 'owner'] as $role) {
            $user = $this->makeUser($role);

            $this->actingAs($user)->post(route('admin.supplies.store'), $this->supplyData())->assertForbidden();
            $this->actingAs($user)->put(route('admin.supplies.update', $gauze), $this->editForm($gauze, ['stock_quantity' => 0]))->assertForbidden();
            $this->actingAs($user)->patch(route('admin.supplies.status', $gauze), ['is_active' => false])->assertForbidden();
        }

        // Nothing changed.
        $gauze->refresh();
        $this->assertSame(40, $gauze->stock_quantity);
        $this->assertTrue($gauze->is_active);
        $this->assertSame(8, MedicalSupply::query()->count());
    }

    private function supply(string $name): MedicalSupply
    {
        return MedicalSupply::query()->where('name', $name)->firstOrFail();
    }

    /** @param array<string, mixed> $attributes */
    private function makeUser(string $role, array $attributes = []): User
    {
        return User::factory()->create([
            'role' => $role,
            'status' => 'Active',
            // Letters, digits and underscores only, so it always passes the username rules.
            'username' => fake()->unique()->bothify('user_####??'),
            ...$attributes,
        ]);
    }

    /**
     * A valid "Add Supply" form; each test overrides only what it checks.
     *
     * @param array<string, mixed> $overrides
     */
    private function supplyData(array $overrides = []): array
    {
        return [
            'name' => 'Syringe 3ml',
            'description' => 'Disposable 3ml syringe for injections.',
            'category' => 'Consumable',
            'unit_of_measure' => 'pcs',
            'stock_quantity' => '100',
            'reorder_level' => '20',
            'unit_price' => '12.50',
            ...$overrides,
        ];
    }

    /**
     * The "Edit Supply" form opens filled with the supply's current values,
     * so this starts from those and changes only what the test needs.
     *
     * @param array<string, mixed> $changes
     */
    private function editForm(MedicalSupply $supply, array $changes = []): array
    {
        return [
            ...$supply->only(['name', 'description', 'category', 'unit_of_measure', 'stock_quantity', 'reorder_level', 'unit_price']),
            ...$changes,
        ];
    }
}
