<?php

use App\Models\Appointment;
use App\Models\Pet;
use App\Services\SupabaseStorage;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;

// Deletes stale pending registrations (see PendingRegistration::prunable()).
Schedule::command('model:prune')->daily();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('supabase:buckets', function (SupabaseStorage $storage) {
    $buckets = [
        SupabaseStorage::paymentProofsBucket() => ['image/jpeg', 'image/png', 'application/pdf'],
        SupabaseStorage::profilePhotosBucket() => ['image/jpeg', 'image/png', 'image/webp'],
        SupabaseStorage::petPhotosBucket() => ['image/jpeg', 'image/png', 'image/webp'],
    ];

    foreach ($buckets as $bucket => $mimeTypes) {
        $created = $storage->ensurePrivateBucket($bucket, $mimeTypes, 5 * 1024 * 1024);
        $this->info(($created ? 'Created' : 'Updated')." private bucket [{$bucket}].");
    }
})->purpose('Create or update the private Supabase Storage buckets used by PawControl');

Artisan::command('supabase:migrate-files {--dry-run : List what would be moved without changing anything}', function (SupabaseStorage $storage) {
    $disk = Storage::disk(config('filesystems.default'));
    $dryRun = (bool) $this->option('dry-run');
    $moved = $missing = $failed = 0;

    // Upload one legacy local file, point the record at it, then remove the local copy.
    $move = function (string $label, string $localPath, string $bucket, string $prefix, Closure $save) use ($storage, $disk, $dryRun, &$moved, &$missing, &$failed): void {
        if (! $disk->exists($localPath)) {
            $missing++;
            $this->warn("{$label}: local file is missing ({$localPath}) - left unchanged.");

            return;
        }

        if ($dryRun) {
            $moved++;
            $this->line("{$label}: would move {$localPath} to [{$bucket}].");

            return;
        }

        try {
            $file = new UploadedFile($disk->path($localPath), basename($localPath), null, null, true);
            $newPath = $storage->upload($file, $bucket, $prefix);
        } catch (Throwable $exception) {
            $failed++;
            $this->error("{$label}: upload failed - {$exception->getMessage()}");

            return;
        }

        try {
            $save($newPath);
        } catch (Throwable $exception) {
            rescue(fn () => $storage->delete($bucket, $newPath), report: false);
            $failed++;
            $this->error("{$label}: could not update the record - {$exception->getMessage()}");

            return;
        }

        $disk->delete($localPath);
        $moved++;
        $this->info("{$label}: moved to [{$bucket}] as {$newPath}.");
    };

    Appointment::query()
        ->whereNull('proof_of_down_payment_disk')
        ->whereNotNull('proof_of_down_payment_path')
        ->each(fn (Appointment $appointment) => $move(
            "Appointment #{$appointment->id} proof",
            $appointment->proof_of_down_payment_path,
            SupabaseStorage::paymentProofsBucket(),
            (string) $appointment->user_id,
            fn (string $path) => $appointment->forceFill([
                'proof_of_down_payment_path' => $path,
                'proof_of_down_payment_disk' => SupabaseStorage::DISK,
            ])->saveQuietly(),
        ));

    Pet::query()
        ->whereNull('photo_disk')
        ->whereNotNull('photo_path')
        ->each(fn (Pet $pet) => $move(
            "Pet #{$pet->petID} photo",
            $pet->photo_path,
            SupabaseStorage::petPhotosBucket(),
            (string) $pet->petOwnerID,
            fn (string $path) => $pet->forceFill([
                'photo_path' => $path,
                'photo_disk' => SupabaseStorage::DISK,
            ])->saveQuietly(),
        ));

    $this->newLine();
    $this->line(($dryRun ? 'Would move' : 'Moved').": {$moved}. Missing locally: {$missing}. Failed: {$failed}.");

    return $failed > 0 ? 1 : 0;
})->purpose('Move payment proofs and pet photos saved on the local disk into Supabase Storage');
