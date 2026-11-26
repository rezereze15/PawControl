<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\Billing;
use App\Models\MedicalRecord;
use App\Models\Role;
use App\Models\User;
use Carbon\CarbonInterface;

/**
 * "Who did what" for the admin's Staff Activity page (accountability).
 *
 * Read-only: everything here is already recorded when staff work, e.g.
 *  - billings.paid_by            the clerk who processed the payment
 *  - medical_records.veterinarian_id  the vet who handled the pet
 *  - appointments.reviewed_by    the clerk who accepted / rejected a booking
 *
 * Each row has `day` (Y-m-d, clinic date) for the date filter and `when` for display.
 */
class StaffActivity
{
    /** Newest rows per list; plenty for a clinic, and keeps the page light. */
    private const LIMIT = 500;

    private const CLINIC_TIMEZONE = 'Asia/Manila';

    /** @return array<string, mixed> */
    public static function forAdmin(): array
    {
        return [
            'staff' => self::staff(),
            'payments' => self::payments(),
            'petHandling' => self::petHandling(),
            'reviews' => self::reviews(),
        ];
    }

    /** Clerks and veterinarians (inactive ones too, so older activity still has a name). */
    private static function staff(): array
    {
        return User::query()
            ->whereIn('roleID', [Role::idFor(Role::CLERK), Role::idFor(Role::VETERINARIAN)])
            ->orderBy('name')
            ->get(['id', 'name', 'roleID', 'status'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'active' => $user->isActive(),
            ])
            ->values()
            ->all();
    }

    /** Requirement: "which clerk processed each payment". */
    private static function payments(): array
    {
        return Billing::query()
            ->with(['payer:id,name', 'medicalRecord.pet.owner:id,name'])
            ->whereNotNull('paid_by')
            ->whereNotNull('paid_at')
            ->latest('paid_at')
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (Billing $billing) => [
                'id' => $billing->id,
                'receipt' => $billing->receiptNumber(),
                'reference' => $billing->reference_number,
                'pet' => $billing->medicalRecord?->pet?->petName ?? 'Unknown pet',
                'owner' => $billing->medicalRecord?->pet?->ownerName() ?? 'Unknown owner',
                'amount' => (float) $billing->amount_paid,
                // paid_at is the real moment of payment: show it on the clinic's clock.
                ...self::moment($billing->paid_at->copy()->timezone(self::CLINIC_TIMEZONE)),
                'staffId' => $billing->paid_by,
                'staffName' => $billing->payer?->name ?? 'Deleted account',
            ])
            ->values()
            ->all();
    }

    /** Requirement: "which veterinarian handled each pet". */
    private static function petHandling(): array
    {
        return MedicalRecord::query()
            ->with(['veterinarian:id,name', 'pet.owner:id,name'])
            ->whereNotNull('veterinarian_id')
            ->latest('visit_date')
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (MedicalRecord $record) => [
                'id' => $record->id,
                'record' => $record->number(),
                'pet' => $record->pet?->petName ?? 'Unknown pet',
                'owner' => $record->pet?->ownerName() ?? 'Unknown owner',
                'service' => $record->service_type ?? 'Appointment',
                'status' => $record->status,
                // visit_date is saved as the clinic's clock time already (like bookings).
                ...self::moment($record->visit_date),
                'staffId' => $record->veterinarian_id,
                'staffName' => $record->veterinarian?->name ?? 'Deleted account',
            ])
            ->values()
            ->all();
    }

    /** Extra accountability: which clerk accepted or rejected each booking. */
    private static function reviews(): array
    {
        return Appointment::query()
            ->with(['reviewer:id,name', 'user:id,name', 'pet'])
            ->whereNotNull('reviewed_by')
            ->whereNotNull('reviewed_at')
            ->latest('reviewed_at')
            ->limit(self::LIMIT)
            ->get()
            ->map(fn (Appointment $appointment) => [
                'id' => $appointment->id,
                'reference' => $appointment->reference_number,
                'pet' => $appointment->pet?->petName ?? 'Unknown pet',
                'owner' => $appointment->ownerName(),
                'decision' => match (true) {
                    $appointment->is_emergency => 'Emergency walk-in',
                    $appointment->status === Appointment::STATUS_CONFIRMED => 'Accepted',
                    default => $appointment->status,
                },
                'reason' => $appointment->rejection_reason,
                // reviewed_at is the real moment of the decision: show it on the clinic's clock.
                ...self::moment($appointment->reviewed_at->copy()->timezone(self::CLINIC_TIMEZONE)),
                'staffId' => $appointment->reviewed_by,
                'staffName' => $appointment->reviewer?->name ?? 'Deleted account',
            ])
            ->values()
            ->all();
    }

    /** @return array{day: string, when: string} */
    private static function moment(CarbonInterface $time): array
    {
        return [
            'day' => $time->format('Y-m-d'),
            'when' => $time->format('M j, Y, g:i A'),
        ];
    }
}
