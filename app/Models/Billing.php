<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * The bill for one completed medical record, settled by the clerk at the clinic.
 *
 * @property int $id
 * @property int $medical_record_id
 * @property int|null $veterinarian_id the attending vet who completed the diagnosis
 * @property string $status Unpaid, Partially Paid or Paid
 * @property string $discount
 * @property string|null $notes
 * @property Carbon $issued_at
 * @property string|null $reference_number receipt reference entered by the clerk
 * @property string|null $amount_paid
 * @property Carbon|null $paid_at
 * @property int|null $paid_by the clerk who marked it paid
 */
class Billing extends Model
{
    public const STATUS_UNPAID = 'Unpaid';

    public const STATUS_PARTIALLY_PAID = 'Partially Paid';

    public const STATUS_PAID = 'Paid';

    protected $fillable = [
        'medical_record_id', 'veterinarian_id', 'status', 'discount', 'notes', 'issued_at',
        'reference_number', 'amount_paid', 'paid_at', 'paid_by',
    ];

    protected $attributes = [
        'status' => self::STATUS_UNPAID,
        'discount' => 0,
    ];

    protected function casts(): array
    {
        return [
            'discount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'issued_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function isPaid(): bool
    {
        return $this->status === self::STATUS_PAID;
    }

    /** The clerk who marked the bill as paid. */
    public function payer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }

    /**
     * The bill for a record the vet just completed, created on first call with the prices
     * already saved on the record. Safe to call twice: a record never gets two bills
     * (also enforced by the unique index on medical_record_id).
     *
     * Lines: each service given at the price saved on the record; if the vet added none,
     * the booked service at its price in the Services module. Then each supply used.
     */
    public static function forCompletedRecord(MedicalRecord $record, int $veterinarianId): self
    {
        $billing = self::query()->firstOrCreate(
            ['medical_record_id' => $record->id],
            ['veterinarian_id' => $veterinarianId, 'issued_at' => $record->completed_at ?? now()],
        );

        if (! $billing->wasRecentlyCreated) {
            return $billing;
        }

        $items = $record->services()->orderBy('name')->get()
            ->map(fn (Service $service) => [
                'description' => $service->name,
                'quantity' => 1,
                'unit_price' => $service->pivot->price,
            ]);

        if ($items->isEmpty() && $record->service_type) {
            $booked = Service::query()
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($record->service_type)])
                ->first(['name', 'price']);

            if ($booked) {
                $items->push(['description' => $booked->name, 'quantity' => 1, 'unit_price' => $booked->price]);
            }
        }

        $supplies = $record->supplies()->orderBy('name')->get()
            ->map(fn (MedicalSupply $supply) => [
                'description' => $supply->name,
                'quantity' => $supply->pivot->quantity,
                'unit_price' => $supply->pivot->unit_price,
            ]);

        $billing->items()->createMany($items->concat($supplies)->all());

        return $billing;
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function veterinarian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'veterinarian_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(BillingItem::class)->orderBy('id');
    }

    /** Readable receipt number, e.g. BILL-2026-000042. */
    public function receiptNumber(): string
    {
        return 'BILL-'.$this->issued_at->format('Y').'-'.str_pad((string) $this->id, 6, '0', STR_PAD_LEFT);
    }
}
