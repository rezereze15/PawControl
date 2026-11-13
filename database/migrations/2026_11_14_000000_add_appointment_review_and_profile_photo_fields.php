<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            // Where the proof lives: "supabase" for new uploads, null for legacy local-disk files.
            $table->string('proof_of_down_payment_disk', 20)->nullable();
            $table->string('rejection_reason', 500)->nullable()->change();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('reviewed_at')->nullable();
            $table->index('status');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->string('profile_photo_path')->nullable();
        });

        Schema::table('pets', function (Blueprint $table): void {
            // "supabase" for new uploads, null for legacy local-disk photos.
            $table->string('photo_disk', 20)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('pets', function (Blueprint $table): void {
            $table->dropColumn('photo_disk');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('profile_photo_path');
        });

        Schema::table('appointments', function (Blueprint $table): void {
            $table->dropIndex(['status']);
            $table->dropConstrainedForeignId('reviewed_by');
            $table->dropColumn(['proof_of_down_payment_disk', 'reviewed_at']);
            $table->string('rejection_reason', 50)->nullable()->change();
        });
    }
};
