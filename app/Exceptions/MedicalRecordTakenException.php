<?php

namespace App\Exceptions;

use App\Models\MedicalRecord;
use Symfony\Component\HttpKernel\Exception\HttpException;

/** Thrown when a vet tries to work on a medical record that another vet selected. */
class MedicalRecordTakenException extends HttpException
{
    public function __construct(MedicalRecord $record)
    {
        $name = $record->veterinarian()->value('name');

        parent::__construct(403, $name
            ? "This medical record was selected by Dr. {$name}. Only they can work on it."
            : 'This medical record was selected by another veterinarian. Only they can work on it.');
    }
}
