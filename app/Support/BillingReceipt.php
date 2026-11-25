<?php

namespace App\Support;

use App\Models\Billing;
use App\Models\BillingItem;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * A billing's receipt, as the clerk prints it from the Billings screen: the data shared by
 * the PDF and the email, and the PDF itself (rendered server-side with DomPDF).
 */
final class BillingReceipt
{
    /** Clinic details printed on the receipt (same as CLINIC_INFO in the dashboard JS). */
    public const CLINIC = [
        'name' => "Bigpaw's Animal Clinic",
        'address' => '17 Dahla Ave, Fairview, Quezon City 1101',
        'contact' => '0917-123-4567',
    ];

    /** @return array<string, mixed> */
    public static function data(Billing $billing): array
    {
        $billing->loadMissing(['items', 'veterinarian:id,name', 'payer:id,name', 'medicalRecord.pet', 'medicalRecord.appointment.user', 'medicalRecord.appointment.pet']);
        $record = $billing->medicalRecord;
        $appointment = $record->appointment;

        $items = $billing->items->map(fn (BillingItem $item) => [
            'description' => $item->description,
            'qty' => $item->quantity,
            'unitPrice' => (float) $item->unit_price,
            'amount' => $item->quantity * (float) $item->unit_price,
        ])->values()->all();

        $subtotal = array_sum(array_column($items, 'amount'));
        $discount = (float) $billing->discount;

        return [
            'clinic' => self::CLINIC,
            'receiptNo' => $billing->receiptNumber(),
            'dateIssued' => $billing->issued_at->format('F j, Y'),
            'owner' => $appointment?->ownerName() ?? 'Unknown owner',
            'email' => $appointment?->ownerEmail(),
            'phone' => $appointment?->ownerPhone(),
            'pet' => $record->pet?->petName ?? 'Unknown pet',
            'species' => trim(($record->pet?->species ?? '').($record->pet?->breed ? " ({$record->pet->breed})" : '')),
            'patientId' => 'ID-'.str_pad((string) $record->pet_id, 4, '0', STR_PAD_LEFT),
            'service' => $record->service_type ?? 'Appointment',
            'visitDate' => $record->visit_date->format('F j, Y'),
            'items' => $items,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => $billing->amount_paid !== null ? (float) $billing->amount_paid : max(0, $subtotal - $discount),
            'notes' => $billing->notes,
            'veterinarian' => self::doctor($billing->veterinarian?->name),
            'paid' => $billing->isPaid(),
            'paidAt' => $billing->paid_at?->format('F j, Y'),
            'referenceNumber' => $billing->reference_number,
            'paidBy' => $billing->payer?->name,
        ];
    }

    /** The receipt as a PDF file's contents. */
    public static function pdf(Billing $billing): string
    {
        return Pdf::loadView('pdf.billing-receipt', [
            ...self::data($billing),
            'logo' => self::logoDataUri(),
        ])
            ->setPaper('a4')
            // Embed only the characters used: keeps the email attachment small.
            ->setOption('isFontSubsettingEnabled', true)
            ->output();
    }

    public static function fileName(Billing $billing): string
    {
        return $billing->receiptNumber().'.pdf';
    }

    public static function peso(float $amount): string
    {
        return '₱'.number_format($amount, 2);
    }

    /** "Dr. Name", like the receipt on screen; names already titled are kept. */
    public static function doctor(?string $name): string
    {
        $name = trim((string) $name);

        if ($name === '') {
            return '—';
        }

        return preg_match('/^(dr|doc)\.?\s/i', $name) ? $name : "Dr. {$name}";
    }

    /** JPEG on white: DomPDF needs the GD extension for transparent PNGs, JPEGs work without it. */
    private static function logoDataUri(): ?string
    {
        $path = resource_path('images/receipt-logo.jpg');

        return is_file($path) ? 'data:image/jpeg;base64,'.base64_encode((string) file_get_contents($path)) : null;
    }
}
