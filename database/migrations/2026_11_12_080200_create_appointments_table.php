<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table): void {
            $table->id();
            $table->string('ar_first_name', 50);
            $table->string('ar_last_name', 50);
            $table->integer('pet_id');
            $table->string('notes', 50)->nullable();
            $table->timestampTz('app_date_time');
            $table->string('proof_of_down_payment_path');
            $table->integer('reference_number')->unique();
            $table->string('status', 50)->default('Pending');
            $table->string('rejection_reason', 50)->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();

            $table->foreign('pet_id')->references('petID')->on('pets');
            $table->index('app_date_time');
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE appointments ENABLE ROW LEVEL SECURITY');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
