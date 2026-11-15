<?php

namespace Tests\Feature;

use App\Models\MedicalSupply;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_home_shows_user_and_service_counts(): void
    {
        // Arrange: three users (one inactive). The services migration already adds
        // six active services, so switch one off to tell "active" apart from "total".
        $admin = $this->makeUser('admin');
        $this->makeUser('clerk');
        $this->makeUser('customer', ['status' => User::STATUS_INACTIVE]);
        Service::query()->where('name', 'ICU')->update(['is_active' => false]);

        // Act + Assert: the admin opens the dashboard and React receives the right numbers.
        $this->actingAs($admin)
            ->get(route('dashboard.role', ['role' => 'admin']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('adminStats.totalUsers', 3)
                ->where('adminStats.activeUsers', 2)
                ->where('adminStats.activeServices', 5)
                ->where('adminStats.totalServices', 6)
                ->has('recentUsers', 3)
                // Privacy: the home screen only needs names, roles, and dates.
                ->missing('recentUsers.0.email'));
    }

    public function test_admin_home_shows_supply_counts_and_low_stock(): void
    {
        // Arrange: the migration adds 8 supplies, 3 of them low (Absorbable Suture,
        // Lactated Ringer's, Rabies Vaccine). Deactivate one low supply: it should
        // drop out of "active" AND stop triggering a low-stock alert.
        MedicalSupply::query()->where('name', 'Rabies Vaccine')->update(['is_active' => false]);
        $admin = $this->makeUser('admin');

        // Act + Assert
        $this->actingAs($admin)
            ->get(route('dashboard.role', ['role' => 'admin']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('adminStats.activeSupplies', 7)
                ->where('adminStats.totalSupplies', 8)
                ->where('adminStats.lowStockCount', 2)
                ->has('lowStockSupplies', 2)
                // Most urgent first: 3 pcs comes before 4 bags.
                ->where('lowStockSupplies.0.name', 'Absorbable Suture 3-0')
                ->where('lowStockSupplies.0.stockQuantity', 3)
                // The panel doesn't show prices, so they aren't sent.
                ->missing('lowStockSupplies.0.unitPrice'));
    }

    public function test_non_admins_do_not_receive_admin_data(): void
    {
        $customer = $this->makeUser('customer');

        $this->actingAs($customer)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->missing('adminStats')
                ->missing('recentUsers')
                ->missing('lowStockSupplies'));
    }

    /** Same helper as AdminUserManagementTest. */
    private function makeUser(string $role, array $attributes = []): User
    {
        return User::factory()->create([
            'role' => $role,
            'status' => User::STATUS_ACTIVE,
            // Letters, digits and underscores only, so it always passes the username rules.
            'username' => fake()->unique()->bothify('user_####??'),
            ...$attributes,
        ]);
    }
}
