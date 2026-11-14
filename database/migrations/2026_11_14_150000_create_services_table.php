<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('description', 255)->nullable();
            $table->decimal('price', 10, 2);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE services ENABLE ROW LEVEL SECURITY');
        }

        // The six services customers can already book (see appointmentConstants.js).
        // Prices are TEST values until they are confirmed with the client.
        $services = [
            [
                'name' => 'Emergency Response',
                'description' => 'Immediate assessment and stabilization for pets with urgent or life-threatening conditions.',
                'price' => 1500.00,
            ],
            [
                'name' => 'Advanced Diagnosis',
                'description' => 'In-depth diagnostic work-up, such as laboratory tests and imaging, to find the cause of illness.',
                'price' => 3500.00,
            ],
            [
                'name' => 'Critical Care',
                'description' => 'Close monitoring and intensive treatment for seriously ill or injured pets.',
                'price' => 4000.00,
            ],
            [
                'name' => 'ICU',
                'description' => 'Round-the-clock intensive care unit confinement with continuous monitoring.',
                'price' => 6000.00,
            ],
            [
                'name' => 'Blood Transfusion',
                'description' => 'Blood typing, cross-matching, and transfusion for pets with severe blood loss or anemia.',
                'price' => 8000.00,
            ],
            [
                'name' => 'Surgery & Intensive Monitoring',
                'description' => 'Surgical procedures under anesthesia with close post-operative monitoring.',
                'price' => 15000.00,
            ],
        ];

        // Add the same status and timestamps to every row, then insert all six at once.
        $now = now();

        DB::table('services')->insert(array_map(
            fn (array $service) => $service + ['is_active' => true, 'created_at' => $now, 'updated_at' => $now],
            $services,
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
