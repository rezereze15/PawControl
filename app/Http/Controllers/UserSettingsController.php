<?php

namespace App\Http\Controllers;

use App\Services\SupabaseStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules\Password;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Self-service settings. A user may change ONLY their profile photo,
 * address and password. Name, email, phone and role are managed by staff.
 */
class UserSettingsController extends Controller
{
    public function __construct(private readonly SupabaseStorage $storage) {}

    public function showPhoto(Request $request): Response
    {
        $path = $request->user()->profile_photo_path;
        abort_unless($path, 404);

        try {
            $url = $this->storage->signedUrl(SupabaseStorage::profilePhotosBucket(), $path, 3600);
        } catch (Throwable $exception) {
            Log::warning('Could not sign profile photo URL.', ['exception' => $exception->getMessage()]);
            abort(404);
        }

        return redirect()->away($url)->header('Cache-Control', 'private, max-age=600');
    }

    public function updatePhoto(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $user = $request->user();
        $bucket = SupabaseStorage::profilePhotosBucket();

        try {
            $path = $this->storage->upload($request->file('photo'), $bucket, (string) $user->getAuthIdentifier());
        } catch (Throwable $exception) {
            Log::error('Profile photo upload failed.', ['exception' => $exception->getMessage()]);

            return back()->withErrors(['photo' => 'Your photo could not be uploaded. Please try again.']);
        }

        $previous = $user->profile_photo_path;

        try {
            $user->update(['profile_photo_path' => $path]);
        } catch (Throwable $exception) {
            rescue(fn () => $this->storage->delete($bucket, $path), report: false);
            throw $exception;
        }

        if ($previous) {
            rescue(fn () => $this->storage->delete($bucket, $previous), report: false);
        }

        return back()->with('success', 'Profile photo updated.');
    }

    public function updateAddress(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'address' => ['required', 'string', 'min:5', 'max:255'],
        ]);

        $request->user()->update(['address' => trim($validated['address'])]);

        return back()->with('success', 'Address updated.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', 'different:current_password', Password::min(8)->letters()->numbers()],
        ], [
            'current_password.current_password' => 'Your current password is incorrect.',
            'password.different' => 'Your new password must be different from your current password.',
        ]);

        $request->user()->update(['password' => $validated['password']]);
        $request->session()->regenerate();

        return back()->with('success', 'Password updated.');
    }
}
