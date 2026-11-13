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

    /** Cache-busted URL of the authorized route that serves this pet's photo. */
    public function photoUrl(): ?string
    {
        return $this->photo_path
            ? route('pets.photo.show', ['pet' => $this->petID, 'v' => substr(md5($this->photo_path), 0, 8)])
            : null;
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'pet_id', 'petID');
    }
}
