<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The veterinarian's encoding of a medical record:
 *  - status: Upcoming (created when the clerk accepts) → Ongoing (vet pressed "Select /
 *    Start Diagnosis") → Completed. Shown to vets, clerks and the clinic owner.
 *  - clinical fields: suggestions and lab results (diagnosis, treatment, vet notes exist already),
 *  - services given and supplies used (linked to the Services and Medical Supplies modules),
 *  - uploaded medical images / files (stored in a private Supabase bucket).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medical_records', function (Blueprint $table): void {
            $table->string('status', 20)->default('Upcoming');
            $table->text('suggestions')->nullable();
            $table->text('lab_results')->nullable();
            $table->foreignId('veterinarian_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('started_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->index('status');
        });

        // Services given during the visit. The price is copied so the record keeps
        // what was charged even if the admin changes the service price later.
        Schema::create('medical_record_services', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->restrictOnDelete();
            $table->decimal('price', 10, 2);
            $table->timestamps();

            $table->unique(['medical_record_id', 'service_id']);
            $table->index('service_id');
        });

        // Supplies used during the visit, in the supply's own unit. Saving deducts them from stock.
        Schema::create('medical_record_supplies', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->cascadeOnDelete();
            $table->foreignId('medical_supply_id')->constrained('medical_supplies')->restrictOnDelete();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();

            $table->unique(['medical_record_id', 'medical_supply_id']);
            $table->index('medical_supply_id');
        });

        Schema::create('medical_record_files', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('medical_record_id')->constrained('medical_records')->cascadeOnDelete();
            $table->string('path');
            $table->string('disk', 20);
            $table->string('original_name');
            $table->string('mime_type', 100);
            $table->unsignedInteger('size');
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            foreach (['medical_record_services', 'medical_record_supplies', 'medical_record_files'] as $table) {
                DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
            }
        }

        // Visits from before today already happened: mark them Completed, as the clinic
        // owner's screen already showed them. Today's and future visits stay Upcoming.
        DB::table('medical_records')
            ->where('visit_date', '<', now()->startOfDay())
            ->update(['status' => 'Completed', 'completed_at' => DB::raw('visit_date')]);
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_record_files');
        Schema::dropIfExists('medical_record_supplies');
        Schema::dropIfExists('medical_record_services');

        Schema::table('medical_records', function (Blueprint $table): void {
            $table->dropIndex(['status']);
            $table->dropConstrainedForeignId('veterinarian_id');
            $table->dropColumn(['status', 'suggestions', 'lab_results', 'started_at', 'completed_at']);
        });
    }
};
