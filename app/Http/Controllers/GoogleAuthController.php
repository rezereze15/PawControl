<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirect;
use Throwable;

/**
 * "Sign in with Google" using the OAuth 2.0 authorization-code flow (Laravel Socialite).
 *
 * The browser never hands us a token to trust: Google redirects back with a one-time
 * code, and this server exchanges it with Google directly (using the client secret)
 * for the user's verified profile.
 */
class GoogleAuthController extends Controller
{
    /** Step 1: send the user to Google's sign-in page. */
    public function redirect(): SymfonyRedirect
    {
        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->with(['prompt' => 'select_account'])
            ->redirect();
    }

    /** Step 2: Google sends the user back here with ?code=...&state=... */
    public function callback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            // e.g. the user clicked "Cancel" on Google's screen.
            return $this->failed('Google sign-in was cancelled.');
        }

        try {
            // Validates `state` (CSRF), exchanges the code server-side, then fetches the profile.
            $google = Socialite::driver('google')->user();
        } catch (Throwable $exception) {
            Log::warning('Google sign-in failed.', ['exception' => $exception]);

            return $this->failed('We couldn\'t sign you in with Google. Please try again.');
        }

        $googleId = (string) $google->getId(); // Google's "sub"
        $email = Str::lower((string) $google->getEmail());
        $emailVerified = (bool) ($google->user['email_verified'] ?? false);

        if ($googleId === '' || $email === '') {
            return $this->failed('Your Google account did not share an email address.');
        }

        // 1) Returning Google user: match on the permanent Google ID.
        $user = User::where('google_id', $googleId)->first();

        // 2) Existing PawControl account with the same (Google-verified) email: link it.
        if (! $user) {
            $existing = User::where('email', $email)->first();

            if ($existing && ! $emailVerified) {
                return $this->failed('An account with this email already exists. Please log in with your username and password.');
            }

            if ($existing) {
                $existing->google_id = $googleId;
                $user = $existing;
            }
        }

        // 3) Brand-new user: create the account.
        if (! $user) {
            $user = new User([
                'name' => $google->getName() ?: Str::before($email, '@'),
                'email' => $email,
                'google_id' => $googleId,
                // They sign in with Google; this random password just satisfies the column.
                'password' => Hash::make(Str::random(64)),
                'role' => 'customer',
                'status' => 'Active',
                // Google gives no username/phone/address: the dashboard shows the
                // "complete your profile" modal until these are saved.
                'needs_profile_completion' => true,
            ]);

            if ($emailVerified) {
                $user->email_verified_at = now();
            }
        }

        // Keep the picture fresh on every sign-in.
        $user->avatar = $google->getAvatar();
        $user->save();

        if ($user->status !== 'Active') {
            return $this->failed('This account is inactive. Please contact the clinic.');
        }

        // Start the session (same as the normal username/password login).
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    private function failed(string $message): RedirectResponse
    {
        return redirect()->route('login')->withErrors(['username' => $message]);
    }
}
