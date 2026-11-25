<?php

namespace App\Console\Commands;

use App\Mail\AppointmentReminderMail;
use App\Models\Appointment;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Emails pet owners about confirmed visits in the next 24 hours, once per appointment.
 * Scheduled hourly in routes/console.php; run by hand with `php artisan appointments:send-reminders`.
 */
class SendAppointmentReminders extends Command
{
    protected $signature = 'appointments:send-reminders';

    protected $description = 'Email pet owners a reminder for confirmed appointments in the next 24 hours';

    /** The clinic's local timezone. */
    private const CLINIC_TIMEZONE = 'Asia/Manila';

    public function handle(): int
    {
        // Appointment times are saved as the clinic's clock time (a 6:00 PM booking is stored
        // as 18:00), so compare them with the clinic's current clock time, not the server's UTC.
        $clinicNow = Carbon::parse(now(self::CLINIC_TIMEZONE)->format('Y-m-d H:i:s'), config('app.timezone'));

        $sent = $failed = 0;

        Appointment::query()
            ->with(['pet', 'user'])
            ->where('status', Appointment::STATUS_CONFIRMED)
            ->where('is_emergency', false)
            ->whereNotNull('user_id')
            ->whereNull('reminder_sent_at')
            ->whereBetween('app_date_time', [$clinicNow, $clinicNow->copy()->addDay()])
            ->each(function (Appointment $appointment) use (&$sent, &$failed): void {
                $email = $appointment->user?->email;

                if (! $email) {
                    return;
                }

                try {
                    Mail::to($email)->send(new AppointmentReminderMail($appointment));
                } catch (Throwable $exception) {
                    // Not marked as sent, so the next hourly run tries again.
                    $failed++;
                    Log::error('Failed to send appointment reminder email.', [
                        'appointment' => $appointment->id,
                        'exception' => $exception,
                    ]);

                    return;
                }

                // The "checkmark": this appointment never gets a second reminder.
                $appointment->forceFill(['reminder_sent_at' => now()])->saveQuietly();
                $sent++;
            });

        $this->info("Reminders sent: {$sent}. Failed: {$failed}.");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
