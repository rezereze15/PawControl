<?php

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

/** Thrown on any attempt to change a Completed (locked) medical record or its files. */
class MedicalRecordLockedException extends HttpException
{
    public function __construct()
    {
        parent::__construct(403, 'This medical record is completed and locked. It can only be viewed.');
    }
}
