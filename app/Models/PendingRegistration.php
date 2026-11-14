<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Support\Carbon;

/**
 * A registration awaiting email verification. The real User is only created
 * once the emailed code is confirmed.
 *
 * @property int $id
 * @property string $name
 * @property string $username
 * @property string $email
 * @property string $phone
 * @property string $address
 * @property string $password
 * @property string|null $code_hash
 * @property Carbon $code_expires_at
 * @property int $attempts
 * @property Carbon $last_sent_at
 */
#[Fillable(['name', 'username', 'email', 'phone', 'address', 'password', 'code_hash', 'code_expires_at', 'attempts', 'last_sent_at'])]
#[Hidden(['password', 'code_hash'])]
class PendingRegistration extends Model
{
    use Prunable;

    public const CODE_TTL_MINUTES = 10;

    public const MAX_ATTEMPTS = 5;

    public const RESEND_COOLDOWN_SECONDS = 60;

    public const SESSION_KEY = 'pending_registration_id';

    protected function casts(): array
    {
        return [
            'code_expires_at' => 'datetime',
            'last_sent_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    /** Registrations whose code expired over an hour ago and were never resent. */
    public function prunable(): Builder
    {
        return static::where('code_expires_at', '<', now()->subHour());
    }

    public static function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    public function isExpired(): bool
    {
        return $this->code_expires_at->isPast();
    }

    public function resendAvailableIn(): int
    {
        $elapsed = (int) $this->last_sent_at->diffInSeconds(now(), true);

        return max(0, self::RESEND_COOLDOWN_SECONDS - $elapsed);
    }

    /** j***@gmail.com */
    public function maskedEmail(): string
    {
        [$local, $domain] = explode('@', $this->email, 2) + [1 => ''];

        return mb_substr($local, 0, 1).'***@'.$domain;
    }
}
