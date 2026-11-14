<?php

namespace App\Mail;

use App\Models\PendingRegistration;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent synchronously (Mail::to()->send()); the from address comes from
 * MAIL_FROM_ADDRESS / MAIL_FROM_NAME via config/mail.php.
 */
class RegistrationVerificationCode extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $name,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your PawControl verification code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.code',
            text: 'mail.code-text',
            with: [
                'heading' => 'Your verification code',
                'intro' => 'Use the code below to verify your email address and finish creating your account.',
                'footer' => "If you didn't try to create an account, you can safely ignore this email.",
                'expiresInMinutes' => PendingRegistration::CODE_TTL_MINUTES,
            ],
        );
    }
}
