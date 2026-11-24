<?php

namespace App\Models;

use App\Exceptions\MedicalRecordLockedException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
 * @property string|null $suggestions clinical suggestions / advice for the owner
 * @property string|null $lab_results
 * @property string|null $vet_notes
 * @property string $status Upcoming, Selected, Ongoing or Completed
 * @property int|null $veterinarian_id the vet who selected the record / started the diagnosis
 * @property Carbon|null $started_at
 * @property Carbon|null $completed_at
 * @property int|null $created_by the clerk who accepted the appointment
 */
class MedicalRecord extends Model
{
    /** Created when the clerk accepts the appointment; the vet hasn't started yet. */
    public const STATUS_UPCOMING = 'Upcoming';

    /** A vet viewed the record and confirmed "Select": it's theirs, diagnosis not started yet. */
    public const STATUS_SELECTED = 'Selected';

    /** The vet pressed "Start Diagnosis": the visit is in progress. */
    public const STATUS_ONGOING = 'Ongoing';

    public const STATUS_COMPLETED = 'Completed';

    public const STATUSES = [self::STATUS_UPCOMING, self::STATUS_SELECTED, self::STATUS_ONGOING, self::STATUS_COMPLETED];

    protected $fillable = [
        'pet_id',
        'appointment_id',
        'visit_date',
        'service_type',
        'chief_complaint',
        'diagnosis',
        'treatment',
        'suggestions',
        'lab_results',
        'vet_notes',
        'status',
        'veterinarian_id',
        'started_at',
        'completed_at',
        'created_by',
    ];

    protected $attributes = [
        'status' => self::STATUS_UPCOMING,
    ];

    /**
     * Completed records are final: any change to one is refused here too, as a last line of
     * defense behind the controller checks (MedicalRecordController::ensureNotLocked).
     */
    protected static function booted(): void
    {
        static::updating(function (self $record): void {
            if ($record->getOriginal('status') === self::STATUS_COMPLETED) {
                throw new MedicalRecordLockedException;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'visit_date' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
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
                'status' => self::STATUS_UPCOMING,
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

    public function veterinarian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'veterinarian_id');
    }

    /** Services given during the visit; the price charged is $service->pivot->price. */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'medical_record_services')
            ->withPivot('price')
            ->withTimestamps();
    }

    /** Supplies used during the visit; amounts are $supply->pivot->quantity. */
    public function supplies(): BelongsToMany
    {
        return $this->belongsToMany(MedicalSupply::class, 'medical_record_supplies')
            ->withPivot(['quantity', 'unit_price'])
            ->withTimestamps();
    }

    public function files(): HasMany
    {
        return $this->hasMany(MedicalRecordFile::class)->orderBy('created_at');
    }

    public function isUpcoming(): bool
    {
        return $this->status === self::STATUS_UPCOMING;
    }

    /** Completed records are locked: read-only for everyone. */
    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /** Readable record number, e.g. MR-000042. */
    public function number(): string
    {
        return 'MR-'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
    }
}
