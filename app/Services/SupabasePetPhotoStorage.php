<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SupabasePetPhotoStorage
{
    public function upload(UploadedFile $photo, int|string $ownerId): string
    {
        $path = sprintf(
            '%s/%s.%s',
            $ownerId,
            bin2hex(random_bytes(16)),
            $photo->guessExtension() ?: 'jpg',
        );
        $content = $photo->getContent();
        $mimeType = $photo->getMimeType() ?: 'application/octet-stream';

        $response = $this->request()
            ->withHeaders($this->headers() + [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'public, max-age=31536000, immutable',
            ])
            ->withBody($content, $mimeType)
            ->post($this->objectUrl($path));

        if (! $response->successful()) {
            throw new RuntimeException('Supabase Storage rejected the pet photo upload (HTTP '.$response->status().').');
        }

        return $path;
    }

    public function delete(string $path): void
    {
        $response = $this->request()
            ->timeout(15)
            ->withHeaders($this->headers())
            ->delete($this->bucketUrl(), ['prefixes' => [$path]]);

        if (! $response->successful()) {
            throw new RuntimeException('Supabase Storage could not remove the previous pet photo (HTTP '.$response->status().').');
        }
    }

    public function publicUrl(string $path): string
    {
        $url = rtrim($this->projectUrl(), '/');
        $bucket = rawurlencode($this->bucket());

        return $url.'/storage/v1/object/public/'.$bucket.'/'.$this->encodePath($path);
    }

    private function objectUrl(string $path): string
    {
        return $this->bucketUrl().'/'.$this->encodePath($path);
    }

    private function bucketUrl(): string
    {
        return rtrim($this->projectUrl(), '/').'/storage/v1/object/'.rawurlencode($this->bucket());
    }

    private function projectUrl(): string
    {
        $url = config('services.supabase.url');

        if (! is_string($url) || $url === '') {
            throw new RuntimeException('SUPABASE_URL is not configured.');
        }

        return $url;
    }

    private function bucket(): string
    {
        return (string) config('services.supabase.pet_photos_bucket', 'pet-profiles');
    }

    /** @return array<string, string> */
    private function headers(): array
    {
        $key = config('services.supabase.secret_key');

        if (! is_string($key) || $key === '') {
            throw new RuntimeException('SUPABASE_SECRET_KEY is not configured.');
        }

        return [
            'apikey' => $key,
        ];
    }

    private function request(): PendingRequest
    {
        $request = Http::timeout(30);
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
