<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_supplies', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('description', 255)->nullable();
            $table->string('category', 50); // one of MedicalSupply::CATEGORIES
            $table->string('unit_of_measure', 20); // one of MedicalSupply::UNITS
            $table->integer('stock_quantity')->default(0);
            // Low stock = stock_quantity at or below this number.
            $table->integer('reorder_level')->default(10);
            $table->decimal('unit_price', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE medical_supplies ENABLE ROW LEVEL SECURITY');
        }

        // TEST data until the clinic gives us their real stock. Three are low on purpose:
        // Rabies Vaccine is exactly AT its reorder level, which also counts as low.
        // Values are written out here (not taken from the model) so this migration
        // always runs the same, even if the model's lists change later.
        $supplies = [
            [
                'name' => 'Amoxicillin 250mg',
                'description' => 'Broad-spectrum antibiotic for common bacterial infections.',
                'category' => 'Medication',
                'unit_of_measure' => 'tablet',
                'stock_quantity' => 200,
                'reorder_level' => 50,
                'unit_price' => 15.00,
            ],
            [
                'name' => 'Rabies Vaccine',
                'description' => 'Single-dose vaccine for rabies prevention in dogs and cats.',
                'category' => 'Vaccine',
                'unit_of_measure' => 'vial',
                'stock_quantity' => 10,
                'reorder_level' => 10,
                'unit_price' => 350.00,
            ],
            [
                'name' => '5-in-1 Vaccine',
                'description' => 'Combination vaccine for distemper, hepatitis, parvovirus, parainfluenza, and leptospirosis.',
                'category' => 'Vaccine',
                'unit_of_measure' => 'vial',
                'stock_quantity' => 25,
                'reorder_level' => 10,
                'unit_price' => 450.00,
            ],
            [
                'name' => "Lactated Ringer's Solution 1L",
                'description' => 'IV fluid for rehydration and fluid therapy.',
                'category' => 'IV & Fluids',
                'unit_of_measure' => 'bag',
                'stock_quantity' => 4,
                'reorder_level' => 10,
                'unit_price' => 120.00,
            ],
            [
                'name' => 'Absorbable Suture 3-0',
                'description' => 'Sterile absorbable suture for closing internal tissue after surgery.',
                'category' => 'Surgical',
                'unit_of_measure' => 'pcs',
                'stock_quantity' => 3,
                'reorder_level' => 10,
                'unit_price' => 250.00,
            ],
            [
                'name' => 'Surgical Gloves',
                'description' => 'Sterile latex gloves for surgical procedures.',
                'category' => 'Surgical',
                'unit_of_measure' => 'box',
                'stock_quantity' => 12,
                'reorder_level' => 5,
                'unit_price' => 380.00,
            ],
            [
                'name' => 'Blood Collection Tubes',
                'description' => 'Vacuum tubes for collecting blood samples for laboratory tests.',
                'category' => 'Diagnostic',
                'unit_of_measure' => 'box',
                'stock_quantity' => 15,
                'reorder_level' => 5,
                'unit_price' => 650.00,
            ],
            [
                'name' => 'Gauze Pads',
                'description' => 'Sterile gauze pads for wound care and dressing.',
                'category' => 'Consumable',
                'unit_of_measure' => 'pack',
                'stock_quantity' => 40,
                'reorder_level' => 15,
                'unit_price' => 85.00,
            ],
        ];

        // Add the same status and timestamps to every row, then insert all eight at once.
        $now = now();

        DB::table('medical_supplies')->insert(array_map(
            fn (array $supply) => $supply + ['is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            $supplies,
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_supplies');
    }
};
