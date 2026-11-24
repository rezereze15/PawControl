<?php

namespace App\Models;

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
