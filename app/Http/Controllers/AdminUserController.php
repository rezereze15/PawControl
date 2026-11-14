<?php

namespace App\Http\Controllers;

use App\Http\Requests\ManagedUserRequest;
use App\Models\Role;
use App\Models\User;
use App\Support\RegistrationRules;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Admin: create, update, activate/deactivate user accounts and assign roles.
 * Accounts are never deleted; deactivating blocks sign-in and keeps the records
 * (pets, appointments) linked to them.
 */
class AdminUserController extends Controller
{
    public function store(ManagedUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = new User([
            'name' => RegistrationRules::fullName($validated),
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'role' => $validated['role'],
            'status' => User::STATUS_ACTIVE,
            'password' => $validated['password'],
        ]);
        // The admin vouches for the address, so no emailed verification code is needed.
        $user->forceFill(['email_verified_at' => now()])->save();

        return back()->with('success', "Account created for {$user->name} as ".Role::LABELS[$validated['role']].'.');
    }

    public function update(ManagedUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        if ($error = $this->guardChange($request->user(), $user, $validated['role'], $user->status)) {
            return back()->withErrors(['role' => $error]);
        }

        $user->fill([
            'name' => RegistrationRules::fullName($validated),
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'role' => $validated['role'],
        ]);

        if (! empty($validated['password'])) {
            $user->password = $validated['password'];
            // A new password also ends "remember me" sign-ins on other devices.
            $user->setRememberToken(Str::random(60));
        }

        $user->save();

        return back()->with('success', "{$user->name}'s account was updated.");
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([User::STATUS_ACTIVE, User::STATUS_INACTIVE])],
        ]);

        if ($error = $this->guardChange($request->user(), $user, $user->role, $validated['status'])) {
            return back()->withErrors(['status' => $error]);
        }

        $user->status = $validated['status'];

        if ($validated['status'] === User::STATUS_INACTIVE) {
            // Ends "remember me" sign-ins; open sessions end on their next request (EnsureUserIsActive).
            $user->setRememberToken(Str::random(60));
        }

        $user->save();

        return back()->with('success', $validated['status'] === User::STATUS_ACTIVE
            ? "{$user->name}'s account was activated."
            : "{$user->name}'s account was deactivated. They can no longer sign in.");
    }

    /**
     * Stop an admin from locking themselves out. Because only an active admin can
     * reach these routes, this also guarantees at least one active admin remains.
     * Returns an error message, or null when the change is allowed.
     */
    private function guardChange(User $actor, User $target, string $newRole, string $newStatus): ?string
    {
        if (! $actor->is($target)) {
            return null;
        }

        if ($newRole !== $target->role) {
            return 'You cannot change your own role. Ask another admin to do it.';
        }

        if ($newStatus !== User::STATUS_ACTIVE) {
            return 'You cannot deactivate your own account.';
        }

        return null;
    }
}
