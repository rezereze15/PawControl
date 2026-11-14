<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;
use Mockery;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    /** Pretend Google returned this profile after the server-side code exchange. */
    private function fakeGoogleUser(array $overrides = []): void
    {
        $data = array_merge([
            'sub' => 'google-sub-123',
            'email' => 'jane@gmail.com',
            'name' => 'Jane Doe',
            'picture' => 'https://lh3.googleusercontent.com/a/photo.jpg',
            'email_verified' => true,
        ], $overrides);

        $googleUser = (new GoogleUser)->setRaw($data)->map([
            'id' => $data['sub'],
            'name' => $data['name'],
            'email' => $data['email'],
            'avatar' => $data['picture'],
        ]);

        $provider = Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
        $provider->shouldReceive('user')->andReturn($googleUser);
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_redirect_sends_user_to_google(): void
    {
        config(['services.google.client_id' => 'test-client-id', 'services.google.client_secret' => 'x']);

        $this->get(route('google.redirect'))
            ->assertRedirectContains('https://accounts.google.com/o/oauth2/auth');
    }

    public function test_new_google_user_is_created_and_logged_in(): void
    {
        $this->fakeGoogleUser();

        $this->get(route('google.callback', ['code' => 'abc', 'state' => 'xyz']))
            ->assertRedirect(route('dashboard'));

        $user = User::sole();
        $this->assertAuthenticatedAs($user);
        $this->assertSame('google-sub-123', $user->google_id);
        $this->assertSame('jane@gmail.com', $user->email);
        $this->assertSame('Jane Doe', $user->name);
        $this->assertSame('https://lh3.googleusercontent.com/a/photo.jpg', $user->profilePhotoUrl());
        $this->assertSame('customer', $user->role);
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue($user->needs_profile_completion); // modal will ask for username/phone/address
    }

    public function test_returning_google_user_is_found_by_sub_not_duplicated(): void
    {
        $existing = User::factory()->create(['google_id' => 'google-sub-123', 'email' => 'old@gmail.com', 'status' => 'Active', 'role' => 'customer']);
        $this->fakeGoogleUser(['email' => 'new-address@gmail.com']);

        $this->get(route('google.callback', ['code' => 'abc']))->assertRedirect(route('dashboard'));

        $this->assertDatabaseCount('users', 1);
        $this->assertAuthenticatedAs($existing);
    }

    public function test_existing_password_account_with_same_verified_email_is_linked(): void
    {
        $existing = User::factory()->create(['email' => 'jane@gmail.com', 'password' => Hash::make('secret123'), 'status' => 'Active', 'role' => 'customer']);
        $this->fakeGoogleUser();

        $this->get(route('google.callback', ['code' => 'abc']))->assertRedirect(route('dashboard'));

        $this->assertDatabaseCount('users', 1);
        $this->assertSame('google-sub-123', $existing->fresh()->google_id);
        $this->assertFalse($existing->fresh()->needs_profile_completion); // already has full details
        $this->assertAuthenticatedAs($existing);
    }

    public function test_inactive_account_cannot_sign_in_with_google(): void
    {
        User::factory()->create(['google_id' => 'google-sub-123', 'status' => 'Inactive', 'role' => 'customer']);
        $this->fakeGoogleUser();

        $this->get(route('google.callback', ['code' => 'abc']))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('username');
        $this->assertGuest();
    }

    public function test_cancelled_google_sign_in_shows_error(): void
    {
        $this->get(route('google.callback', ['error' => 'access_denied']))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('username');
        $this->assertGuest();
    }

    public function test_dashboard_requires_login(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }
}
