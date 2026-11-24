<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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

    /**
     * Species in one spelling ("cat" / "CAT" → "Cat"), so older rows saved in another
     * case don't show up as a separate option in the species filters.
     */
    protected function species(): Attribute
    {
        $normalize = fn (?string $value) => $value === null || trim($value) === ''
            ? $value
            : ucfirst(mb_strtolower(trim($value)));

        return Attribute::make(get: $normalize, set: $normalize);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'petOwnerID');
    }

    /** Owner's name: the linked account, or the walk-in owner the clerk entered. */
    public function ownerName(): string
    {
        return $this->owner?->name ?? $this->walk_in_owner_name ?? 'Unknown owner';
    }

    public function ownerPhone(): ?string
    {
        return $this->owner?->phone ?? $this->walk_in_owner_phone;
    }

    /** Registered by a clerk during an emergency walk-in and not linked to an account yet. */
    public function isUnlinkedWalkIn(): bool
    {
        return $this->petOwnerID === null;
    }

    /** Cache-busted URL of the authorized route that serves this pet's photo. */
    public function photoUrl(): ?string
    {
        return $this->photo_path
            ? route('pets.photo.show', ['pet' => $this->petID, 'v' => substr(md5($this->photo_path), 0, 8)])
            : null;
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class, 'pet_id', 'petID');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'pet_id', 'petID');
    }
}
