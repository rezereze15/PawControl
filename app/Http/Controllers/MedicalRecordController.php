<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateMedicalRecordRequest;
use App\Models\MedicalRecord;
use App\Models\MedicalRecordFile;
use App\Models\MedicalSupply;
use App\Models\Role;
use App\Models\Service;
use App\Services\SupabaseStorage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Veterinarian encoding of medical records: start the diagnosis, save findings,
 * services given and supplies used (deducted from stock), and attach images/files.
 */
class MedicalRecordController extends Controller
{
    /** Largest file a vet can attach, in KB (matches the bucket limit in `supabase:buckets`). */
    public const MAX_FILE_KB = 10240;

    public const MAX_FILES_PER_RECORD = 20;

    public function __construct(private readonly SupabaseStorage $storage) {}

    /** "Select (Start Diagnosis)": an Upcoming record becomes Ongoing, owned by this vet. */
    public function start(Request $request, MedicalRecord $medicalRecord): RedirectResponse
    {
        MedicalRecord::query()
            ->whereKey($medicalRecord->id)
            ->where('status', MedicalRecord::STATUS_UPCOMING)
            ->update([
                'status' => MedicalRecord::STATUS_ONGOING,
                'veterinarian_id' => $request->user()->getAuthIdentifier(),
                'started_at' => now(),
                'updated_at' => now(),
            ]);

        return back();
    }

    public function update(UpdateMedicalRecordRequest $request, MedicalRecord $medicalRecord): RedirectResponse
    {
        $validated = $request->validated();
        $vetId = $request->user()->getAuthIdentifier();

        DB::transaction(function () use ($validated, $medicalRecord, $vetId): void {
            $record = MedicalRecord::query()->lockForUpdate()->findOrFail($medicalRecord->id);

            $this->syncServices($record, $validated['services'] ?? []);
            $this->syncSupplies($record, $validated['supplies'] ?? []);

            $completing = $validated['status'] === MedicalRecord::STATUS_COMPLETED;
            $record->fill(array_intersect_key($validated, array_flip(UpdateMedicalRecordRequest::TEXT_FIELDS)));
            $record->fill([
                'status' => $validated['status'],
                'veterinarian_id' => $record->veterinarian_id ?? $vetId,
                'started_at' => $record->started_at ?? now(),
                'completed_at' => $completing ? ($record->completed_at ?? now()) : null,
            ])->save();
        });

        return back()->with('success', $validated['status'] === MedicalRecord::STATUS_COMPLETED
            ? 'Medical record saved and marked as completed.'
            : 'Medical record saved.');
    }

