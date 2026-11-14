<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileCompletionTest extends TestCase
{
    use RefreshDatabase;

    /** A user as created by GoogleAuthController for a brand-new Google account. */
    private function googleSignup(array $overrides = []): User
    {
        return User::factory()->create(array_merge([
            'name' => 'Jane Marie Doe',
            'email' => 'jane@gmail.com',
            'google_id' => 'google-sub-123',
            'username' => null,
            'phone' => null,
            'address' => null,
            'role' => 'customer',
            'status' => 'Active',
            'needs_profile_completion' => true,
        ], $overrides));
    }

    private function validForm(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Jane',
            'middle_name' => 'Marie',
            'last_name' => 'Doe',
            'username' => 'janedoe',
            'phone' => '09171234567',
            'address' => '123 Main St',
        ], $overrides);
    }

    public function test_incomplete_user_gets_modal_props_and_no_dashboard_data(): void
    {
        $user = $this->googleSignup();

        $this->actingAs($user)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->where('profileCompletion.email', 'jane@gmail.com')
                ->where('profileCompletion.first_name', 'Jane Marie')
                ->where('profileCompletion.last_name', 'Doe')
                ->missing('pets')
                ->missing('customerAppointments')
                ->missing('owner'));
    }

    public function test_incomplete_user_is_blocked_from_other_actions(): void
    {
        $user = $this->googleSignup();

        // Page/Inertia request: bounced back to the dashboard (and its modal).
        $this->actingAs($user)
            ->post(route('pets.store'), ['petName' => 'Rex'])
            ->assertRedirect(route('dashboard'));

        // API-style request: 403 JSON.
        $this->actingAs($user)
            ->getJson(route('appointments.availability'))
            ->assertForbidden()
            ->assertJson(['message' => 'Please complete your profile to continue.']);

        $this->actingAs($user)
            ->putJson(route('settings.address.update'), ['address' => 'x'])
            ->assertForbidden();
    }

    public function test_invalid_input_returns_register_form_errors(): void
    {
        User::factory()->create(['username' => 'taken']);
        $user = $this->googleSignup();

        $this->actingAs($user)
            ->post(route('profile.complete'), $this->validForm([
                'first_name' => '',
                'username' => 'taken',
                'phone' => '',
                'address' => '',
            ]))
            ->assertSessionHasErrors(['first_name', 'username', 'phone', 'address']);

        $this->assertTrue($user->fresh()->needs_profile_completion);
    }

    public function test_saving_completes_profile_and_unlocks_dashboard(): void
    {
        $user = $this->googleSignup();

        $this->actingAs($user)
            ->post(route('profile.complete'), $this->validForm())
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success');

        $user->refresh();
        $this->assertFalse($user->needs_profile_completion);
        $this->assertSame('Jane Marie Doe', $user->name);
        $this->assertSame('janedoe', $user->username);
        $this->assertSame('09171234567', $user->phone);
        $this->assertSame('123 Main St', $user->address);
        $this->assertSame('jane@gmail.com', $user->email); // email is never editable here

        $this->actingAs($user)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn ($page) => $page->missing('profileCompletion')->has('pets'));

        $this->actingAs($user)->getJson(route('appointments.availability'))->assertStatus(422); // reaches the controller now
    }

    public function test_complete_users_never_see_the_modal_and_cannot_reuse_the_endpoint(): void
    {
        $user = User::factory()->create(['role' => 'customer', 'status' => 'Active', 'username' => 'normaluser']);

        $this->actingAs($user)
            ->get(route('dashboard.role', ['role' => 'customer']))
            ->assertInertia(fn ($page) => $page->missing('profileCompletion'));

        $this->actingAs($user)
            ->post(route('profile.complete'), $this->validForm(['username' => 'hijacked']))
            ->assertRedirect(route('dashboard'));
        $this->assertSame('normaluser', $user->fresh()->username);
    }

    public function test_incomplete_user_can_still_log_out(): void
    {
        $this->actingAs($this->googleSignup())
            ->post(route('logout'))
            ->assertRedirect(route('home'));
        $this->assertGuest();
    }
}
