<?php

namespace App\Http\Requests;

use App\Models\Service;
use App\Rules\UniqueNameIgnoringCase;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Add (POST) or edit (PUT) a service from the admin's Manage Services page.
 */
class ManagedServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        // Remove stray spaces; an empty description is saved as "no description" (null).
        $this->merge([
            'name' => trim((string) $this->input('name')),
            'description' => trim((string) $this->input('description')) ?: null,
        ]);
    }

    public function rules(): array
    {
        $service = $this->route('service');
        $ignoreId = $service instanceof Service ? $service->id : null;

        return [
            // "bail" stops at the first failed rule, so the duplicate check only sees a valid name.
            'name' => ['bail', 'required', 'string', 'max:50',
                new UniqueNameIgnoringCase(Service::class, $ignoreId, 'A service with this name already exists.')],
            'description' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
            // The supplies this service uses. The form always sends the full list (it may be empty).
            'supplies' => ['present', 'array', 'max:50'],
            'supplies.*.id' => ['required', 'integer', 'distinct', 'exists:medical_supplies,id'],
            // Whole amounts in the supply's own unit. 10,000 is a sanity limit (big enough for ml).
            'supplies.*.quantity' => ['required', 'integer', 'min:1', 'max:10000'],
        ];
    }

    /** Friendlier names in error messages, e.g. "The amount field must be at least 1." */
    public function attributes(): array
    {
        return [
            'supplies.*.id' => 'supply',
            'supplies.*.quantity' => 'amount',
        ];
    }

    /**
     * The picked supplies in the shape sync() expects: [supply id => ['quantity' => amount]].
     *
     * @return array<int, array{quantity: int}>
     */
    public function suppliesForSync(): array
    {
        return collect($this->validated('supplies'))
            ->mapWithKeys(fn (array $row) => [(int) $row['id'] => ['quantity' => (int) $row['quantity']]])
            ->all();
    }
}
