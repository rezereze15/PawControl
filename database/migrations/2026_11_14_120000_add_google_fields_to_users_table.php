<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            // Google's "sub" claim: the permanent, unique ID of the Google account.
            $table->string('google_id')->nullable()->unique();
            // Google profile picture URL.
            $table->string('avatar', 2048)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['google_id']);
            $table->dropColumn(['google_id', 'avatar']);
        });
    }
};
