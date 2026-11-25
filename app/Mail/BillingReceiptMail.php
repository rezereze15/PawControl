<?php

namespace App\Mail;

use App\Models\Billing;
use App\Support\BillingReceipt;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Sends the pet owner their paid receipt, with the PDF attached. Sent synchronously. */
class BillingReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Billing $billing) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your receipt '.$this->billing->receiptNumber().' from '.BillingReceipt::CLINIC['name'],
        );
    }

    public function content(): Content
    {
        $receipt = BillingReceipt::data($this->billing);

        return new Content(
            view: 'mail.billing-receipt',
            text: 'mail.billing-receipt-text',
            with: [
                'name' => $this->billing->medicalRecord->appointment?->ownerName(),
                'clinic' => $receipt['clinic'],
                'pet' => $receipt['pet'],
                'fileName' => BillingReceipt::fileName($this->billing),
                'total' => BillingReceipt::peso($receipt['total']),
                'details' => array_filter([
                    'Receipt no.' => $receipt['receiptNo'],
                    'Pet' => $receipt['pet'],
                    'Visit' => $receipt['service'].', '.$receipt['visitDate'],
                    'Attending veterinarian' => $receipt['veterinarian'],
                    'Paid on' => $receipt['paidAt'],
                    'Reference no.' => $receipt['referenceNumber'],
                ]),
            ],
        );
    }

    /** @return array<int, Attachment> */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => BillingReceipt::pdf($this->billing), BillingReceipt::fileName($this->billing))
                ->withMime('application/pdf'),
        ];
    }
}
