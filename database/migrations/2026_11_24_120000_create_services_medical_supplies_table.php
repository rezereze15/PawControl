<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * ERD: SERVICES 1 ── * SERVICES_MEDICAL_SUPPLIES * ── 1 MEDICAL_SUPPLIES.
 *
 * Junction table: each row says "this service uses this many of this supply",
 * e.g. Surgery uses 2 Absorbable Suture 3-0. The amount is in the supply's own unit (pcs, bag, ...).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services_medical_supplies', function (Blueprint $table): void {
            $table->id();
            // restrictOnDelete: the database refuses to delete a service or supply that is still linked.
            // We never delete them anyway (we deactivate), so this is a safety net.
            $table->foreignId('service_id')->constrained('services')->restrictOnDelete();
            $table->foreignId('medical_supply_id')->constrained('medical_supplies')->restrictOnDelete();
            // How many the service uses each time it is performed (1 or more, checked by the app).
            $table->integer('quantity')->default(1);
            $table->timestamps();

            // The same service + supply pair can only be added once (change the quantity instead).
            $table->unique(['service_id', 'medical_supply_id']);
            // Speeds up "which services use this supply?". The unique index above
            // already covers the other direction, "which supplies does this service use?".
            $table->index('medical_supply_id');
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE services_medical_supplies ENABLE ROW LEVEL SECURITY');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('services_medical_supplies');
    }
};
