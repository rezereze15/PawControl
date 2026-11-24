<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Pet medical records: one per accepted (Confirmed) appointment, created automatically
 * when the clerk accepts a booking or registers an emergency walk-in.
 * The clinical fields (diagnosis, treatment, vet notes) start empty for the veterinarian.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_records', function (Blueprint $table): void {
            $table->id();
            $table->integer('pet_id');
            $table->foreignId('appointment_id')->unique()->constrained('appointments')->cascadeOnDelete();
            // Copied from the appointment when the record is created, so the record keeps
            // what was booked even if the service is later renamed.
            $table->timestampTz('visit_date');
            $table->string('service_type', 100)->nullable();
            $table->string('chief_complaint', 1000)->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('treatment')->nullable();
            $table->text('vet_notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->foreign('pet_id')->references('petID')->on('pets')->cascadeOnDelete();
            $table->index(['pet_id', 'visit_date']);
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY');
        }

        // Appointments accepted before this table existed get their record now.
        $now = now();
        DB::table('appointments')
            ->where('status', 'Confirmed')
            ->orderBy('id')
            ->chunkById(500, function ($appointments) use ($now): void {
                DB::table('medical_records')->insert($appointments->map(fn ($appointment) => [
                    'pet_id' => $appointment->pet_id,
                    'appointment_id' => $appointment->id,
                    'visit_date' => $appointment->app_date_time,
                    'service_type' => $appointment->service_type,
                    'chief_complaint' => $appointment->notes,
                    'created_by' => $appointment->reviewed_by,
                    'created_at' => $appointment->reviewed_at ?? $now,
                    'updated_at' => $now,
                ])->all());
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
