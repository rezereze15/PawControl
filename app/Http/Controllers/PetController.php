<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePetRequest;
use App\Http\Requests\UpdatePetPhotoRequest;
use App\Models\Pet;
use App\Services\SupabaseStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class PetController extends Controller
{
    public function __construct(private readonly SupabaseStorage $storage) {}

    public function store(StorePetRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $photo = $validated['photo'] ?? null;
        unset($validated['photo']);
        $validated['age'] = ! empty($validated['dateOfBirth'])
            ? Carbon::parse($validated['dateOfBirth'])->age
            : null;

        $ownerId = $request->user()->getAuthIdentifier();
        $bucket = SupabaseStorage::petPhotosBucket();
        $photoPath = null;

        if ($photo) {
            try {
                $photoPath = $this->storage->upload($photo, $bucket, (string) $ownerId);
            } catch (Throwable $exception) {
                Log::error('Pet photo upload failed.', ['exception' => $exception->getMessage()]);

                return back()->withErrors([
                    'photo' => 'The pet photo could not be uploaded. Please try again.',
                ]);
            }
        }

        try {
            Pet::create([
                ...$validated,
                'photo_path' => $photoPath,
                'photo_disk' => $photoPath ? SupabaseStorage::DISK : null,
                'petOwnerID' => $ownerId,
            ]);
        } catch (Throwable $exception) {
            if ($photoPath) {
                rescue(fn () => $this->storage->delete($bucket, $photoPath), report: false);
            }

            throw $exception;
        }

        return redirect()
            ->route('dashboard.role', ['role' => 'customer'])
            ->with('success', 'Pet added successfully.');
    }

    /**
     * Serve the pet photo through an authorization check. The bucket is private,
     * so we redirect to a short-lived signed URL.
     */
    public function showPhoto(Request $request, Pet $pet): Response
    {
        $user = $request->user();
        abort_unless(
            in_array($user->role, ['clerk', 'veterinarian', 'admin', 'owner'], true)
                || (int) $pet->petOwnerID === (int) $user->getAuthIdentifier(),
            403,
        );
        abort_unless($pet->photo_path, 404);

        if ($pet->photo_disk === SupabaseStorage::DISK) {
            try {
                $url = $this->storage->signedUrl(SupabaseStorage::petPhotosBucket(), $pet->photo_path, 3600);
            } catch (Throwable $exception) {
                Log::warning('Could not sign pet photo URL.', ['pet' => $pet->petID, 'exception' => $exception->getMessage()]);
                abort(404);
            }

            // Let the browser reuse the redirect briefly; the signed URL lives for an hour.
            return redirect()->away($url)->header('Cache-Control', 'private, max-age=600');
        }

        // Legacy photos saved on the app's local disk before the Supabase migration.
        $disk = Storage::disk(config('filesystems.default'));
        abort_unless($disk->exists($pet->photo_path), 404);

        return $disk->response($pet->photo_path, headers: ['Cache-Control' => 'private, max-age=600']);
    }

    public function updatePhoto(UpdatePetPhotoRequest $request, Pet $pet): RedirectResponse
    {
        $bucket = SupabaseStorage::petPhotosBucket();

        try {
            $photoPath = $this->storage->upload($request->file('photo'), $bucket, (string) $pet->petOwnerID);
        } catch (Throwable $exception) {
            Log::error('Pet photo upload failed.', ['pet' => $pet->petID, 'exception' => $exception->getMessage()]);

            return back()->withErrors([
                'photo' => 'The pet photo could not be uploaded. Please try again.',
            ]);
        }

        $previousPath = $pet->photo_path;
        $previousDisk = $pet->photo_disk;

        try {
            $pet->update(['photo_path' => $photoPath, 'photo_disk' => SupabaseStorage::DISK]);
        } catch (Throwable $exception) {
            rescue(fn () => $this->storage->delete($bucket, $photoPath), report: false);
            throw $exception;
        }

        if ($previousPath) {
            rescue(fn () => $previousDisk === SupabaseStorage::DISK
                ? $this->storage->delete($bucket, $previousPath)
                : Storage::disk(config('filesystems.default'))->delete($previousPath), report: false);
        }

        return redirect()
            ->route('dashboard.role', ['role' => 'customer'])
            ->with('success', 'Pet profile photo updated.');
    }
}
