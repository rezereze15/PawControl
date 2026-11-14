<?php

namespace App\Mail;

use App\Models\PasswordResetCode;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** "Forgot password" 6-digit code. Sent synchronously with Mail::to()->send(). */
class PasswordResetCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $code,
        public string $name,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your PawControl password reset code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.code',
            text: 'mail.code-text',
            with: [
                'heading' => 'Your password reset code',
                'intro' => 'Enter the code below to choose a new password for your account.',
                'footer' => "If you didn't request this, you can ignore this email. Your password won't change.",
                'expiresInMinutes' => PasswordResetCode::CODE_TTL_MINUTES,
            ],
        );
    }
}
