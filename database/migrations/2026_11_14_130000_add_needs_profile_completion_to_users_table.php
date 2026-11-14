<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            // True only for accounts created via Google that still lack username/phone/address.
            // Defaults to false, so every existing and normally-registered user counts as complete.
            $table->boolean('needs_profile_completion')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('needs_profile_completion');
        });
    }
};
