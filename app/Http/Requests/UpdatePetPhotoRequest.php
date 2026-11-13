<?php

namespace App\Http\Requests;

use App\Models\Pet;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePetPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        $pet = $this->route('pet');

        return $this->user()?->role === 'customer'
            && $pet instanceof Pet
            && (int) $pet->petOwnerID === (int) $this->user()->getAuthIdentifier();
    }

    public function rules(): array
    {
        return [
            'photo' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
