<?php

namespace Tests\Feature;

use App\Mail\RegistrationVerificationCode;
use App\Models\PendingRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RegistrationVerificationTest extends TestCase
{
    use RefreshDatabase;

    private function registrationData(array $overrides = []): array
    {
        return array_merge([
            'first_name' => 'Jane',
            'middle_name' => '',
            'last_name' => 'Doe',
            'username' => 'janedoe',
            'address' => '123 Main St',
            'email' => 'jane@gmail.com',
            'phone' => '09171234567',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], $overrides);
    }

    /** Registers and returns the plain code captured from the faked mail. */
    private function registerAndCaptureCode(): string
    {
        $this->post('/register', $this->registrationData())->assertRedirect(route('register.verify'));

        $code = null;
        Mail::assertSent(RegistrationVerificationCode::class, function ($mail) use (&$code) {
            $code = $mail->code;

            return $mail->hasTo('jane@gmail.com');
        });

        return $code;
    }

    public function test_register_creates_pending_registration_and_emails_hashed_code(): void
    {
        Mail::fake();

        $code = $this->registerAndCaptureCode();

        $this->assertDatabaseCount('users', 0);
        $pending = PendingRegistration::sole();
        $this->assertMatchesRegularExpression('/^\d{6}$/', $code);
        $this->assertNotSame($code, $pending->code_hash);
        $this->assertTrue(Hash::check($code, $pending->code_hash));
        $this->assertSame($pending->id, session(PendingRegistration::SESSION_KEY));

        $this->get(route('register.verify'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('VerifyCode')->where('maskedEmail', 'j***@gmail.com'));
    }

    public function test_correct_code_creates_verified_user_and_logs_in(): void
    {
        Mail::fake();
        $code = $this->registerAndCaptureCode();

        $this->post('/register/verify', ['code' => $code])->assertRedirect(route('dashboard'));

        $user = User::sole();
        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->email_verified_at);
        $this->assertSame('janedoe', $user->username);
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertDatabaseCount('pending_registrations', 0);
    }

    public function test_wrong_code_counts_attempts_and_invalidates_after_five(): void
    {
        Mail::fake();
        $code = $this->registerAndCaptureCode();
        $wrong = $code === '000000' ? '111111' : '000000';

        for ($i = 1; $i <= 4; $i++) {
            $this->post('/register/verify', ['code' => $wrong])->assertSessionHasErrors('code');
        }
        $this->post('/register/verify', ['code' => $wrong])
            ->assertSessionHasErrors(['code' => 'Too many failed attempts. Please request a new code.']);

        $this->assertNull(PendingRegistration::sole()->code_hash);

        // Even the right code no longer works.
        $this->post('/register/verify', ['code' => $code])->assertSessionHasErrors('code');
        $this->assertGuest();
    }

    public function test_expired_code_is_rejected(): void
    {
        Mail::fake();
        $code = $this->registerAndCaptureCode();

        $this->travel(11)->minutes();

        $this->post('/register/verify', ['code' => $code])
            ->assertSessionHasErrors(['code' => 'Code expired, please request a new one.']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_resend_respects_cooldown_and_issues_new_code(): void
    {
        Mail::fake();
        $this->registerAndCaptureCode();

        $this->post('/register/resend')->assertSessionHasErrors('resend');
        Mail::assertSentCount(1);

        $this->travel(61)->seconds();
        $this->post('/register/resend')->assertSessionHas('success');
        Mail::assertSentCount(2);
    }

    public function test_verify_page_without_pending_registration_redirects_to_register(): void
    {
        $this->get(route('register.verify'))->assertRedirect(route('register'));
        $this->post('/register/verify', ['code' => '123456'])->assertRedirect(route('register'));
    }

    public function test_mail_failure_shows_friendly_error(): void
    {
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP down'));

        $this->from('/register')
            ->post('/register', $this->registrationData())
            ->assertRedirect('/register')
            ->assertSessionHasErrors('email');

        $this->assertDatabaseCount('pending_registrations', 0);
    }
}
