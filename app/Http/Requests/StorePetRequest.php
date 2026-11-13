<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'species' => ['required', 'string', 'max:50'],
            'breed' => ['required', 'string', 'max:50'],
            'age' => ['nullable', 'integer', 'min:0'],
            'sex' => ['nullable', 'string', 'max:50'],
            'dateOfBirth' => ['nullable', 'date', 'before_or_equal:today'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'photo' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
