<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property int $roleID
 * @property string $role roleName of the linked ROLES row (computed from roleID)
 * @property string $status
 * @property Carbon|null $last_login_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'username', 'email', 'password', 'phone', 'address', 'role', 'roleID', 'status', 'profile_photo_path', 'google_id', 'avatar', 'needs_profile_completion'])]
#[Hidden(['password', 'remember_token', 'profile_photo_path', 'google_id'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const STATUS_ACTIVE = 'Active';

    public const STATUS_INACTIVE = 'Inactive';

    /** Keep `role` in serialized output (e.g. Inertia's shared auth.user). */
    protected $appends = ['role'];

    protected static function booted(): void
    {
        // New accounts are pet owners unless a role is given.
        static::creating(function (User $user): void {
            $user->roleID ??= Role::idFor(Role::CUSTOMER);
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'needs_profile_completion' => 'boolean',
            'roleID' => 'integer',
            'last_login_at' => 'datetime',
        ];
    }

    /** ERD: USERS.roleID → ROLES.roleID. */
    public function assignedRole(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'roleID', 'roleID');
    }

    /**
     * The role's name ("customer", "clerk", ...). Reading it looks up the ROLES row;
     * assigning a name (e.g. ['role' => 'clerk']) stores the matching roleID.
     */
    protected function role(): Attribute
    {
        return Attribute::make(
            get: fn ($value, array $attributes) => Role::nameFor(isset($attributes['roleID']) ? (int) $attributes['roleID'] : null),
            set: fn (string $value) => ['roleID' => Role::idFor($value)],
        );
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /** Google sign-ups must fill in username / phone / address before using the app. */
    public function hasCompleteProfile(): bool
    {
        return ! $this->needs_profile_completion;
    }

    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class, 'petOwnerID');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'user_id');
    }

    /**
     * Cache-busted URL of the authorized route that serves this user's uploaded
     * profile photo, falling back to their Google picture if they signed in with Google.
     */
    public function profilePhotoUrl(): ?string
    {
        if ($this->profile_photo_path) {
            return route('settings.photo.show', ['v' => substr(md5($this->profile_photo_path), 0, 8)]);
        }

        return $this->avatar;
    }
}
