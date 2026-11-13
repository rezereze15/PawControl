<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePetRequest;
use App\Http\Requests\UpdatePetPhotoRequest;
use App\Models\Pet;
use Illuminate\Support\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PetController extends Controller
{
    public function store(StorePetRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $photo = $validated['photo'] ?? null;
        unset($validated['photo']);
        $validated['age'] = ! empty($validated['dateOfBirth'])
            ? Carbon::parse($validated['dateOfBirth'])->age
            : null;

        $disk = config('filesystems.default');
        $photoPath = $photo?->store('pet-profiles', $disk);

        if ($photo && ! $photoPath) {
            return back()->withErrors([
                'photo' => 'The pet photo could not be saved. Please try again.',
            ]);
        }

        try {
            Pet::create([
                ...$validated,
                'photo_path' => $photoPath,
                'petOwnerID' => $request->user()->getAuthIdentifier(),
            ]);
        } catch (Throwable $exception) {
            if ($photoPath) {
                Storage::disk($disk)->delete($photoPath);
            }

            throw $exception;
        }

        return redirect()
            ->route('dashboard.role', ['role' => 'customer'])
            ->with('success', 'Pet added successfully.');
    }

    public function updatePhoto(UpdatePetPhotoRequest $request, Pet $pet): RedirectResponse
    {
        $disk = config('filesystems.default');
        $photoPath = $request->file('photo')->store('pet-profiles', $disk);

        if (! $photoPath) {
            return back()->withErrors([
                'photo' => 'The pet photo could not be saved. Please try again.',
            ]);
        }

        $previousPhotoPath = $pet->photo_path;

        try {
            $pet->update(['photo_path' => $photoPath]);
        } catch (Throwable $exception) {
            Storage::disk($disk)->delete($photoPath);
            throw $exception;
        }

        if ($previousPhotoPath) {
            Storage::disk($disk)->delete($previousPhotoPath);
        }

        return redirect()
            ->route('dashboard.role', ['role' => 'customer'])
            ->with('success', 'Pet profile photo updated.');
    }
}
