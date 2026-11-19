<?php

namespace App\Http\Requests;

use App\Models\Service;
use Closure;
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
            'name' => ['bail', 'required', 'string', 'max:50', $this->uniqueNameIgnoringCase($ignoreId)],
            'description' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:99999999.99'],
        ];
    }

    /**
     * Like Rule::unique, but "icu" counts as a duplicate of "ICU". Postgres compares
     * text case-sensitively, so both sides are lower-cased before comparing.
     */
    private function uniqueNameIgnoringCase(?int $ignoreId): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($ignoreId): void {
            $taken = Service::query()
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($value)])
                ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
                ->exists();

            if ($taken) {
                $fail('A service with this name already exists.');
            }
        };
    }
}
