<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Support\RegistrationRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * Create (POST) or update (PUT) a user account from the admin's Manage Users page.
 * The password is required when creating and optional when updating.
 */
class ManagedUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim((string) $this->input('email'))),
            'username' => trim((string) $this->input('username')),
        ]);
    }

    public function rules(): array
    {
        $managed = $this->route('user');
        $ignoreId = $managed instanceof User ? $managed->getKey() : null;

        return [
            ...RegistrationRules::name(),
            ...RegistrationRules::username($ignoreId),
            ...RegistrationRules::contact(),
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($ignoreId)],
            'role' => ['required', 'string', Rule::exists('roles', 'roleName')],
            'password' => $ignoreId
                ? ['nullable', 'confirmed', Password::min(8)]
                : ['required', 'confirmed', Password::min(8)],
        ];
    }

    public function attributes(): array
    {
        return ['phone' => 'contact number'];
    }
}
