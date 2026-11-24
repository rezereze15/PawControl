<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Emergency walk-ins: the clerk registers a pet (and its visit) for an owner who may not
 * have an account yet. Records stay in the same pets / appointments tables:
 *  - pets.petOwnerID and appointments.user_id become nullable (no account yet),
 *  - the walk-in owner's name and contact number are kept on the pet, so the pet can be
 *    linked to an account later by filling in petOwnerID,
 *  - appointments.is_emergency tags the visit and created_by records which clerk made it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pets', function (Blueprint $table): void {
            $table->unsignedBigInteger('petOwnerID')->nullable()->change();
            $table->string('walk_in_owner_name', 100)->nullable();
            $table->string('walk_in_owner_phone', 30)->nullable();
        });

        Schema::table('appointments', function (Blueprint $table): void {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            // Emergency symptoms can be longer than a booking note.
            $table->string('notes', 1000)->nullable()->change();
            $table->boolean('is_emergency')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->index('is_emergency');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->dropIndex(['is_emergency']);
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn('is_emergency');
        });

        Schema::table('pets', function (Blueprint $table): void {
            $table->dropColumn(['walk_in_owner_name', 'walk_in_owner_phone']);
        });

        // petOwnerID / user_id stay nullable and notes stays wide: making them strict again
        // would fail as soon as a walk-in record exists.
    }
};
