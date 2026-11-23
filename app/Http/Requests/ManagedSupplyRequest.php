<?php

namespace App\Http\Requests;

use App\Models\MedicalSupply;
use App\Rules\UniqueNameIgnoringCase;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Add (POST) or edit (PUT) a medical supply from the admin's Manage Medical Supplies page.
 */
class ManagedSupplyRequest extends FormRequest
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
        $supply = $this->route('supply');
        $ignoreId = $supply instanceof MedicalSupply ? $supply->id : null;

        return [
            // "bail" stops at the first failed rule, so the duplicate check only sees a valid name.
            'name' => ['bail', 'required', 'string', 'max:100',
                new UniqueNameIgnoringCase(MedicalSupply::class, $ignoreId, 'A supply with this name already exists.')],
            'description' => ['nullable', 'string', 'max:255'],
            // Only the choices listed in the model, so a made-up category can't be sent.
            'category' => ['required', Rule::in(MedicalSupply::CATEGORIES)],
            'unit_of_measure' => ['required', Rule::in(MedicalSupply::UNITS)],
            // Whole numbers only; the max is a sanity limit to catch typos like 1000000000.
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:1000000'],
            'reorder_level' => ['required', 'integer', 'min:0', 'max:1000000'],
            'unit_price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'category.in' => 'Please choose a category from the list.',
            'unit_of_measure.in' => 'Please choose a unit from the list.',
        ];
    }
}
