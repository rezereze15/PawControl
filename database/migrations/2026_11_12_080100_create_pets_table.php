<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pets', function (Blueprint $table): void {
            $table->increments('petID');
            $table->string('petName', 50);
            $table->string('species', 50);
            $table->string('breed', 50);
            $table->integer('age')->nullable();
            $table->string('sex', 50)->nullable();
            $table->date('dateOfBirth')->nullable();
            $table->decimal('weight', 8, 2)->nullable();
            $table->foreignId('petOwnerID')->constrained('users');
            $table->index('petOwnerID');
        });

        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE pets ENABLE ROW LEVEL SECURITY');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('pets');
    }
};
