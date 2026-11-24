<?php

namespace App\Models;

use App\Exceptions\MedicalRecordLockedException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A medical image or document (X-ray, lab report, ...) attached to a medical record.
 * Stored in a private Supabase bucket; served only through MedicalRecordController::showFile.
 *
 * @property int $id
 * @property int $medical_record_id
 * @property string $path
 * @property string $disk
 * @property string $original_name
 * @property string $mime_type
 * @property int $size bytes
 * @property int|null $uploaded_by
 */
class MedicalRecordFile extends Model
{
    protected $fillable = [
        'medical_record_id',
        'path',
        'disk',
        'original_name',
        'mime_type',
        'size',
        'uploaded_by',
    ];

    /** Files of a Completed (locked) medical record can't be added or removed. */
    protected static function booted(): void
    {
        $guard = function (self $file): void {
            if (MedicalRecord::query()->whereKey($file->medical_record_id)->value('status') === MedicalRecord::STATUS_COMPLETED) {
                throw new MedicalRecordLockedException;
            }
        };

        static::creating($guard);
        static::deleting($guard);
    }

    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /** URL of the authorized route that serves this file. */
    public function url(): string
    {
        return route('medical-records.files.show', ['medicalRecord' => $this->medical_record_id, 'file' => $this->id]);
    }
}
