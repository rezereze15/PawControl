<?php

namespace App\Http\Controllers;

use App\Support\RegistrationRules;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Saves the "complete your profile" modal shown on the dashboard to Google users.
 * Uses the same validation rules as the register form (minus email + password).
 */
class ProfileCompletionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Only for users who still need it; this is not a general profile editor.
        if ($user->hasCompleteProfile()) {
            return redirect()->route('dashboard');
        }

        $validated = $request->validate([
            ...RegistrationRules::name(),
            ...RegistrationRules::username($user->id),
            ...RegistrationRules::contact(),
        ]);

        $user->update([
            'name' => RegistrationRules::fullName($validated),
            'username' => $validated['username'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'needs_profile_completion' => false,
        ]);

        return redirect()->route('dashboard')->with('success', 'Your profile is complete. Welcome to PawControl!');
    }
}
