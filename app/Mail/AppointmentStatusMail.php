<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Tells the pet owner their appointment was confirmed or rejected. Sent synchronously. */
class AppointmentStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment) {}

    private function isConfirmed(): bool
    {
        return $this->appointment->status === Appointment::STATUS_CONFIRMED;
    }

    public function envelope(): Envelope
    {
        $pet = $this->appointment->pet?->petName ?? 'your pet';

        return new Envelope(
            subject: $this->isConfirmed()
                ? "Your appointment for {$pet} is confirmed"
                : "Your appointment for {$pet} was not approved",
        );
    }

    public function content(): Content
    {
        $a = $this->appointment;

        return new Content(
            view: 'mail.appointment-status',
            text: 'mail.appointment-status-text',
            with: [
                'confirmed' => $this->isConfirmed(),
                'name' => $a->user?->name,
                'details' => [
                    'Pet' => $a->pet?->petName ?? 'Unknown pet',
                    'Service' => $a->service_type ?? 'Appointment',
                    'Date' => $a->app_date_time->format('M j, Y'),
                    'Time' => $a->app_date_time->format('g:i A'),
                    'Reference no.' => $a->reference_number,
                ],
                'reason' => $a->rejection_reason,
            ],
        );
    }
}
