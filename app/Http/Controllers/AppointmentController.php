<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAppointmentRequest;
use App\Models\Appointment;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class AppointmentController extends Controller
{
    public function store(StoreAppointmentRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $disk = config('filesystems.default');
        $proofPath = $request->file('proof_of_down_payment')->store('appointment-proofs', $disk);

        if (! $proofPath) {
            return back()->withErrors([
                'proof_of_down_payment' => 'The proof of payment could not be saved. Please try again.',
            ]);
        }

        try {
            $appointment = null;

            for ($attempt = 0; $attempt < 5; $attempt++) {
                $referenceNumber = random_int(100000000, 999999999);

                try {
                    $appointment = DB::transaction(fn () => Appointment::create([
                        'ar_first_name' => $validated['ar_first_name'],
                        'ar_last_name' => $validated['ar_last_name'],
                        'pet_id' => $validated['pet_id'],
                        'notes' => $validated['notes'] ?? null,
                        'app_date_time' => $validated['app_date_time'],
                        'proof_of_down_payment_path' => $proofPath,
                        'reference_number' => $referenceNumber,
                        'status' => 'Pending',
                        'user_id' => $request->user()->getAuthIdentifier(),
                    ]));

                    break;
                } catch (QueryException $exception) {
                    $duplicateReference = Appointment::where('reference_number', $referenceNumber)->exists();

                    if (! $duplicateReference || $attempt === 4) {
                        throw $exception;
                    }
                }
            }

            if (! $appointment) {
                throw new RuntimeException('Unable to generate a unique appointment reference number.');
            }
        } catch (Throwable $exception) {
            Storage::disk($disk)->delete($proofPath);

            throw $exception;
        }

        return redirect()
            ->route('dashboard.role', ['role' => 'customer'])
            ->with('success', 'Your appointment request was submitted.')
            ->with('referenceNumber', $appointment->reference_number);
    }
}
