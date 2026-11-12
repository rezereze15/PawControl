<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'customer';
    }

    public function rules(): array
    {
        return [
            'ar_first_name' => ['required', 'string', 'max:50'],
            'ar_last_name' => ['required', 'string', 'max:50'],
            'pet_id' => [
                'required',
                'integer',
                Rule::exists('pets', 'petID')->where('petOwnerID', $this->user()?->getAuthIdentifier()),
            ],
            'notes' => ['nullable', 'string', 'max:50'],
            'app_date_time' => ['required', 'date', 'after:now'],
            'proof_of_down_payment' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
