<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            // When the automatic "visit tomorrow" reminder email went out; null = not sent yet.
            $table->timestampTz('reminder_sent_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table): void {
            $table->dropColumn('reminder_sent_at');
        });
    }
};
