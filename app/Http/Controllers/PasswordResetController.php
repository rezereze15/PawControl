<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetCodeMail;
use App\Models\PasswordResetCode;
use App\Models\User;
use App\Support\EmailMask;
use App\Support\RegistrationRules;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

/**
 * "Forgot password" with a 6-digit emailed code (same approach as registration):
 *   1. ForgotPassword       – enter email, we email a code (if the account exists)
 *   2. ForgotPasswordCode   – enter the code (5 attempts, 10 min expiry, 60s resend cooldown)
 *   3. ResetPassword        – choose a new password (only after a correct code, 10 min window)
 *
 * The flow is tied to the browser via the session; the email never appears in a URL.
 * Responses are identical whether or not the email is registered.
 */
class PasswordResetController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('ForgotPassword');
    }

    public function sendCode(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);
        $email = Str::lower($validated['email']);

        (new PasswordResetCode)->pruneAll();
        $request->session()->forget(PasswordResetCode::VERIFIED_SESSION_KEY);

        if (! $this->issueCode($email)) {
            return back()->withErrors([
                'email' => "We couldn't send the email right now. Please try again in a moment.",
            ]);
        }

        $request->session()->put(PasswordResetCode::SESSION_KEY, ['email' => $email, 'sent_at' => now()->timestamp]);

        return redirect()->route('password.code');
    }

    public function showCode(Request $request): Response|RedirectResponse
    {
        $pending = $request->session()->get(PasswordResetCode::SESSION_KEY);

        if (! $pending) {
            return redirect()->route('password.request');
        }

        return Inertia::render('ForgotPasswordCode', [
            'maskedEmail' => EmailMask::mask($pending['email']),
            'resendAvailableIn' => $this->resendAvailableIn($pending['sent_at']),
            'codeLength' => 6,
        ]);
    }

    public function verifyCode(Request $request): RedirectResponse
    {
        $pending = $request->session()->get(PasswordResetCode::SESSION_KEY);

        if (! $pending) {
            return redirect()->route('password.request');
        }

        $request->validate([
            'code' => ['required', 'digits:6'],
        ], [
            'code.required' => 'Please enter the 6-digit code.',
            'code.digits' => 'The code must be exactly 6 digits.',
        ]);

        $record = PasswordResetCode::where('email', $pending['email'])->first();

        // No record means the email isn't registered: same message as a wrong code.
        if (! $record) {
            return back()->withErrors(['code' => 'Invalid code.']);
        }

        if ($record->code_hash === null) {
            return back()->withErrors(['code' => 'Too many failed attempts. Please request a new code.']);
        }

        if ($record->isExpired()) {
            return back()->withErrors(['code' => 'Code expired, please request a new one.']);
        }

        if (! Hash::check($request->string('code')->toString(), $record->code_hash)) {
            $record->attempts++;

            if ($record->attempts >= PasswordResetCode::MAX_ATTEMPTS) {
                $record->code_hash = null;
                $record->save();

                return back()->withErrors(['code' => 'Too many failed attempts. Please request a new code.']);
            }

            $record->save();
            $remaining = PasswordResetCode::MAX_ATTEMPTS - $record->attempts;

            return back()->withErrors([
                'code' => "Invalid code. You have {$remaining} ".str('attempt')->plural($remaining).' left.',
            ]);
        }

        // Correct: the code is single-use, so remove it now. The session flag below
        // is what unlocks the reset page, for 10 minutes.
        $record->delete();

        $request->session()->forget(PasswordResetCode::SESSION_KEY);
        $request->session()->put(PasswordResetCode::VERIFIED_SESSION_KEY, [
            'email' => $pending['email'],
            'expires_at' => now()->addMinutes(PasswordResetCode::CODE_TTL_MINUTES)->timestamp,
        ]);
        $request->session()->regenerate();

        return redirect()->route('password.reset');
    }

    public function resend(Request $request): RedirectResponse
    {
        $pending = $request->session()->get(PasswordResetCode::SESSION_KEY);

        if (! $pending) {
            return redirect()->route('password.request');
        }

        $wait = $this->resendAvailableIn($pending['sent_at']);

        if ($wait > 0) {
            return back()->withErrors(['resend' => "Please wait {$wait} seconds before requesting a new code."]);
        }

        if (! $this->issueCode($pending['email'])) {
            return back()->withErrors(['resend' => "We couldn't send a new code right now. Please try again in a moment."]);
        }

        $request->session()->put(PasswordResetCode::SESSION_KEY, ['email' => $pending['email'], 'sent_at' => now()->timestamp]);

        return back()->with('success', 'If an account exists, a new code has been sent.');
    }

    public function edit(Request $request): Response|RedirectResponse
    {
        if (! $this->verifiedEmail($request)) {
            return redirect()->route('password.request');
        }

        return Inertia::render('ResetPassword');
    }

    public function update(Request $request): RedirectResponse
    {
        $email = $this->verifiedEmail($request);

        if (! $email) {
            return redirect()->route('password.request')
                ->withErrors(['email' => 'Your reset session expired. Please request a new code.']);
        }

        $validated = $request->validate(RegistrationRules::password());

        $user = User::where('email', $email)->first();

        if ($user) {
            $user->password = Hash::make($validated['password']);
            // Invalidates "remember me" cookies; other logged-in sessions are signed
            // out by the auth.session middleware because the password hash changed.
            $user->setRememberToken(Str::random(60));
            $user->save();
        }

        PasswordResetCode::where('email', $email)->delete();
        $request->session()->forget([PasswordResetCode::SESSION_KEY, PasswordResetCode::VERIFIED_SESSION_KEY]);
        $request->session()->regenerate();

        return redirect()->route('login')->with('success', 'Password updated. You can now log in.');
    }

    /**
     * Emails a fresh code if (and only if) a user has this email. Returns false only
     * when sending failed; a missing user is a silent success so nothing is revealed.
     */
    private function issueCode(string $email): bool
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return true;
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        try {
            Mail::to($user->email)->send(new PasswordResetCodeMail($code, $user->name));
        } catch (Throwable $exception) {
            Log::error('Failed to send password reset code.', ['exception' => $exception]);

            return false;
        }

        PasswordResetCode::updateOrCreate(['email' => $email], [
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(PasswordResetCode::CODE_TTL_MINUTES),
            'attempts' => 0,
            'last_sent_at' => now(),
        ]);

        return true;
    }

    private function resendAvailableIn(int $sentAt): int
    {
        return max(0, PasswordResetCode::RESEND_COOLDOWN_SECONDS - (now()->timestamp - $sentAt));
    }

    /** Email from the post-verification session flag, or null if missing/expired. */
    private function verifiedEmail(Request $request): ?string
    {
        $verified = $request->session()->get(PasswordResetCode::VERIFIED_SESSION_KEY);

        if (! $verified || $verified['expires_at'] < now()->timestamp) {
            $request->session()->forget(PasswordResetCode::VERIFIED_SESSION_KEY);

            return null;
        }

        return $verified['email'];
    }
}
