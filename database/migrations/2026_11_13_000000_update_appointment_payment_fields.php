<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE appointments ALTER COLUMN reference_number TYPE VARCHAR(255) USING reference_number::VARCHAR(255)');
        DB::statement('ALTER TABLE appointments ALTER COLUMN proof_of_down_payment_path DROP NOT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE appointments ALTER COLUMN reference_number TYPE INTEGER USING reference_number::INTEGER');
        DB::statement('ALTER TABLE appointments ALTER COLUMN proof_of_down_payment_path SET NOT NULL');
    }
};
