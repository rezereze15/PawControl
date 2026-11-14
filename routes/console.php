<?php

use App\Services\SupabaseStorage;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

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
