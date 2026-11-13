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
            'service_type' => ['required', 'string', Rule::in([
                'Emergency Response',
                'Advanced Diagnosis',
                'Critical Care',
                'ICU',
                'Blood Transfusion',
                'Surgery & Intensive Monitoring',
            ])],
            'notes' => ['nullable', 'string', 'max:500'],
            'app_date_time' => [
                'required',
                'date',
                'after:now',
                function (string $attribute, mixed $value, \Closure $fail) {
                    try {
                        $time = \Illuminate\Support\Carbon::parse($value);
                    } catch (\Throwable) {
                        return;
                    }

                    if ($time->minute !== 0 || $time->second !== 0 || $time->hour < 9 || $time->hour > 17) {
                        $fail('Please choose an hourly appointment time between 9 AM and 5 PM.');
                    }
                },
            ],
            'terms_accepted' => ['accepted'],
            'reference_number' => ['required', 'string', 'regex:/\A[0-9]+\z/', 'max:255', 'unique:appointments,reference_number'],
            'proof_of_down_payment' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
