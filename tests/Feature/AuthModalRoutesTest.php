<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Login and Register are modals on the landing page. The old /login and /register
 * URLs still work: they render the landing page with the right modal open.
 */
class AuthModalRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_route_renders_landing_page_with_login_modal(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('landingpage')->where('authModal', 'login'));
    }

    public function test_register_route_renders_landing_page_with_register_modal(): void
    {
        $this->get('/register')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('landingpage')->where('authModal', 'register'));
    }

    public function test_forgot_password_route_renders_landing_page_with_forgot_view(): void
    {
        $this->get('/forgot-password')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('landingpage')->where('authModal', 'forgot'));
    }

    public function test_step_views_without_session_state_fall_back_like_before(): void
    {
        // No pending registration / reset in progress: same redirects as the old pages.
        $this->get('/register/verify')->assertRedirect(route('register'));
        $this->get('/forgot-password/verify')->assertRedirect(route('password.request'));
        $this->get('/reset-password')->assertRedirect(route('password.request'));
    }

    public function test_landing_page_has_no_modal_by_default(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('landingpage')->missing('authModal'));
    }

    public function test_logged_in_users_are_still_sent_to_the_dashboard(): void
    {
        $user = User::factory()->create(['status' => 'Active']);

        $this->actingAs($user)->get('/login')->assertRedirect(route('dashboard'));
        $this->actingAs($user)->get('/register')->assertRedirect(route('dashboard'));
    }

    public function test_guarded_page_redirects_to_login_and_returns_there_after_login(): void
    {
        $user = User::factory()->create(['username' => 'janedoe', 'password' => 'secret-pass1', 'status' => 'Active']);

        // Auth guard still sends guests to /login (now the landing page + modal)...
        $this->get(route('dashboard'))->assertRedirect(route('login'));
        $this->get(route('login'))->assertInertia(fn ($page) => $page->where('authModal', 'login'));

        // ...and the post-login "intended" redirect is unchanged.
        $this->post('/login', ['username' => 'janedoe', 'password' => 'secret-pass1'])
            ->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_flash_messages_reach_the_login_modal(): void
    {
        $this->withSession(['success' => 'Password updated. You can now log in.'])
            ->get('/login')
            ->assertInertia(fn ($page) => $page
                ->where('authModal', 'login')
                ->where('flash.success', 'Password updated. You can now log in.'));
    }

    public function test_failed_login_returns_errors_to_the_page_it_came_from(): void
    {
        User::factory()->create(['username' => 'janedoe', 'password' => 'secret-pass1', 'status' => 'Active']);

        $this->from('/')
            ->post('/login', ['username' => 'janedoe', 'password' => 'wrong'])
            ->assertRedirect('/')
            ->assertSessionHasErrors('username');
    }
}
