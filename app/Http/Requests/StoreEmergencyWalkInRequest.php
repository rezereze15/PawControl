<?php

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Clerk-only: register an emergency walk-in pet and its visit, for either an existing
 * pet owner account (owner_type = existing) or an owner without an account (walk_in).
 */
class StoreEmergencyWalkInRequest extends FormRequest
{
    public const OWNER_EXISTING = 'existing';

    public const OWNER_WALK_IN = 'walk_in';

    public function authorize(): bool
    {
        return $this->user()?->role === Role::CLERK;
    }

    protected function prepareForValidation(): void
    {
        $trim = fn (string $key) => ($value = trim((string) $this->input($key))) === '' ? null : $value;

        $this->merge([
            'petName' => $trim('petName'),
            'breed' => $trim('breed'),
            'notes' => $trim('notes'),
            'walk_in_owner_name' => $trim('walk_in_owner_name'),
            'walk_in_owner_phone' => $trim('walk_in_owner_phone'),
        ]);
    }

    public function rules(): array
    {
        return [
            // Same pet fields and limits as the pet owner's "Add Pet" form (StorePetRequest).
            'petName' => ['required', 'string', 'max:50'],
            'species' => ['required', Rule::in(['Dog', 'Cat'])],
            'breed' => ['required', 'string', 'max:50'],
            'sex' => ['nullable', Rule::in(['Male', 'Female'])],
            'age' => ['nullable', 'integer', 'min:0', 'max:40'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'notes' => ['required', 'string', 'max:1000'],

            'owner_type' => ['required', Rule::in([self::OWNER_EXISTING, self::OWNER_WALK_IN])],
            'owner_id' => [
                Rule::requiredIf($this->input('owner_type') === self::OWNER_EXISTING),
                Rule::prohibitedIf($this->input('owner_type') === self::OWNER_WALK_IN),
                'nullable',
                'integer',
                // Only active pet owner accounts can receive the pet.
                Rule::exists('users', 'id')->where(fn ($query) => $query
                    ->where('status', User::STATUS_ACTIVE)
                    ->whereIn('roleID', Role::query()->where('roleName', Role::CUSTOMER)->select('roleID'))),
            ],
            'walk_in_owner_name' => [
                Rule::requiredIf($this->input('owner_type') === self::OWNER_WALK_IN),
                'nullable', 'string', 'max:100',
            ],
            'walk_in_owner_phone' => [
                Rule::requiredIf($this->input('owner_type') === self::OWNER_WALK_IN),
                'nullable', 'string', 'max:30', 'regex:/\A\+?[0-9][0-9\s\-()]{6,28}\z/',
            ],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'petName.required' => "The pet's name is required.",
            'notes.required' => 'Describe the emergency or symptoms so the veterinarian can prepare.',
            'owner_id.required' => 'Search for and select the pet owner, or choose "No account".',
            'owner_id.exists' => 'Select an active pet owner account.',
            'walk_in_owner_name.required' => "The owner's name is required.",
            'walk_in_owner_phone.required' => "The owner's contact number is required.",
            'walk_in_owner_phone.regex' => 'Enter a valid contact number (digits, spaces, + - and brackets only).',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'petName' => 'pet name',
            'walk_in_owner_name' => 'owner name',
            'walk_in_owner_phone' => 'contact number',
        ];
    }
}
