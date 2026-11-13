<?php

namespace App\Http\Controllers;

use App\Http\Requests\RejectAppointmentRequest;
use App\Http\Requests\StoreAppointmentRequest;
use App\Models\Appointment;
use App\Services\SupabaseStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AppointmentController extends Controller
{
    public function __construct(private readonly SupabaseStorage $storage) {}

    public function availability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);
        $month = Carbon::createFromFormat('!Y-m', $validated['month']);

        $confirmedSlots = Appointment::query()
            ->where('status', Appointment::STATUS_CONFIRMED)
            ->whereBetween('app_date_time', [
                $month->copy()->startOfMonth(),
                $month->copy()->endOfMonth(),
            ])
            ->orderBy('app_date_time')
            ->get(['app_date_time'])
            ->map(fn (Appointment $appointment) => $appointment->app_date_time->format('Y-m-d\TH:i'))
            ->values();

        return response()->json(['confirmedSlots' => $confirmedSlots]);
    }

    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($this->slotIsTaken($validated['app_date_time'])) {
            return back()->withErrors([
                'app_date_time' => 'That appointment time is no longer available. Please choose another time.',
            ])->withInput();
        }

        $bucket = SupabaseStorage::paymentProofsBucket();

        try {
            $proofPath = $this->storage->upload(
                $request->file('proof_of_down_payment'),
                $bucket,
                (string) $request->user()->getAuthIdentifier(),
            );
        } catch (Throwable $exception) {
            Log::error('Proof of payment upload failed.', ['exception' => $exception->getMessage()]);

            return back()->withErrors([
                'proof_of_down_payment' => 'The proof of payment could not be uploaded. Please try again.',
            ]);
        }

        try {
            $appointment = DB::transaction(fn () => Appointment::create([
                'ar_first_name' => $validated['ar_first_name'],
                'ar_last_name' => $validated['ar_last_name'],
                'pet_id' => $validated['pet_id'],
                'service_type' => $validated['service_type'],
                'notes' => $validated['notes'] ?? null,
                'app_date_time' => $validated['app_date_time'],
                'proof_of_down_payment_path' => $proofPath,
                'proof_of_down_payment_disk' => SupabaseStorage::DISK,
                'reference_number' => $validated['reference_number'],
                'status' => Appointment::STATUS_PENDING,
                'user_id' => $request->user()->getAuthIdentifier(),
            ]));
        } catch (Throwable $exception) {
            rescue(fn () => $this->storage->delete($bucket, $proofPath), report: false);

            throw $exception;
        }

        return redirect()
            ->route('dashboard.role', ['role' => 'customer'])
            ->with('success', 'Done! Your appointment was saved and is pending clerk confirmation.')
            ->with('referenceNumber', $appointment->reference_number);
    }

    /**
     * Serve the proof of payment through an authorization check.
     * The Supabase bucket is private, so we redirect to a short-lived signed URL.
     */
    public function proof(Request $request, Appointment $appointment): Response
    {
        $user = $request->user();
        abort_unless(
            in_array($user->role, ['clerk', 'admin', 'owner'], true)
                || (int) $appointment->user_id === (int) $user->getAuthIdentifier(),
            403,
        );
        abort_unless($appointment->proof_of_down_payment_path, 404);

        $path = $appointment->proof_of_down_payment_path;

        if ($appointment->proof_of_down_payment_disk === SupabaseStorage::DISK) {
            try {
                $url = $this->storage->signedUrl(SupabaseStorage::paymentProofsBucket(), $path, 300);
            } catch (Throwable $exception) {
                Log::error('Could not sign proof of payment URL.', ['appointment' => $appointment->id, 'exception' => $exception->getMessage()]);
                abort(502, 'The proof of payment is temporarily unavailable.');
            }

            return redirect()->away($url)->header('Cache-Control', 'no-store');
        }

        // Legacy uploads saved on the app's local disk before the Supabase migration.
        $disk = Storage::disk(config('filesystems.default'));
        abort_unless($disk->exists($path), 404);

        return $disk->response($path, headers: ['Cache-Control' => 'private, no-store']);
    }

    public function accept(Request $request, Appointment $appointment): RedirectResponse
    {
        abort_unless($request->user()->role === 'clerk', 403);

        $result = DB::transaction(function () use ($request, $appointment) {
            $appointment = Appointment::query()->lockForUpdate()->findOrFail($appointment->id);

            if (! $appointment->isPending()) {
                return 'This appointment has already been reviewed.';
            }

            if ($this->slotIsTaken($appointment->app_date_time, $appointment->id)) {
                return 'Another appointment is already confirmed for this date and time. Reject this request or ask the owner to reschedule.';
            }

            $appointment->update([
                'status' => Appointment::STATUS_CONFIRMED,
                'rejection_reason' => null,
                'reviewed_by' => $request->user()->getAuthIdentifier(),
                'reviewed_at' => now(),
            ]);

            return null;
        });

        if ($result !== null) {
            return back()->withErrors(['appointment' => $result]);
        }

        return back()->with('success', 'Appointment accepted. It is now visible to the veterinarians.');
    }

    public function reject(RejectAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $updated = Appointment::query()
            ->whereKey($appointment->id)
            ->where('status', Appointment::STATUS_PENDING)
            ->update([
                'status' => Appointment::STATUS_REJECTED,
                'rejection_reason' => $request->validated('rejection_reason'),
                'reviewed_by' => $request->user()->getAuthIdentifier(),
                'reviewed_at' => now(),
                'updated_at' => now(),
            ]);

        if ($updated === 0) {
            return back()->withErrors(['appointment' => 'This appointment has already been reviewed.']);
        }

        return back()->with('success', 'Appointment rejected. The pet owner will see your reason.');
    }

    private function slotIsTaken(mixed $dateTime, ?int $exceptId = null): bool
    {
        return Appointment::query()
            ->where('status', Appointment::STATUS_CONFIRMED)
            ->where('app_date_time', Carbon::parse($dateTime))
            ->when($exceptId, fn ($query) => $query->whereKeyNot($exceptId))
            ->exists();
    }
}
