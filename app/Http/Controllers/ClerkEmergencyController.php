<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmergencyWalkInRequest;
use App\Models\Appointment;
use App\Models\Pet;
use App\Models\Role;
use App\Models\User;
use App\Support\RegistrationRules;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Clerk-only emergency walk-ins. The pet and its visit go into the same pets / appointments
 * tables as online bookings, already Confirmed, so the veterinarians see them straight away
 * in their usual queue. The only differences: is_emergency = true, created_by = the clerk,
 * and (for owners without an account) no linked user.
 */
class ClerkEmergencyController extends Controller
{
    /** Pet owner accounts matching a name, email, username or phone, for the owner picker. */
    public function owners(Request $request): JsonResponse
    {
        $search = trim((string) $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ])['search'] ?? '');

        if (mb_strlen($search) < 2) {
            return response()->json(['owners' => []]);
        }

        $like = '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], mb_strtolower($search)).'%';

        $owners = User::query()
            ->where('status', User::STATUS_ACTIVE)
            ->whereIn('roleID', Role::query()->where('roleName', Role::CUSTOMER)->select('roleID'))
            ->where(fn ($query) => $query
                ->whereRaw('LOWER(name) LIKE ?', [$like])
                ->orWhereRaw('LOWER(email) LIKE ?', [$like])
                ->orWhereRaw('LOWER(username) LIKE ?', [$like])
                ->orWhere('phone', 'like', $like))
            ->withCount('pets')
            ->orderBy('name')
            ->limit(8)
            ->get(['id', 'name', 'email', 'phone'])
            ->map(fn (User $owner) => [
                'id' => $owner->id,
                'name' => $owner->name,
                'email' => $owner->email,
                'phone' => $owner->phone,
                'petCount' => (int) $owner->pets_count,
            ]);

        return response()->json(['owners' => $owners]);
    }

    public function store(StoreEmergencyWalkInRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $clerkId = $request->user()->getAuthIdentifier();
        $owner = $validated['owner_type'] === StoreEmergencyWalkInRequest::OWNER_EXISTING
            ? User::query()->findOrFail($validated['owner_id'])
            : null;
        $ownerName = $owner?->name ?? $validated['walk_in_owner_name'];
        $name = RegistrationRules::splitName($ownerName);

        $appointment = DB::transaction(function () use ($validated, $owner, $ownerName, $name, $clerkId) {
            $pet = Pet::create([
                'petName' => $validated['petName'],
                'species' => $validated['species'],
                'breed' => $validated['breed'],
                'sex' => $validated['sex'] ?? null,
                'age' => $validated['age'] ?? null,
                'weight' => $validated['weight'] ?? null,
                'petOwnerID' => $owner?->id,
                // Only for owners without an account; account owners' details come from users.
                'walk_in_owner_name' => $owner ? null : $validated['walk_in_owner_name'],
                'walk_in_owner_phone' => $owner ? null : $validated['walk_in_owner_phone'],
            ]);

            $now = now();

            return Appointment::create([
                'ar_first_name' => Str::limit($name['first_name'] ?: $ownerName, 50, ''),
                'ar_last_name' => Str::limit($name['last_name'], 50, ''),
                'pet_id' => $pet->petID,
                'service_type' => Appointment::EMERGENCY_SERVICE,
                'notes' => $validated['notes'],
                'app_date_time' => $now,
                'reference_number' => $this->referenceNumber(),
                // Confirmed immediately: no payment proof to review in an emergency.
                'status' => Appointment::STATUS_CONFIRMED,
                'reviewed_by' => $clerkId,
                'reviewed_at' => $now,
                'user_id' => $owner?->id,
                'is_emergency' => true,
                'created_by' => $clerkId,
            ]);
        });

        return back()
            ->with('success', "Emergency walk-in for {$validated['petName']} saved. It is now in the veterinarians' queue.")
            ->with('referenceNumber', $appointment->reference_number);
    }

    /** "EMR-" + date + random suffix: never collides with the numeric online references. */
    private function referenceNumber(): string
    {
        do {
            $reference = 'EMR-'.now()->format('ymd').'-'.Str::upper(Str::random(5));
        } while (Appointment::query()->where('reference_number', $reference)->exists());

        return $reference;
    }
}
