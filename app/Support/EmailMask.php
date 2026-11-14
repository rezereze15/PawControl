<?php

namespace App\Support;

final class EmailMask
{
    /** jane@gmail.com → j***@gmail.com */
    public static function mask(string $email): string
    {
        [$local, $domain] = explode('@', $email, 2) + [1 => ''];

        return mb_substr($local, 0, 1).'***@'.$domain;
    }
}
