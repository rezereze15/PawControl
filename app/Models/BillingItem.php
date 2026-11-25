<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One line on a billing: a service given or a supply used, priced at completion time.
 *
 * @property int $id
 * @property int $billing_id
 * @property string $description
 * @property int $quantity
 * @property string $unit_price
 */
class BillingItem extends Model
{
    protected $fillable = ['billing_id', 'description', 'quantity', 'unit_price'];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }

    public function billing(): BelongsTo
    {
        return $this->belongsTo(Billing::class);
    }
}
