<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Manage Services (admin). Runs on a throwaway SQLite database; the services
 * migration already adds six active services, e.g. "ICU" and "Critical Care".
 */
class AdminServiceManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_sees_services_active_first_then_a_to_z(): void
    {
        $admin = $this->makeUser('admin');
        $this->service('ICU')->update(['is_active' => false]);

        $this->actingAs($admin)
            ->get(route('dashboard.role', ['role' => 'admin']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('services', 6)
                ->where('services.0.name', 'Advanced Diagnosis')
                ->where('services.0.isActive', true)
                ->where('services.5.name', 'ICU')
                ->where('services.5.isActive', false)
                ->where('services.5.price', '6000.00'));
    }

    public function test_admin_can_add_a_service(): void
    {
        $admin = $this->makeUser('admin');
        $page = route('dashboard.role', ['role' => 'admin']);

        $this->actingAs($admin)
            ->from($page)
            ->post(route('admin.services.store'), $this->serviceData([
                'name' => '  Dental Cleaning  ',
                'description' => '   ',
            ]))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'Dental Cleaning was added.')
            ->assertRedirect($page);

        $service = $this->service('Dental Cleaning');
        $this->assertNull($service->description, 'A blank description is saved as null.');
        $this->assertSame('1200.50', $service->price);
        $this->assertTrue($service->is_active);
        $this->assertSame(7, Service::query()->count());
    }

    public function test_a_free_service_is_allowed(): void
    {
        $admin = $this->makeUser('admin');

        $this->actingAs($admin)
            ->post(route('admin.services.store'), $this->serviceData(['name' => 'Free Checkup', 'price' => '0']))
            ->assertSessionHasNoErrors();

        $this->assertSame('0.00', $this->service('Free Checkup')->price);
    }

    public function test_admin_can_edit_a_service(): void
    {
        $admin = $this->makeUser('admin');
        $icu = $this->service('ICU');

        // Saving a service with its own name is not a duplicate.
        $this->actingAs($admin)
            ->put(route('admin.services.update', $icu), $this->serviceData(['name' => 'ICU', 'price' => '6500']))
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'ICU was updated.');
        $this->assertSame('6500.00', $icu->fresh()->price);

        // Renaming works too.
        $this->actingAs($admin)
            ->put(route('admin.services.update', $icu), $this->serviceData(['name' => 'Intensive Care Unit', 'price' => '6500']))
            ->assertSessionHasNoErrors();

        $this->assertSame('Intensive Care Unit', $icu->fresh()->name);
        $this->assertSame(6, Service::query()->count());
    }

    public function test_duplicate_names_are_rejected_ignoring_case(): void
    {
        $admin = $this->makeUser('admin');
        $duplicate = ['name' => 'A service with this name already exists.'];

        // "icu" is the same service as "ICU".
        $this->actingAs($admin)
            ->post(route('admin.services.store'), $this->serviceData(['name' => 'icu']))
            ->assertSessionHasErrors($duplicate);

        // Extra spaces are trimmed first, so this is still "Critical Care".
        $this->actingAs($admin)
            ->post(route('admin.services.store'), $this->serviceData(['name' => '  Critical Care ']))
            ->assertSessionHasErrors($duplicate);

        // Renaming one service to another's name is blocked as well.
        $critical = $this->service('Critical Care');
        $this->actingAs($admin)
            ->put(route('admin.services.update', $critical), $this->serviceData(['name' => 'ICU']))
            ->assertSessionHasErrors($duplicate);

        $this->assertSame('Critical Care', $critical->fresh()->name);
        $this->assertSame(6, Service::query()->count());
    }

    public function test_name_and_price_are_validated(): void
    {
        $admin = $this->makeUser('admin');

        foreach (['', str_repeat('A', 51)] as $badName) {
            $this->actingAs($admin)
                ->post(route('admin.services.store'), $this->serviceData(['name' => $badName]))
                ->assertSessionHasErrors('name');
        }

        // Blank, negative, 3 decimals, not a number, too high.
        foreach (['', '-1', '12.345', 'abc', '100000000'] as $badPrice) {
            $this->actingAs($admin)
                ->post(route('admin.services.store'), $this->serviceData(['price' => $badPrice]))
                ->assertSessionHasErrors('price');
        }

        $this->assertSame(6, Service::query()->count());
    }

    public function test_admin_can_deactivate_and_reactivate_a_service(): void
    {
        $admin = $this->makeUser('admin');
        $icu = $this->service('ICU');

        $this->actingAs($admin)
            ->patch(route('admin.services.status', $icu), ['is_active' => false])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'ICU was deactivated.');
        $this->assertFalse($icu->fresh()->is_active);

        $this->actingAs($admin)
            ->patch(route('admin.services.status', $icu), ['is_active' => true])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success', 'ICU is active again.');
        $this->assertTrue($icu->fresh()->is_active);

        // Anything that isn't true/false is rejected.
        $this->actingAs($admin)
            ->patch(route('admin.services.status', $icu), ['is_active' => 'maybe'])
            ->assertSessionHasErrors('is_active');
        $this->assertTrue($icu->fresh()->is_active);
    }

    public function test_only_admins_can_manage_services(): void
    {
        $icu = $this->service('ICU');

        foreach (['customer', 'clerk', 'veterinarian', 'owner'] as $role) {
            $user = $this->makeUser($role);

            $this->actingAs($user)->post(route('admin.services.store'), $this->serviceData())->assertForbidden();
            $this->actingAs($user)->put(route('admin.services.update', $icu), $this->serviceData())->assertForbidden();
            $this->actingAs($user)->patch(route('admin.services.status', $icu), ['is_active' => false])->assertForbidden();
        }

        // Nothing changed.
        $icu->refresh();
        $this->assertSame('ICU', $icu->name);
        $this->assertSame('6000.00', $icu->price);
        $this->assertTrue($icu->is_active);
        $this->assertSame(6, Service::query()->count());
    }

    private function service(string $name): Service
    {
        return Service::query()->where('name', $name)->firstOrFail();
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
     * A valid "Add / Edit Service" form; each test overrides only what it checks.
     *
     * @param array<string, mixed> $overrides
     */
    private function serviceData(array $overrides = []): array
    {
        return [
            'name' => 'Dental Cleaning',
            'description' => 'Scaling and polishing to remove plaque and tartar.',
            'price' => '1200.50',
            ...$overrides,
        ];
    }
}
