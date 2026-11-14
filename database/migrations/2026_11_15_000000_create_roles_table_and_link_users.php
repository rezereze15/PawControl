<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * ERD: ROLES (roleID PK, roleName) 1 ── * USERS (roleID FK).
 *
 * Replaces the free-text users.role column with a foreign key to a roles table.
 * Existing users keep their role: each text value is mapped to its roles row.
 */
return new class extends Migration
{
    /** Role names, in the order their roleIDs are assigned. */
    private const ROLES = ['admin', 'owner', 'veterinarian', 'clerk', 'customer'];

    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table): void {
            $table->increments('roleID');
            $table->string('roleName', 50)->unique();
        });

        DB::table('roles')->insert(array_map(fn (string $name) => ['roleName' => $name], self::ROLES));

        Schema::table('users', function (Blueprint $table): void {
            $table->unsignedInteger('roleID')->nullable();
            $table->timestampTz('last_login_at')->nullable();
        });

        $roleIds = DB::table('roles')->pluck('roleID', 'roleName');

        foreach ($roleIds as $name => $id) {
            DB::table('users')->where('role', $name)->update(['roleID' => $id]);
        }

        // Anything unrecognised becomes a pet owner, the least-privileged role.
        DB::table('users')->whereNull('roleID')->update(['roleID' => $roleIds['customer']]);

        Schema::table('users', function (Blueprint $table): void {
            $table->unsignedInteger('roleID')->nullable(false)->change();
            $table->foreign('roleID')->references('roleID')->on('roles')->restrictOnDelete();
            $table->index('roleID');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('role')->default('customer');
        });

        foreach (DB::table('roles')->pluck('roleName', 'roleID') as $id => $name) {
            DB::table('users')->where('roleID', $id)->update(['role' => $name]);
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['roleID']);
            $table->dropIndex(['roleID']);
            $table->dropColumn(['roleID', 'last_login_at']);
        });

        Schema::dropIfExists('roles');
    }
};
