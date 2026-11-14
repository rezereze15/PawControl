<?php

namespace App\Support;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Validation rules shared by the register form (AuthController::register) and the
 * "complete your profile" modal for Google users, so the two can never drift apart.
 */
final class RegistrationRules
{
    /** @return array<string, array<int, mixed>> */
    public static function name(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function username(?int $ignoreUserId = null): array
    {
        return [
            'username' => ['required', 'string', 'min:3', 'max:50', 'alpha_dash', Rule::unique('users', 'username')->ignore($ignoreUserId)],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function contact(): array
    {
        return [
            'address' => ['required', 'string', 'max:500'],
            'phone' => ['required', 'string', 'max:30'],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function email(): array
    {
        return [
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
        ];
    }

    /** @return array<string, array<int, mixed>> */
    public static function password(): array
    {
        return [
            'password' => ['required', 'confirmed', Password::min(8)],
        ];
    }

    /** Joins first / middle / last into the single `name` column. */
    public static function fullName(array $validated): string
    {
        return trim(implode(' ', array_filter([
            $validated['first_name'] ?? null,
            $validated['middle_name'] ?? null,
            $validated['last_name'] ?? null,
        ])));
    }

    /**
     * Best-effort split of a stored full name for pre-filling the form:
     * last word becomes the last name, the rest the first name.
     *
     * @return array{first_name: string, middle_name: string, last_name: string}
     */
    public static function splitName(?string $name): array
    {
        $parts = preg_split('/\s+/', trim((string) $name), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $last = count($parts) > 1 ? array_pop($parts) : '';

        return [
            'first_name' => implode(' ', $parts),
            'middle_name' => '',
            'last_name' => $last,
        ];
    }
}
