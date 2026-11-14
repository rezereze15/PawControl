<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'username', 'email', 'password', 'phone', 'address', 'role', 'status', 'profile_photo_path', 'google_id', 'avatar', 'needs_profile_completion'])]
#[Hidden(['password', 'remember_token', 'profile_photo_path', 'google_id'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

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
        ];
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
