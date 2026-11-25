<?php

namespace App\Http\Controllers;

use App\Http\Requests\MarkBillingPaidRequest;
use App\Mail\BillingReceiptMail;
use App\Models\Billing;
use App\Models\BillingItem;
use App\Support\EmailMask;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Throwable;

/** The clerk settling a bill from the receipt popup. */
class BillingController extends Controller
{
    /**
     * "Mark as Paid": saves the receipt as shown (line edits, Others, discount, notes,
     * reference number) and settles the bill for its total. Paid bills are final, so a
     * double click or resubmit doesn't change or re-pay anything.
     */
    public function markPaid(MarkBillingPaidRequest $request, Billing $billing): RedirectResponse
    {
        $validated = $request->validated();
        $clerkId = (int) $request->user()->getAuthIdentifier();

        $billing = DB::transaction(function () use ($validated, $billing, $clerkId): Billing {
            $billing = Billing::query()->lockForUpdate()->findOrFail($billing->id);

            if ($billing->isPaid()) {
                throw ValidationException::withMessages(['billing' => 'This bill is already marked as paid.']);
            }

            $items = $billing->items()->get()->keyBy('id');
            foreach ($validated['items'] as $line) {
                // Only this bill's own lines; unknown ids are ignored.
                $items->get((int) $line['id'])?->update([
                    'description' => $line['description'],
                    'quantity' => (int) $line['qty'],
                    'unit_price' => $line['unitPrice'],
                ]);
            }

            $other = $validated['other'] ?? [];
            if ((int) ($other['qty'] ?? 0) > 0 && (float) ($other['unitPrice'] ?? 0) > 0) {
                $billing->items()->create([
                    'description' => trim((string) ($other['description'] ?? '')) ?: 'Others',
                    'quantity' => (int) $other['qty'],
                    'unit_price' => $other['unitPrice'],
                ]);
            }

            $subtotal = $billing->items()->get()->sum(fn (BillingItem $item) => $item->quantity * (float) $item->unit_price);
            $discount = min((float) ($validated['discount'] ?? 0), $subtotal);

            $billing->update([
                'discount' => $discount,
                'notes' => $validated['notes'] ?? null,
                'reference_number' => $validated['referenceNumber'] ?? null,
                'amount_paid' => round($subtotal - $discount, 2),
                'status' => Billing::STATUS_PAID,
                'paid_at' => now(),
                'paid_by' => $clerkId,
            ]);

            return $billing;
        });

        return back()->with('success', 'Bill '.$billing->receiptNumber().' marked as paid. '.$this->emailReceipt($billing));
    }

    /**
     * Emails the owner the paid receipt (PDF attached), after the payment is saved: a mail
     * problem never undoes the payment. Returns a sentence for the clerk's confirmation.
     */
    private function emailReceipt(Billing $billing): string
    {
        $billing = $billing->fresh(['medicalRecord.appointment.user']);
        $email = $billing->medicalRecord->appointment?->ownerEmail();

        if (! $email) {
            return 'No receipt was emailed: the owner has no email on file.';
        }

        try {
            Mail::to($email)->send(new BillingReceiptMail($billing));
        } catch (Throwable $exception) {
            Log::error('Failed to email billing receipt.', ['billing' => $billing->id, 'exception' => $exception]);

            return 'The receipt could not be emailed; please print it for the owner.';
        }

        return 'Receipt emailed to '.EmailMask::mask($email).'.';
    }
}
