<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE appointments ALTER COLUMN reference_number TYPE VARCHAR(255) USING reference_number::VARCHAR(255)');
            DB::statement('ALTER TABLE appointments ALTER COLUMN proof_of_down_payment_path DROP NOT NULL');

            return;
        }

        Schema::table('appointments', function (Blueprint $table): void {
            $table->string('reference_number', 255)->change();
            $table->string('proof_of_down_payment_path')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE appointments ALTER COLUMN reference_number TYPE INTEGER USING reference_number::INTEGER');
            DB::statement('ALTER TABLE appointments ALTER COLUMN proof_of_down_payment_path SET NOT NULL');

            return;
        }

        Schema::table('appointments', function (Blueprint $table): void {
            $table->integer('reference_number')->change();
            $table->string('proof_of_down_payment_path')->nullable(false)->change();
        });
    }
};
