<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A pet's medical record for one accepted appointment.
 *
 * @property int $id
 * @property int $pet_id
 * @property int $appointment_id
 * @property Carbon $visit_date
 * @property string|null $service_type
 * @property string|null $chief_complaint the owner's concern, or the emergency symptoms
 * @property string|null $diagnosis
 * @property string|null $treatment
 * @property string|null $vet_notes
 * @property int|null $created_by the clerk who accepted the appointment
 */
class MedicalRecord extends Model
{
    protected $fillable = [
        'pet_id',
        'appointment_id',
        'visit_date',
        'service_type',
        'chief_complaint',
        'diagnosis',
        'treatment',
        'vet_notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'datetime',
        ];
    }

    /**
     * The record for an accepted appointment, created on first call. Safe to call twice
     * (e.g. a retried request): one appointment never gets two records.
     */
    public static function forAcceptedAppointment(Appointment $appointment, ?int $createdBy): self
    {
        return self::query()->firstOrCreate(
            ['appointment_id' => $appointment->id],
            [
                'pet_id' => $appointment->pet_id,
                'visit_date' => $appointment->app_date_time,
                'service_type' => $appointment->service_type,
                'chief_complaint' => $appointment->notes,
                'created_by' => $createdBy,
            ],
        );
    }

    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class, 'pet_id', 'petID');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Readable record number, e.g. MR-000042. */
    public function number(): string
    {
        return 'MR-'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
    }
}
