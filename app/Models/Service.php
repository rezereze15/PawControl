<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Service extends Model
{
    protected $fillable = ['name', 'description', 'price', 'is_active'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * ERD: SERVICES * ── * MEDICAL_SUPPLIES, through SERVICES_MEDICAL_SUPPLIES.
     * The supplies this service uses. Each one's amount is $supply->pivot->quantity.
     */
    public function supplies(): BelongsToMany
    {
        return $this->belongsToMany(MedicalSupply::class, 'services_medical_supplies')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
