<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_table_matches_the_erd_and_users_link_to_it(): void
    {
        $this->assertEqualsCanonicalizing(
            ['admin', 'owner', 'veterinarian', 'clerk', 'customer'],
            Role::query()->pluck('roleName')->all(),
        );

        $clerk = $this->makeUser('clerk');
        $this->assertSame(Role::idFor('clerk'), $clerk->fresh()->roleID);
        $this->assertSame('clerk', $clerk->fresh()->role);
        $this->assertSame('clerk', $clerk->assignedRole->roleName);

        // New accounts default to pet owner.
        $this->assertSame('customer', User::factory()->create()->role);

        // The foreign key rejects a role that doesn't exist.
        $this->expectException(QueryException::class);
        DB::table('users')->where('id', $clerk->id)->update(['roleID' => 999]);
    }

    public function test_admin_sees_all_users_and_roles_with_permissions(): void
    {
        $admin = $this->makeUser('admin');
        $this->makeUser('clerk');

        $this->actingAs($admin)
            ->get(route('dashboard.role', ['role' => 'admin']))
            ->assertInertia(fn (Assert $page) => $page
                ->has('managedUsers', 2)
                ->has('roles', 5)
                ->where('roles.3.name', 'clerk')
                ->where('roles.3.label', 'Clerk')
                ->has('roles.3.permissions')
                ->missing('managedUsers.0.password'));
    }

    public function test_admin_can_create_a_staff_account_that_can_sign_in(): void
    {
        $admin = $this->makeUser('admin');

        $this->actingAs($admin)
            ->post(route('admin.users.store'), $this->accountData(['role' => 'veterinarian']))
            ->assertSessionHasNoErrors();

        $vet = User::query()->where('username', 'dochaerin')->firstOrFail();
        $this->assertSame('Haerin Kang Lee', $vet->name);
        $this->assertSame('veterinarian', $vet->role);
        $this->assertSame('Active', $vet->status);
        $this->assertNotNull($vet->email_verified_at);
        $this->assertTrue(Hash::check('secret123', $vet->password));

        $this->post('/logout');
        $this->post('/login', ['username' => 'dochaerin', 'password' => 'secret123'])
            ->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($vet);
        $this->assertNotNull($vet->fresh()->last_login_at);
    }

    public function test_create_validates_role_and_uniqueness(): void
    {
        $admin = $this->makeUser('admin');
        $existing = $this->makeUser('customer');

        $this->actingAs($admin)
            ->post(route('admin.users.store'), $this->accountData([
                'role' => 'superuser',
                'email' => $existing->email,
                'password_confirmation' => 'different1',
            ]))
            ->assertSessionHasErrors(['role', 'email', 'password']);

        $this->assertSame(2, User::query()->count());
    }

    public function test_admin_can_update_details_and_change_role(): void
    {
        $admin = $this->makeUser('admin');
        $user = $this->makeUser('customer');

        $this->actingAs($admin)
            ->put(route('admin.users.update', $user), $this->accountData([
                'role' => 'clerk',
                'password' => '',
                'password_confirmation' => '',
            ]))
            ->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertSame('clerk', $user->role);
        $this->assertSame('haerin@example.test', $user->email);
        $this->assertTrue(Hash::check('password', $user->password), 'A blank password keeps the old one.');

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('dashboard.role', ['role' => 'clerk']));
    }

    public function test_changing_a_role_keeps_the_users_profile_photo(): void
    {
        $admin = $this->makeUser('admin');
        $user = $this->makeUser('customer', ['profile_photo_path' => '12/me.jpg']);
        $photoUrl = $user->profilePhotoUrl();

        foreach (['clerk', 'veterinarian', 'owner', 'admin'] as $role) {
            $this->actingAs($admin)
                ->put(route('admin.users.update', $user), $this->accountData([
                    'username' => $user->username,
                    'email' => $user->email,
                    'role' => $role,
                    'password' => '',
                    'password_confirmation' => '',
                ]))
                ->assertSessionHasNoErrors();

            $user->refresh();
            $this->assertSame('12/me.jpg', $user->profile_photo_path);

            $this->actingAs($user)
                ->get(route('dashboard.role', ['role' => $role]))
                ->assertInertia(fn (Assert $page) => $page->where('profile.photoUrl', $photoUrl));
        }
    }

    public function test_admin_can_reset_a_users_password(): void
    {
        $admin = $this->makeUser('admin');
        $user = $this->makeUser('clerk');

        $this->actingAs($admin)
            ->put(route('admin.users.update', $user), $this->accountData(['role' => 'clerk', 'password' => 'newpass99', 'password_confirmation' => 'newpass99']))
            ->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('newpass99', $user->fresh()->password));
    }

    public function test_deactivated_user_cannot_sign_in_and_is_signed_out(): void
    {
        $admin = $this->makeUser('admin');
        $clerk = $this->makeUser('clerk', ['username' => 'maloi']);

        $this->actingAs($admin)
            ->patch(route('admin.users.status', $clerk), ['status' => 'Inactive'])
            ->assertSessionHasNoErrors();
        $this->assertSame('Inactive', $clerk->fresh()->status);

        // Already signed in: kicked out on the next request.
        $this->actingAs($clerk->fresh())
            ->get(route('dashboard.role', ['role' => 'clerk']))
            ->assertRedirect(route('login'));
        $this->assertGuest();

        // Can't sign in again.
        $this->post('/login', ['username' => 'maloi', 'password' => 'password'])
            ->assertSessionHasErrors('username');
        $this->assertGuest();

        // Reactivated: can sign in again.
        $this->actingAs($admin)
            ->patch(route('admin.users.status', $clerk), ['status' => 'Active'])
            ->assertSessionHasNoErrors();
        $this->post('/logout');
        $this->post('/login', ['username' => 'maloi', 'password' => 'password'])
            ->assertRedirect(route('dashboard'));
    }

    public function test_admin_cannot_lock_themselves_out(): void
    {
        $admin = $this->makeUser('admin');

        $this->actingAs($admin)
            ->patch(route('admin.users.status', $admin), ['status' => 'Inactive'])
            ->assertSessionHasErrors('status');

        $this->actingAs($admin)
            ->put(route('admin.users.update', $admin), $this->accountData(['role' => 'clerk', 'password' => '', 'password_confirmation' => '']))
            ->assertSessionHasErrors('role');

        $admin->refresh();
        $this->assertSame('admin', $admin->role);
        $this->assertSame('Active', $admin->status);
    }

    public function test_only_admins_can_manage_users(): void
    {
        $target = $this->makeUser('customer');

        foreach (['customer', 'clerk', 'veterinarian', 'owner'] as $role) {
            $user = $this->makeUser($role);

            $this->actingAs($user)->post(route('admin.users.store'), $this->accountData(['role' => 'admin']))->assertForbidden();
            $this->actingAs($user)->put(route('admin.users.update', $target), $this->accountData(['role' => 'admin']))->assertForbidden();
            $this->actingAs($user)->patch(route('admin.users.status', $target), ['status' => 'Inactive'])->assertForbidden();
        }

        $this->assertSame('customer', $target->fresh()->role);
        $this->assertSame('Active', $target->fresh()->status);
        $this->assertFalse(User::query()->where('username', 'dochaerin')->exists());
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

    /** @param array<string, mixed> $overrides */
    private function accountData(array $overrides = []): array
    {
        return [
            'first_name' => 'Haerin',
            'middle_name' => 'Kang',
            'last_name' => 'Lee',
            'username' => 'dochaerin',
            'email' => 'Haerin@Example.test',
            'phone' => '09171234567',
            'address' => 'Blk 1 Lot 2, Quezon City',
            'role' => 'clerk',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            ...$overrides,
        ];
    }
}
