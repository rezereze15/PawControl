<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Billing records, created automatically when a veterinarian marks a medical record as
 * Completed. They feed the clerk's Upcoming Billings list and the printed receipt.
 *  - one billing per medical record (unique), so a double submit can't bill twice,
 *  - veterinarian_id: the attending vet who completed the diagnosis,
 *  - billing_items: the services given and supplies used, with the price copied at
 *    completion so later price changes in the admin modules don't alter an issued bill.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('medical_record_id')->unique()->constrained('medical_records')->cascadeOnDelete();
            $table->foreignId('veterinarian_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 20)->default('Unpaid');
            $table->decimal('discount', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestampTz('issued_at');
            $table->timestamps();

            $table->index('status');
            $table->index('veterinarian_id');
        });

        Schema::create('billing_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('billing_id')->constrained('billings')->cascadeOnDelete();
            $table->string('description');
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->timestamps();
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            foreach (['billings', 'billing_items'] as $table) {
                DB::statement("ALTER TABLE {$table} ENABLE ROW LEVEL SECURITY");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('billing_items');
        Schema::dropIfExists('billings');
    }
};
