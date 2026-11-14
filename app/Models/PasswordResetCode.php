<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Support\Carbon;

/**
 * A 6-digit "forgot password" code. One row per email; replaced on every (re)send.
 *
 * @property int $id
 * @property string $email
 * @property string|null $code_hash
 * @property Carbon $expires_at
 * @property int $attempts
 * @property Carbon $last_sent_at
 */
#[Fillable(['email', 'code_hash', 'expires_at', 'attempts', 'last_sent_at'])]
#[Hidden(['code_hash'])]
class PasswordResetCode extends Model
{
    use Prunable;

    public const CODE_TTL_MINUTES = 10;

    public const MAX_ATTEMPTS = 5;

    public const RESEND_COOLDOWN_SECONDS = 60;

    /** Session key holding ['email' => ..., 'sent_at' => unix time] while a code is pending. */
    public const SESSION_KEY = 'password_reset';

    /** Session key holding ['email' => ..., 'expires_at' => unix time] after a correct code. */
    public const VERIFIED_SESSION_KEY = 'password_reset_verified';

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'last_sent_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    /** Codes that expired over an hour ago (pruned on each request and by the daily model:prune). */
    public function prunable(): Builder
    {
        return static::where('expires_at', '<', now()->subHour());
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
