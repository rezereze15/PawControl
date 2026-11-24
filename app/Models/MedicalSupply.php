<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * ERD: MEDICAL_SUPPLIES. Laravel finds the `medical_supplies` table from the class name.
 */
class MedicalSupply extends Model
{
    /** Categories the admin can pick from. Add a new one here; no database change needed. */
    public const CATEGORIES = ['Medication', 'Vaccine', 'IV & Fluids', 'Surgical', 'Diagnostic', 'Consumable'];

    /** Units the admin can pick from. Shown on the home screen, e.g. "3 pcs left". */
    public const UNITS = ['pcs', 'box', 'pack', 'bottle', 'vial', 'bag', 'tablet', 'ml'];

    protected $fillable = [
        'name',
        'description',
        'category',
        'unit_of_measure',
        'stock_quantity',
        'reorder_level',
        'unit_price',
        'is_active',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'stock_quantity' => 'integer',
            'reorder_level' => 'integer',
            'unit_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Supplies that need restocking: still in use, and at or below their reorder level.
     * Use it as MedicalSupply::query()->lowStock().
     */
    #[Scope]
    protected function lowStock(Builder $query): void
    {
        $query->where('is_active', true)
            // whereColumn compares two columns in the same row (each supply has its own level).
            ->whereColumn('stock_quantity', '<=', 'reorder_level');
    }

    /** Same rule as lowStock() above, but for one supply that is already loaded. */
    public function isLowStock(): bool
    {
        return $this->is_active && $this->stock_quantity <= $this->reorder_level;
    }

    /** The services that use this supply. Each one's amount is $service->pivot->quantity. */
    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'services_medical_supplies')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
