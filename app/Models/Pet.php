<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pet extends Model
{
    protected $table = 'pets';

    protected $primaryKey = 'petID';

    protected $guarded = [];

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'dateOfBirth' => 'date',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'petOwnerID');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'pet_id', 'petID');
    }
}
