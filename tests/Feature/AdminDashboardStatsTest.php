<?php

namespace Tests\Feature;

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

    public function test_non_admins_do_not_receive_admin_data(): void
    {
        $customer = $this->makeUser('customer');

        $this->actingAs($customer)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->missing('adminStats')
                ->missing('recentUsers'));
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
