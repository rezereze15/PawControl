<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_registrations', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('username', 50);
            $table->string('email')->index();
            $table->string('phone', 30);
            $table->text('address');
            $table->string('password');
            // Bcrypt hash of the 6-digit code. Null once invalidated (too many attempts).
            $table->string('code_hash')->nullable();
            $table->timestamp('code_expires_at')->index();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('last_sent_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_registrations');
    }
};
