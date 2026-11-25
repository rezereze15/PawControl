<?php

use App\Models\Billing;
use App\Models\MedicalRecord;
use Illuminate\Database\Migrations\Migration;

/**
 * Records a vet completed before automatic billing existed get their bill now, as if
 * billing had been on at the time: priced from what the vet saved, attributed to that
 * vet, dated to the completion.
 *
 * Skipped: past visits the medical-records migration marked Completed on its own
 * (no vet, no diagnosis) — no diagnosis was ever done, so there's nothing to bill.
 */
return new class extends Migration
{
    public function up(): void
    {
        MedicalRecord::query()
            ->where('status', MedicalRecord::STATUS_COMPLETED)
            ->whereNotNull('veterinarian_id')
            ->whereNotNull('diagnosis')
            ->whereDoesntHave('billing')
            ->orderBy('id')
            ->each(fn (MedicalRecord $record) => Billing::forCompletedRecord($record, $record->veterinarian_id));
    }

    public function down(): void
    {
        // Bills may have been edited or paid since; removing them isn't safe to automate.
    }
};
