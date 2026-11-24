/**
 * Medical record status, shared by the veterinarian, clerk and clinic owner screens:
 * Upcoming (accepted, not started) → Ongoing (vet pressed "Select") → Completed.
 */
export const RECORD_STATUS_STYLES = {
    Upcoming: "border-amber-300 bg-amber-50 text-amber-700",
    Ongoing: "border-emerald-400 bg-emerald-50 text-emerald-700",
    Completed: "border-violet-400 bg-violet-100 text-violet-800",
};

export function RecordStatusBadge({ status, className = "" }) {
    if (!status) return null;
    return (<span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${RECORD_STATUS_STYLES[status] ?? "border-gray-300 bg-gray-50 text-gray-500"} ${className}`}>
      {status === "Ongoing" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" aria-hidden="true"/>}
      {status}
    </span>);
}

/** Label of the vet's button for a record in this status. */
export function selectLabel(status) {
    if (status === "Upcoming") return "Select (Start Diagnosis)";
    if (status === "Ongoing") return "Continue Diagnosis";
    return "Edit Record";
}

/**
 * The record "Select" opens for a pet: the one in progress, else the earliest
 * not-yet-started one, else the most recent. `visits` are newest first.
 */
export function currentRecord(visits = []) {
    return visits.find((v) => v.recordStatus === "Ongoing")
        ?? [...visits].reverse().find((v) => v.recordStatus === "Upcoming")
        ?? visits[0]
        ?? null;
}
