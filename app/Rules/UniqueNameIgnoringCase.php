<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Eloquent\Model;

/**
 * Like Rule::unique on the `name` column, but "icu" counts as a duplicate of "ICU".
 * Postgres compares text case-sensitively, so both sides are lower-cased before comparing.
 *
 * Usage: new UniqueNameIgnoringCase(Service::class, $ignoreId, 'A service with this name already exists.')
 */
class UniqueNameIgnoringCase implements ValidationRule
{
    /**
     * @param  class-string<Model>  $model  The table to check, e.g. Service::class.
     * @param  int|null  $ignoreId  When editing, the row's own id (its current name is not a duplicate).
     */
    public function __construct(
        private string $model,
        private ?int $ignoreId,
        private string $message,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $taken = $this->model::query()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($value)])
            ->when($this->ignoreId, fn ($query) => $query->whereKeyNot($this->ignoreId))
            ->exists();

        if ($taken) {
            $fail($this->message);
        }
    }
}
