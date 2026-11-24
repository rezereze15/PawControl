<?php

namespace App\Http\Requests;

use App\Models\MedicalRecord;
use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Veterinarian: save the diagnosis form of a medical record (findings, services given,
 * supplies used, status). Stock is checked in MedicalRecordController::update, under a lock.
 */
class UpdateMedicalRecordRequest extends FormRequest
{
    public const TEXT_FIELDS = ['diagnosis', 'treatment', 'suggestions', 'lab_results', 'vet_notes'];

    public function authorize(): bool
    {
        return $this->user()?->role === Role::VETERINARIAN;
    }

    protected function prepareForValidation(): void
    {
        $trimmed = [];
        foreach (self::TEXT_FIELDS as $field) {
            $trimmed[$field] = trim((string) $this->input($field)) ?: null;
        }

        $this->merge([
            ...$trimmed,
            'services' => array_values((array) $this->input('services', [])),
            'supplies' => array_values((array) $this->input('supplies', [])),
        ]);
    }

    public function rules(): array
    {
        /** @var MedicalRecord $record */
        $record = $this->route('medicalRecord');
        $currentServiceIds = $record->services()->pluck('services.id')->all();
        $currentSupplyIds = $record->supplies()->pluck('medical_supplies.id')->all();

        return [
            // A record can't be completed without a diagnosis.
            'diagnosis' => ['nullable', 'required_if:status,'.MedicalRecord::STATUS_COMPLETED, 'string', 'max:5000'],
            'treatment' => ['nullable', 'string', 'max:5000'],
            'suggestions' => ['nullable', 'string', 'max:5000'],
            'lab_results' => ['nullable', 'string', 'max:5000'],
            'vet_notes' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::in([MedicalRecord::STATUS_ONGOING, MedicalRecord::STATUS_COMPLETED])],

            'services' => ['array', 'max:30'],
            // Active services, or ones already on this record (kept if the admin deactivated them since).
            'services.*' => ['integer', 'distinct', Rule::exists('services', 'id')->where(fn ($query) => $query
                ->where('is_active', true)
                ->orWhereIn('id', $currentServiceIds ?: [0]))],

            'supplies' => ['array', 'max:50'],
            'supplies.*.id' => ['required', 'integer', 'distinct', Rule::exists('medical_supplies', 'id')->where(fn ($query) => $query
                ->where('is_active', true)
                ->orWhereIn('id', $currentSupplyIds ?: [0]))],
            'supplies.*.quantity' => ['required', 'integer', 'min:1', 'max:10000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'diagnosis.required_if' => 'Enter a diagnosis before marking the record as completed.',
            'services.*.exists' => 'One of the selected services is no longer available.',
            'services.*.distinct' => 'A service was selected twice.',
            'supplies.*.id.exists' => 'One of the selected supplies is no longer available.',
            'supplies.*.id.distinct' => 'A supply was added twice. Change its quantity instead.',
            'supplies.*.quantity.min' => 'Quantities must be at least 1.',
            'supplies.*.quantity.integer' => 'Quantities must be whole numbers.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'lab_results' => 'lab results',
            'vet_notes' => 'vet notes',
            'suggestions' => 'clinical suggestions',
        ];
    }
}
