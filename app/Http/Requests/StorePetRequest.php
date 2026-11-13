<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'customer';
    }

    public function rules(): array
    {
        return [
            'petName' => ['required', 'string', 'max:50'],
            'species' => ['required', Rule::in(['Dog', 'Cat'])],
            'breed' => ['required', 'string', 'max:50'],
            'age' => ['nullable', 'integer', 'min:0'],
            'sex' => ['nullable', Rule::in(['Male', 'Female'])],
            'dateOfBirth' => ['nullable', 'date', 'before_or_equal:today'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
