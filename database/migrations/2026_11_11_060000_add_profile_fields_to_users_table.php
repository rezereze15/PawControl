<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('username', 50)->nullable()->unique();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('role')->default('customer');
            $table->string('status')->default('Active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropUnique(['username']);
            $table->dropColumn(['username', 'phone', 'address', 'role', 'status']);
        });
    }
};
