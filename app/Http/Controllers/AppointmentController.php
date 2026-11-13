<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class AppointmentController extends Controller
{
    public function availability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);
        $month = Carbon::createFromFormat('!Y-m', $validated['month']);

        $confirmedSlots = Appointment::query()
            ->where('status', 'Confirmed')
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
        $slotIsConfirmed = Appointment::query()
            ->where('status', 'Confirmed')
            ->where('app_date_time', $validated['app_date_time'])
            ->exists();

        if ($slotIsConfirmed) {
            return back()->withErrors([
                'app_date_time' => 'That appointment time is no longer available. Please choose another time.',
            ])->withInput();
        }

        $disk = config('filesystems.default');
        $proofPath = null;

        if ($request->hasFile('proof_of_down_payment')) {
            $proofPath = $request->file('proof_of_down_payment')->store('appointment-proofs', $disk);

            if (! $proofPath) {
                return back()->withErrors([
                    'proof_of_down_payment' => 'The proof of payment could not be saved. Please try again.',
                ]);
            }
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
                'reference_number' => $validated['reference_number'],
                'status' => 'Pending',
                'user_id' => $request->user()->getAuthIdentifier(),
            ]));
        } catch (Throwable $exception) {
            if ($proofPath) {
                Storage::disk($disk)->delete($proofPath);
            }

            throw $exception;
        }

        return redirect()
            ->route('dashboard.role', ['role' => 'customer'])
            ->with('success', 'Done! Your appointment was saved and is pending clerk confirmation.')
            ->with('referenceNumber', $appointment->reference_number);
    }
}
