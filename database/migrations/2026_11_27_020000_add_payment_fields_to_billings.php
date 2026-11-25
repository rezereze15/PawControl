<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The clerk settles a bill with "Mark as Paid" on the receipt: who took the payment,
 * when, the receipt reference number, and the amount collected (the receipt total).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('billings', function (Blueprint $table): void {
            $table->string('reference_number', 100)->nullable();
            $table->decimal('amount_paid', 10, 2)->nullable();
            $table->timestampTz('paid_at')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('billings', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('paid_by');
            $table->dropColumn(['reference_number', 'amount_paid', 'paid_at']);
        });
    }
};