    public function uploadFile(Request $request, MedicalRecord $medicalRecord): RedirectResponse
    {
        abort_unless($request->user()->role === Role::VETERINARIAN, 403);

        $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:'.self::MAX_FILE_KB],
        ], [
            'file.mimes' => 'Upload an image (JPG, PNG, WEBP) or a PDF.',
            'file.max' => 'Files can be up to 10 MB.',
        ]);

        if ($medicalRecord->files()->count() >= self::MAX_FILES_PER_RECORD) {
            throw ValidationException::withMessages([
                'file' => 'This record already has '.self::MAX_FILES_PER_RECORD.' files. Remove one before adding another.',
            ]);
        }

        $file = $request->file('file');
        $bucket = SupabaseStorage::medicalFilesBucket();

        try {
            $path = $this->storage->upload($file, $bucket, 'records/'.$medicalRecord->id);
        } catch (Throwable $exception) {
            Log::error('Medical file upload failed.', ['record' => $medicalRecord->id, 'exception' => $exception->getMessage()]);

            throw ValidationException::withMessages(['file' => 'The file could not be uploaded. Please try again.']);
        }

        try {
            $medicalRecord->files()->create([
                'path' => $path,
                'disk' => SupabaseStorage::DISK,
                'original_name' => mb_substr($file->getClientOriginalName(), 0, 255),
                'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                'size' => $file->getSize(),
                'uploaded_by' => $request->user()->getAuthIdentifier(),
            ]);
        } catch (Throwable $exception) {
            rescue(fn () => $this->storage->delete($bucket, $path), report: false);

            throw $exception;
        }

        return back()->with('success', 'File attached to the medical record.');
    }

    public function deleteFile(Request $request, MedicalRecord $medicalRecord, MedicalRecordFile $file): RedirectResponse
    {
        abort_unless($request->user()->role === Role::VETERINARIAN, 403);

        $file->delete();
        rescue(fn () => $this->storage->delete(SupabaseStorage::medicalFilesBucket(), $file->path), report: false);

        return back()->with('success', 'File removed from the medical record.');
    }

    /**
     * Serve an attached file after an authorization check: clinic staff who see medical
     * records, or the pet's own owner. The bucket is private, so we redirect to a short-lived signed URL.
     */
    public function showFile(Request $request, MedicalRecord $medicalRecord, MedicalRecordFile $file): Response
    {
        $user = $request->user();
        $ownsPet = (int) $medicalRecord->pet()->value('petOwnerID') === (int) $user->getAuthIdentifier();

        abort_unless(in_array($user->role, [Role::VETERINARIAN, Role::CLERK, Role::OWNER], true) || $ownsPet, 403);

        try {
            $url = $this->storage->signedUrl(SupabaseStorage::medicalFilesBucket(), $file->path, 300);
        } catch (Throwable $exception) {
            Log::error('Could not sign medical file URL.', ['file' => $file->id, 'exception' => $exception->getMessage()]);
            abort(502, 'The file is temporarily unavailable.');
        }

        return redirect()->away($url)->header('Cache-Control', 'no-store');
    }

    /** @param  list<int>  $serviceIds */
    private function syncServices(MedicalRecord $record, array $serviceIds): void
    {
        // Services already on the record keep the price they were charged at.
        $existing = $record->services()->get()->mapWithKeys(fn (Service $service) => [$service->id => $service->pivot->price]);
        $prices = Service::query()->whereIn('id', $serviceIds)->pluck('price', 'id');

        $record->services()->sync(collect($serviceIds)->mapWithKeys(fn (int $id) => [
            $id => ['price' => $existing[$id] ?? $prices[$id]],
        ])->all());
    }

    /**
     * Save the supplies used and move stock by the difference from what was saved before:
     * using more takes from stock, using fewer (or removing a supply) puts it back.
     *
     * @param  list<array{id: int, quantity: int}>  $supplies
     */
    private function syncSupplies(MedicalRecord $record, array $supplies): void
    {
        $before = $record->supplies()->get()->keyBy('id');
        $after = collect($supplies)->mapWithKeys(fn (array $row) => [(int) $row['id'] => (int) $row['quantity']]);
        $ids = $before->keys()->merge($after->keys())->unique()->values();

        // Lock the stock rows so two vets saving at once can't both take the last item.
        $stock = MedicalSupply::query()->whereIn('id', $ids)->lockForUpdate()->get()->keyBy('id');
        $errors = [];

        foreach ($ids as $id) {
            $used = $after[$id] ?? 0;
            $delta = $used - ($before->get($id)?->pivot->quantity ?? 0);
            $supply = $stock[$id];

            if ($delta > 0 && $supply->stock_quantity < $delta) {
                $index = $after->keys()->search($id);
                $errors["supplies.{$index}.quantity"] = "Only {$supply->stock_quantity} {$supply->unit_of_measure} of {$supply->name} left in stock.";

                continue;
            }

            if ($delta !== 0) {
                $supply->decrement('stock_quantity', $delta);
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }

        $record->supplies()->sync($after->mapWithKeys(fn (int $quantity, int $id) => [
            $id => [
                'quantity' => $quantity,
                // Supplies already on the record keep the price they were recorded at.
                'unit_price' => $before->get($id)?->pivot->unit_price ?? $stock[$id]->unit_price,
            ],
        ])->all());
    }
}
