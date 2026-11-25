<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The receipt as the clerk is about to settle it: line edits, the "Others" line,
 * discount, notes and the receipt reference number. Totals are computed server-side.
 */
class MarkBillingPaidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role:clerk on the route
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'items' => ['present', 'array', 'max:100'],
            'items.*.id' => ['required', 'integer'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.qty' => ['required', 'integer', 'min:0', 'max:100000'],
            'items.*.unitPrice' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'other' => ['nullable', 'array'],
            'other.description' => ['nullable', 'string', 'max:255'],
            'other.qty' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'other.unitPrice' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'discount' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'referenceNumber' => ['nullable', 'string', 'max:100'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'items.*.description.required' => 'Every line needs a description.',
            'items.*.qty.min' => 'Quantities cannot be negative.',
            'items.*.unitPrice.min' => 'Prices cannot be negative.',
            'discount.min' => 'The discount cannot be negative.',
        ];
    }
}
