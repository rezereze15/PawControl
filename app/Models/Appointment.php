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
 */
class Appointment extends Model
{
    protected $fillable = [
        'ar_first_name',
        'ar_last_name',
        'pet_id',
        'notes',
        'app_date_time',
        'proof_of_down_payment_path',
        'reference_number',
        'status',
        'rejection_reason',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'app_date_time' => 'datetime',
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
}
