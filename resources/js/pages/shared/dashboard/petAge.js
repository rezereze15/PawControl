/**
 * Human-friendly pet age: months while the pet is under a year, years after that.
 *   "7 months old", "1 month old", "Less than a month old", "3 years old"
 *
 * Uses `dateOfBirth` (YYYY-MM-DD) when available. Without it, falls back to the
 * stored whole-year `age`; a stored 0 can't be turned into months, so it reads
 * "Under a year old". Returns null when nothing is known.
 *
 * Pass `{ suffix: false }` to drop the trailing " old" (e.g. "7 months").
 */
export function formatPetAge({ dateOfBirth, age } = {}, { suffix = true, now = new Date() } = {}) {
    const old = suffix ? ' old' : '';
    const months = monthsSince(dateOfBirth, now);

    if (months != null) {
        if (months < 1) return `Less than a month${old}`;
        if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}${old}`;
        const years = Math.floor(months / 12);
        return `${years} ${years === 1 ? 'year' : 'years'}${old}`;
    }

    if (age == null || age === '') return null;
    const years = Number(age);
    if (!Number.isFinite(years)) return null;
    if (years < 1) return `Under a year${old}`;
    return `${years} ${years === 1 ? 'year' : 'years'}${old}`;
}

/** Whole months between a YYYY-MM-DD birth date and `now` (null if missing/invalid/in the future). */
function monthsSince(dateOfBirth, now) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateOfBirth ?? '');
    if (!match) return null;
    const [, y, m, d] = match.map(Number);
    let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
    if (now.getDate() < d) months -= 1; // birthday day-of-month not reached yet this month
    return months < 0 ? null : months;
}
