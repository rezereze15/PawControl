<?php

namespace Tests\Feature;

use App\Mail\PasswordResetCodeMail;
use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(): User
    {
        return User::factory()->create([
            'email' => 'jane@gmail.com',
            'username' => 'janedoe',
            'password' => Hash::make('old-password1'),
            'role' => 'customer',
            'status' => 'Active',
        ]);
    }

    /** Requests a code and returns the plain code captured from the faked mail. */
    private function requestCode(string $email = 'jane@gmail.com'): ?string
    {
        $this->post(route('password.email'), ['email' => $email])->assertRedirect(route('password.code'));

        $code = null;
        Mail::assertSent(PasswordResetCodeMail::class, function ($mail) use (&$code) {
            $code = $mail->code;

            return true;
        });

        return $code;
    }

    public function test_code_is_hashed_and_page_shows_masked_email(): void
    {
        Mail::fake();
        $this->makeUser();

        $code = $this->requestCode();

        $record = PasswordResetCode::sole();
        $this->assertNotSame($code, $record->code_hash);
        $this->assertTrue(Hash::check($code, $record->code_hash));

        $this->get(route('password.code'))
            ->assertInertia(fn ($page) => $page->component('ForgotPasswordCode')->where('maskedEmail', 'j***@gmail.com'));
    }

    public function test_unknown_email_gets_identical_response_and_no_mail(): void
    {
        Mail::fake();

        $this->post(route('password.email'), ['email' => 'nobody@gmail.com'])
            ->assertRedirect(route('password.code'))
            ->assertSessionHasNoErrors();

        Mail::assertNothingSent();
        $this->assertDatabaseCount('password_reset_codes', 0);
        $this->get(route('password.code'))->assertInertia(fn ($page) => $page->where('maskedEmail', 'n***@gmail.com'));

        // Any code is just "invalid"; nothing reveals that the account doesn't exist.
        $this->post(route('password.code.verify'), ['code' => '123456'])
            ->assertSessionHasErrors(['code' => 'Invalid code.']);
    }

    public function test_invalid_email_format_is_rejected(): void
    {
        $this->post(route('password.email'), ['email' => 'not-an-email'])->assertSessionHasErrors('email');
    }

    public function test_wrong_code_five_times_invalidates_it(): void
    {
        Mail::fake();
        $this->makeUser();
        $code = $this->requestCode();
        $wrong = $code === '000000' ? '111111' : '000000';

        for ($i = 1; $i <= 4; $i++) {
            $this->post(route('password.code.verify'), ['code' => $wrong])->assertSessionHasErrors('code');
        }
        $this->post(route('password.code.verify'), ['code' => $wrong])
            ->assertSessionHasErrors(['code' => 'Too many failed attempts. Please request a new code.']);

        $this->post(route('password.code.verify'), ['code' => $code])->assertSessionHasErrors('code');
        $this->get(route('password.reset'))->assertRedirect(route('password.request'));
    }

    public function test_expired_code_is_rejected(): void
    {
        Mail::fake();
        $this->makeUser();
        $code = $this->requestCode();

        $this->travel(11)->minutes();

        $this->post(route('password.code.verify'), ['code' => $code])
            ->assertSessionHasErrors(['code' => 'Code expired, please request a new one.']);
    }

    public function test_resend_respects_cooldown_and_replaces_code(): void
    {
        Mail::fake();
        $this->makeUser();
        $first = $this->requestCode();

        $this->post(route('password.code.resend'))->assertSessionHasErrors('resend');

        $this->travel(61)->seconds();
        $this->post(route('password.code.resend'))->assertSessionHas('success');
        Mail::assertSentCount(2);

        $codes = Mail::sent(PasswordResetCodeMail::class)->map(fn ($mail) => $mail->code)->values();
        $second = $codes[1];
        $hash = PasswordResetCode::sole()->code_hash;
        $this->assertTrue(Hash::check($second, $hash));
        if ($first !== $second) {
            $this->assertFalse(Hash::check($first, $hash)); // old code no longer works
        }
    }

    public function test_mail_failure_shows_friendly_error(): void
    {
        $this->makeUser();
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP down'));

        $this->from(route('password.request'))
            ->post(route('password.email'), ['email' => 'jane@gmail.com'])
            ->assertRedirect(route('password.request'))
            ->assertSessionHasErrors('email');
        $this->assertDatabaseCount('password_reset_codes', 0);
    }

    public function test_reset_page_requires_verified_code(): void
    {
        $this->get(route('password.reset'))->assertRedirect(route('password.request'));
        $this->post(route('password.update'), ['password' => 'new-password1', 'password_confirmation' => 'new-password1'])
            ->assertRedirect(route('password.request'));
        $this->get(route('password.code'))->assertRedirect(route('password.request'));
    }

    public function test_full_reset_flow_and_login_with_new_password(): void
    {
        Mail::fake();
        $user = $this->makeUser();
        $oldRememberToken = $user->remember_token;
        $code = $this->requestCode();

        $this->post(route('password.code.verify'), ['code' => $code])->assertRedirect(route('password.reset'));
        $this->assertDatabaseCount('password_reset_codes', 0); // single use

        $this->get(route('password.reset'))->assertInertia(fn ($page) => $page->component('ResetPassword'));

        // Same rules as registration.
        $this->post(route('password.update'), ['password' => 'short', 'password_confirmation' => 'short'])
            ->assertSessionHasErrors('password');

        $this->post(route('password.update'), ['password' => 'new-password1', 'password_confirmation' => 'new-password1'])
            ->assertRedirect(route('login'))
            ->assertSessionHas('success', 'Password updated. You can now log in.');

        $user->refresh();
        $this->assertTrue(Hash::check('new-password1', $user->password));
        $this->assertNotSame($oldRememberToken, $user->remember_token);

        // The verified flag is gone: the reset page can't be reused.
        $this->get(route('password.reset'))->assertRedirect(route('password.request'));

        $this->post('/login', ['username' => 'janedoe', 'password' => 'old-password1'])->assertSessionHasErrors('username');
        $this->post('/login', ['username' => 'janedoe', 'password' => 'new-password1'])->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_verified_flag_expires_after_ten_minutes(): void
    {
        Mail::fake();
        $this->makeUser();
        $code = $this->requestCode();
        $this->post(route('password.code.verify'), ['code' => $code]);

        $this->travel(11)->minutes();

        $this->get(route('password.reset'))->assertRedirect(route('password.request'));
    }

    public function test_other_sessions_are_logged_out_after_password_change(): void
    {
        $user = $this->makeUser();

        // An existing logged-in session (auth.session stores the password hash in it).
        $this->actingAs($user)->get(route('dashboard.role', ['role' => 'customer']))->assertOk();

        // Password changes elsewhere (e.g. via forgot password in another browser).
        $user->forceFill(['password' => Hash::make('changed-password1')])->save();

        $this->get(route('dashboard.role', ['role' => 'customer']))->assertRedirect(route('login'));
    }
}
