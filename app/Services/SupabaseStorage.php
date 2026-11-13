<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Thin client for Supabase Storage's REST API.
 *
 * Buckets used by this app are PRIVATE: objects are never publicly reachable,
 * and the app hands out short-lived signed URLs only after its own
 * authorization checks pass.
 */
class SupabaseStorage
{
    public const DISK = 'supabase';

    public function isConfigured(): bool
    {
        return filled(config('services.supabase.url')) && filled(config('services.supabase.secret_key'));
    }

    /**
     * Upload a file under "{prefix}/{random}.{ext}" and return the object path
     * (relative to the bucket) that should be stored in the database.
     */
    public function upload(UploadedFile $file, string $bucket, string $prefix): string
    {
        $path = sprintf(
            '%s/%s.%s',
            trim($prefix, '/'),
            bin2hex(random_bytes(16)),
            $file->guessExtension() ?: $file->getClientOriginalExtension() ?: 'bin',
        );
        $mimeType = $file->getMimeType() ?: 'application/octet-stream';

        $response = $this->request()
            ->withHeaders([
                'Content-Type' => $mimeType,
                'Cache-Control' => 'private, max-age=3600',
                'x-upsert' => 'false',
            ])
            ->withBody($file->getContent(), $mimeType)
            ->post($this->objectUrl($bucket, $path));

        if (! $response->successful()) {
            throw new RuntimeException("Supabase Storage rejected the upload to bucket [{$bucket}] (HTTP {$response->status()}).");
        }

        return $path;
    }

    public function delete(string $bucket, string $path): void
    {
        $response = $this->request()
            ->timeout(15)
            ->delete($this->baseUrl().'/object/'.rawurlencode($bucket), ['prefixes' => [$path]]);

        if (! $response->successful()) {
            throw new RuntimeException("Supabase Storage could not delete [{$path}] (HTTP {$response->status()}).");
        }
    }

    /** Create a signed URL that expires after $seconds. */
    public function signedUrl(string $bucket, string $path, int $seconds = 300): string
    {
        $response = $this->request()
            ->timeout(15)
            ->post($this->baseUrl().'/object/sign/'.rawurlencode($bucket).'/'.$this->encodePath($path), [
                'expiresIn' => $seconds,
            ]);

        $signed = $response->json('signedURL') ?? $response->json('signedUrl');

        if (! $response->successful() || ! is_string($signed) || $signed === '') {
            throw new RuntimeException("Supabase Storage could not sign [{$path}] (HTTP {$response->status()}).");
        }

        return str_starts_with($signed, 'http') ? $signed : $this->baseUrl().'/'.ltrim($signed, '/');
    }

    /**
     * Create the bucket as private if it does not already exist.
     *
     * @param  list<string>  $allowedMimeTypes
     * @return bool true when the bucket was created, false when it already existed
     */
    public function ensurePrivateBucket(string $bucket, array $allowedMimeTypes, int $maxBytes): bool
    {
        $existing = $this->request()->get($this->baseUrl().'/bucket/'.rawurlencode($bucket));

        if ($existing->successful()) {
            $response = $this->request()->put($this->baseUrl().'/bucket/'.rawurlencode($bucket), [
                'public' => false,
                'file_size_limit' => $maxBytes,
                'allowed_mime_types' => $allowedMimeTypes,
            ]);

            if (! $response->successful()) {
                throw new RuntimeException("Could not update bucket [{$bucket}] (HTTP {$response->status()}): {$response->body()}");
            }

            return false;
        }

        $response = $this->request()->post($this->baseUrl().'/bucket', [
            'id' => $bucket,
            'name' => $bucket,
            'public' => false,
            'file_size_limit' => $maxBytes,
            'allowed_mime_types' => $allowedMimeTypes,
        ]);

        if (! $response->successful()) {
            throw new RuntimeException("Could not create bucket [{$bucket}] (HTTP {$response->status()}): {$response->body()}");
        }

        return true;
    }

    public static function paymentProofsBucket(): string
    {
        return (string) config('services.supabase.payment_proofs_bucket', 'payment-proofs');
    }

    public static function petPhotosBucket(): string
    {
        return (string) config('services.supabase.pet_photos_bucket', 'pet-profiles');
    }

    public static function profilePhotosBucket(): string
    {
        return (string) config('services.supabase.profile_photos_bucket', 'profile-photos');
    }

    private function objectUrl(string $bucket, string $path): string
    {
        return $this->baseUrl().'/object/'.rawurlencode($bucket).'/'.$this->encodePath($path);
    }

    private function baseUrl(): string
    {
        $url = config('services.supabase.url');

        if (! is_string($url) || $url === '') {
            throw new RuntimeException('SUPABASE_URL is not configured.');
        }

        return rtrim($url, '/').'/storage/v1';
    }

    private function request(): PendingRequest
    {
        $key = config('services.supabase.secret_key');

        if (! is_string($key) || $key === '') {
            throw new RuntimeException('SUPABASE_SECRET_KEY is not configured.');
        }

        $headers = ['apikey' => $key];

        // Legacy service_role keys are JWTs and must also be sent as a bearer token.
        // New "sb_secret_..." keys are not JWTs and must only go in the apikey header.
        if (str_starts_with($key, 'eyJ')) {
            $headers['Authorization'] = 'Bearer '.$key;
        }

        $request = Http::timeout(30)->acceptJson()->withHeaders($headers);
        $caBundle = config('services.supabase.ca_bundle');

        if (is_string($caBundle) && $caBundle !== '' && is_file($caBundle)) {
            $request = $request->withOptions(['verify' => $caBundle]);
        }

        return $request;
    }

    private function encodePath(string $path): string
    {
        return implode('/', array_map('rawurlencode', explode('/', $path)));
    }
}
