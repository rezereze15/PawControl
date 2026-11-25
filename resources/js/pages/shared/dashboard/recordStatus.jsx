/**
 * Medical record status, shared by the veterinarian, clerk and clinic owner screens:
 * Upcoming (accepted) → Selected (vet viewed it and confirmed "Select")
 * → Ongoing (vet pressed "Start Diagnosis") → Completed (locked, view only).
 */

/** Display order for the status filter and the default sort of Pet Medical Records. */
export const RECORD_STATUSES = ["Selected", "Upcoming", "Ongoing", "Completed"];

/** Position of a status in RECORD_STATUSES; anything else (e.g. "No Visits") sorts last. */
export function statusRank(status) {
    const index = RECORD_STATUSES.indexOf(status);
    return index === -1 ? RECORD_STATUSES.length : index;
}

export const RECORD_STATUS_STYLES = {
    Upcoming: "border-amber-300 bg-amber-50 text-amber-700",
    Selected: "border-sky-400 bg-sky-50 text-sky-700",
    Ongoing: "border-emerald-400 bg-emerald-50 text-emerald-700",
    Completed: "border-violet-400 bg-violet-100 text-violet-800",
};

/** Status pill. `label` replaces the text (e.g. plain words for pet owners); the colour still follows `status`. */
export function RecordStatusBadge({ status, label, className = "" }) {
    if (!status) return null;
    return (<span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${RECORD_STATUS_STYLES[status] ?? "border-gray-300 bg-gray-50 text-gray-500"} ${className}`}>
      {status === "Ongoing" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true"/>}
      {status === "Completed" && <LockIcon className="h-3 w-3"/>}
      {label ?? status}
    </span>);
}

export function LockIcon({ className = "h-3.5 w-3.5" }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round"/>
    </svg>);
}

/** Completed records are locked: viewable only, no edit / select / diagnosis controls. */
export const isLocked = (status) => status === "Completed";

/** Another vet selected this record: only they can work on it, so this vet can only view it. */
export const isTakenByOtherVet = (record, vetId) => record?.veterinarianId != null && record.veterinarianId !== vetId;

/** Label of the vet's button for a record in this status, or null when there is none (locked). */
export function selectLabel(status) {
    if (status === "Upcoming") return "Select";
    if (status === "Selected") return "Start Diagnosis";
    if (status === "Ongoing") return "Continue Diagnosis";
    return null;
}

/**
 * The record a pet's action button works on: the one in progress, else one already
 * selected, else the earliest not-yet-started one. Null when every record is Completed
 * (locked). `visits` are newest first.
 */
export function currentRecord(visits = []) {
    return visits.find((v) => v.recordStatus === "Ongoing")
        ?? [...visits].reverse().find((v) => v.recordStatus === "Selected")
        ?? [...visits].reverse().find((v) => v.recordStatus === "Upcoming")
        ?? null;
}

/** The pet's next booked visit: the soonest one not completed and not yet past. `visits` newest first. */
export function nextVisit(visits = [], now = Date.now()) {
    return [...visits].reverse().find((v) => !isLocked(v.recordStatus) && new Date(v.startsAt).getTime() >= now) ?? null;
}

/** The pet's most recent visit that already happened (completed, or its time has passed). */
export function lastVisit(visits = [], now = Date.now()) {
    return visits.find((v) => isLocked(v.recordStatus) || new Date(v.startsAt).getTime() < now) ?? null;
}
