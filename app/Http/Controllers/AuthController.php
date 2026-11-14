<?php

namespace App\Http\Controllers;

use App\Mail\RegistrationVerificationCode;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Support\RegistrationRules;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AuthController extends Controller
{
    public function create(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Login');
    }

    public function showRegistration(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Register');
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            ...RegistrationRules::name(),
            ...RegistrationRules::username(),
            ...RegistrationRules::contact(),
            ...RegistrationRules::email(),
            ...RegistrationRules::password(),
        ]);

        $name = RegistrationRules::fullName($validated);

        // The real User is created only after the emailed code is verified.
        (new PendingRegistration)->pruneAll();

        PendingRegistration::query()
            ->where('email', $validated['email'])
            ->when(
                $request->session()->get(PendingRegistration::SESSION_KEY),
                fn ($query, $id) => $query->orWhere('id', $id),
            )
            ->delete();

        $code = PendingRegistration::generateCode();

        if (! $this->sendVerificationCode($validated['email'], $name, $code)) {
            return back()->withErrors([
                'email' => "We couldn't send a verification email to this address right now. Please check it and try again in a moment.",
            ]);
        }

        $pending = PendingRegistration::create([
            'name' => $name,
            'username' => $validated['username'],
            'address' => $validated['address'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'code_hash' => Hash::make($code),
            'code_expires_at' => now()->addMinutes(PendingRegistration::CODE_TTL_MINUTES),
            'attempts' => 0,
            'last_sent_at' => now(),
        ]);

        $request->session()->put(PendingRegistration::SESSION_KEY, $pending->id);

        return redirect()->route('register.verify');
    }

    public function showVerification(Request $request): Response|RedirectResponse
    {
        $pending = $this->pendingRegistration($request);

        if (! $pending) {
            return redirect()->route('register');
        }

        return Inertia::render('VerifyCode', [
            'maskedEmail' => $pending->maskedEmail(),
            'resendAvailableIn' => $pending->resendAvailableIn(),
            'codeLength' => 6,
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $pending = $this->pendingRegistration($request);

        if (! $pending) {
            return redirect()->route('register');
        }

        $request->validate([
            'code' => ['required', 'digits:6'],
        ], [
            'code.required' => 'Please enter the 6-digit code.',
            'code.digits' => 'The code must be exactly 6 digits.',
        ]);

        if ($pending->code_hash === null) {
            return back()->withErrors([
                'code' => 'Too many failed attempts. Please request a new code.',
            ]);
        }

        if ($pending->isExpired()) {
            return back()->withErrors([
                'code' => 'Code expired, please request a new one.',
            ]);
        }

        if (! Hash::check($request->string('code')->toString(), $pending->code_hash)) {
            $pending->attempts++;

            if ($pending->attempts >= PendingRegistration::MAX_ATTEMPTS) {
                $pending->code_hash = null;
                $pending->save();

                return back()->withErrors([
                    'code' => 'Too many failed attempts. Please request a new code.',
                ]);
            }

            $pending->save();
            $remaining = PendingRegistration::MAX_ATTEMPTS - $pending->attempts;

            return back()->withErrors([
                'code' => "Invalid code. You have {$remaining} ".str('attempt')->plural($remaining).' left.',
            ]);
        }

        // Someone may have claimed the email/username while this was pending.
        if (User::where('email', $pending->email)->exists() || User::where('username', $pending->username)->exists()) {
            $pending->delete();
            $request->session()->forget(PendingRegistration::SESSION_KEY);

            return redirect()->route('register')->withErrors([
                'email' => 'This email or username was taken while you were verifying. Please register again.',
            ]);
        }

        $user = DB::transaction(function () use ($pending): User {
            $user = new User([
                'name' => $pending->name,
                'username' => $pending->username,
                'address' => $pending->address,
                'email' => $pending->email,
                'phone' => $pending->phone,
                'password' => $pending->password, // already hashed; the "hashed" cast won't rehash it
                'role' => 'customer',
                'status' => 'Active',
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();

            $pending->delete();

            return $user;
        });

        $request->session()->forget(PendingRegistration::SESSION_KEY);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }

    public function resend(Request $request): RedirectResponse
    {
        $pending = $this->pendingRegistration($request);

        if (! $pending) {
            return redirect()->route('register');
        }

        $wait = $pending->resendAvailableIn();

        if ($wait > 0) {
            return back()->withErrors([
                'resend' => "Please wait {$wait} seconds before requesting a new code.",
            ]);
        }

        $code = PendingRegistration::generateCode();

        if (! $this->sendVerificationCode($pending->email, $pending->name, $code)) {
            return back()->withErrors([
                'resend' => "We couldn't send a new code right now. Please try again in a moment.",
            ]);
        }

        $pending->update([
            'code_hash' => Hash::make($code),
            'code_expires_at' => now()->addMinutes(PendingRegistration::CODE_TTL_MINUTES),
            'attempts' => 0,
            'last_sent_at' => now(),
        ]);

        return back()->with('success', 'A new verification code has been sent to your email.');
    }

    public function cancel(Request $request): RedirectResponse
    {
        $this->pendingRegistration($request)?->delete();
        $request->session()->forget(PendingRegistration::SESSION_KEY);

        return redirect()->route('register');
    }

    private function pendingRegistration(Request $request): ?PendingRegistration
    {
        $id = $request->session()->get(PendingRegistration::SESSION_KEY);

        return $id ? PendingRegistration::find($id) : null;
    }

    /** Sends the code synchronously; returns false (and logs) instead of throwing on failure. */
    private function sendVerificationCode(string $email, string $name, string $code): bool
    {
        try {
            Mail::to($email)->send(new RegistrationVerificationCode($code, $name));

            return true;
        } catch (Throwable $exception) {
            Log::error('Failed to send registration verification code.', [
                'email' => $email,
                'exception' => $exception,
            ]);

            return false;
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $credentials = [
            'username' => $validated['username'],
            'password' => $validated['password'],
            'status' => 'Active',
        ];

        $authenticated = Auth::attempt($credentials);

        if (! $authenticated && filter_var($validated['username'], FILTER_VALIDATE_EMAIL)) {
            $authenticated = Auth::attempt([
                'email' => $validated['username'],
                'password' => $validated['password'],
                'status' => 'Active',
            ]);
        }

        if (! $authenticated) {
            return back()->withErrors([
                'username' => 'The username or password is incorrect, or this account is inactive.',
            ])->onlyInput('username');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }
}
