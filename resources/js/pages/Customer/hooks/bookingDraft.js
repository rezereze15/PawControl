/**
 * Keeps the "Book appointment" wizard's place (open, step, typed fields) for this
 * browser tab, so a full page reload doesn't drop the customer back on Home.
 *
 * Why: Inertia reloads the whole page when the app's assets change between requests
 * (a new build/deploy → 409 → full reload), which wipes React state. Adding a pet from
 * the wizard is often the request that hits this. sessionStorage survives the reload.
 *
 * The proof-of-payment file can't be stored, so a restored wizard resumes at most at
 * the payment step. Drafts are per user and expire after an hour.
 */
const MAX_AGE_MS = 60 * 60 * 1000;
const key = (userId) => `pawcontrol.bookingDraft.${userId ?? 'unknown'}`;

export function readBookingDraft(userId) {
    try {
        const draft = JSON.parse(window.sessionStorage.getItem(key(userId)) ?? 'null');
        if (!draft || Date.now() - (draft.savedAt ?? 0) > MAX_AGE_MS) return null;
        return draft;
    } catch {
        return null;
    }
}

export function writeBookingDraft(userId, draft) {
    try {
        window.sessionStorage.setItem(key(userId), JSON.stringify({ ...draft, savedAt: Date.now() }));
    } catch {
        // Storage unavailable (private mode, quota): the wizard still works, just without restore.
    }
}

export function clearBookingDraft(userId) {
    try {
        window.sessionStorage.removeItem(key(userId));
    } catch {
        // ignore
    }
}
