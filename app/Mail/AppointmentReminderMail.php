<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Automatic "your visit is coming up" email, sent by the appointments:send-reminders command. */
class AppointmentReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Appointment $appointment) {}

    public function envelope(): Envelope
    {
        $a = $this->appointment;
        $pet = $a->pet?->petName ?? 'your pet';

        return new Envelope(
            subject: "Reminder: {$pet}'s appointment on {$a->app_date_time->format('M j, Y')}",
        );
    }

    public function content(): Content
    {
        $a = $this->appointment;

        return new Content(
            view: 'mail.appointment-reminder',
            text: 'mail.appointment-reminder-text',
            with: [
                'name' => $a->user?->name,
                'details' => [
                    'Pet' => $a->pet?->petName ?? 'Unknown pet',
                    'Service' => $a->service_type ?? 'Appointment',
                    'Date' => $a->app_date_time->format('M j, Y'),
                    'Time' => $a->app_date_time->format('g:i A'),
                    'Reference no.' => $a->reference_number,
                ],
            ],
        );
    }
}
