<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use InvalidArgumentException;

/**
 * ERD: ROLES (roleID PK, roleName). One role has many users.
 *
 * @property int $roleID
 * @property string $roleName
 */
class Role extends Model
{
    public const ADMIN = 'admin';

    public const OWNER = 'owner';

    public const VETERINARIAN = 'veterinarian';

    public const CLERK = 'clerk';

    public const CUSTOMER = 'customer';

    /** Display name for each role. */
    public const LABELS = [
        self::ADMIN => 'Admin',
        self::OWNER => 'Clinic Owner',
        self::VETERINARIAN => 'Veterinarian',
        self::CLERK => 'Clerk',
        self::CUSTOMER => 'Pet Owner',
    ];

    /**
     * What each role can access, shown to the admin when assigning a role.
     * These describe the checks enforced in the controllers and form requests.
     */
    public const PERMISSIONS = [
        self::ADMIN => [
            'Create, edit, activate and deactivate user accounts',
            'Assign roles to users',
            'View payment proofs',
        ],
        self::OWNER => [
            'View pet medical records',
            'View sales reports',
            'View payment proofs',
        ],
        self::VETERINARIAN => [
            'View confirmed appointments',
            'View pet medical records and visit history',
        ],
        self::CLERK => [
            'Review appointment requests',
            'Accept or reject appointments',
            'View payment reference numbers and proofs',
        ],
        self::CUSTOMER => [
            'Register pets',
            'Book appointments and upload payment proof',
            'View their own appointments',
        ],
    ];

    protected $table = 'roles';

    protected $primaryKey = 'roleID';

    public $timestamps = false;

    protected $fillable = ['roleName'];

    /** @var array<int, string>|null roleID => roleName, loaded once per request */
    private static ?array $names = null;

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'roleID', 'roleID');
    }

    public function label(): string
    {
        return self::LABELS[$this->roleName] ?? ucfirst($this->roleName);
    }

    public static function nameFor(?int $roleId): ?string
    {
        if ($roleId === null) {
            return null;
        }

        return self::names()[$roleId] ?? self::reload()[$roleId] ?? null;
    }

    public static function idFor(string $roleName): int
    {
        $id = array_search($roleName, self::names(), true)
            ?: array_search($roleName, self::reload(), true);

        if ($id === false) {
            throw new InvalidArgumentException("Unknown role [{$roleName}].");
        }

        return (int) $id;
    }

    /** @return array<int, string> */
    private static function names(): array
    {
        return self::$names ??= self::reload();
    }

    /** @return array<int, string> */
    private static function reload(): array
    {
        return self::$names = static::query()->pluck('roleName', 'roleID')->all();
    }
}
