<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $pet_id
 * @property int $user_id
 * @property Carbon $app_date_time
 * @property string $status
 * @property string|null $proof_of_down_payment_path
 * @property string|null $proof_of_down_payment_disk
 * @property string|null $rejection_reason
 * @property Carbon|null $reviewed_at
 */
class Appointment extends Model
{
    public const STATUS_PENDING = 'Pending';

    public const STATUS_CONFIRMED = 'Confirmed';

    public const STATUS_REJECTED = 'Rejected';

    public const STATUS_CANCELLED = 'Cancelled';

    /** Non-refundable down payment (PHP) required to book. */
    public const DOWN_PAYMENT = 200;

    protected $fillable = [
        'ar_first_name',
        'ar_last_name',
        'pet_id',
        'service_type',
        'notes',
        'app_date_time',
        'proof_of_down_payment_path',
        'proof_of_down_payment_disk',
        'reference_number',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'app_date_time' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class, 'pet_id', 'petID');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /** URL of the authorized proxy route that serves the proof of payment. */
    public function proofUrl(): ?string
    {
        return $this->proof_of_down_payment_path
            ? route('appointments.proof', $this)
            : null;
    }

    public function proofIsPdf(): bool
    {
        return str_ends_with(strtolower((string) $this->proof_of_down_payment_path), '.pdf');
    }
}
