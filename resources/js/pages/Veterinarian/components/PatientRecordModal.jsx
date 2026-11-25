import { useEffect, useState } from "react";
import { formatPetAge } from "../../shared/dashboard/petAge";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import { LockIcon, RecordStatusBadge, currentRecord, isLocked, isTakenByOtherVet, nextVisit, selectLabel } from "../../shared/dashboard/recordStatus";

export function formatDate(iso, options = { month: "long", day: "numeric", year: "numeric" }) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatTime(iso) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

export function formatBytes(bytes) {
    if (!bytes) return "";
    return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** The 4 steps of a medical record, in order. */
const STEPS = ["Upcoming", "Selected", "Ongoing", "Completed"];

/** Pet owners see plain words instead of the clinic's internal statuses. */
const OWNER_STATUS_LABELS = { Upcoming: "Upcoming visit", Selected: "Upcoming visit", Ongoing: "In progress", Completed: "Completed" };

/** Timeline dot colour for each status. */
const DOT_COLORS = { Upcoming: "bg-amber-400", Selected: "bg-sky-500", Ongoing: "bg-emerald-500", Completed: "bg-violet-500" };

const sectionLabel = "text-[11px] font-bold uppercase tracking-wider text-[#5b5570]";

function Svg({ className = "h-4 w-4", children }) {
    return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>);
}

const StethoscopeIcon = ({ className }) => (<Svg className={className}><path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v3a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/></Svg>);

/** Attached images / documents as tiles. Links go through the app's authorized file route. */
export function RecordFiles({ files = [], onRemove, removingId }) {
    if (files.length === 0) return null;
    return (<ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {files.map((file) => (<li key={file.id} className="flex items-center gap-3 rounded-xl border border-[#ebe8f2] bg-white px-3 py-2.5">
          <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${file.isImage ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"}`}>
            {file.isImage
                ? <Svg><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></Svg>
                : <Svg><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></Svg>}
          </span>
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 hover:underline">
            <span className="block truncate text-[13px] font-semibold text-[#1a0a3c]">{file.name}</span>
            <span className="text-xs text-[#5b5570]">{formatBytes(file.size)}</span>
          </a>
          {onRemove && (<button type="button" onClick={() => onRemove(file)} disabled={removingId === file.id} aria-label={`Remove ${file.name}`} className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
              <Svg><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></Svg>
            </button>)}
        </li>))}
    </ul>);
}

/** The record's 4 steps: earlier ones ticked, the current one ringed. */
function RecordProgress({ status }) {
    const at = STEPS.indexOf(status);
    return (<ol aria-label="Record progress" className="grid grid-cols-4">
      {STEPS.map((step, i) => (<li key={step} aria-current={i === at ? "step" : undefined} className="flex flex-col gap-1.5">
          <div className="flex items-center">
            <span className={`flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${i < at ? "border-paw-blue bg-paw-blue text-white" : i === at ? "border-paw-blue bg-white text-paw-blue ring-4 ring-paw-blue-soft" : "border-[#d6d1e3] bg-white text-[#5b5570]"}`}>
              {i < at ? <Svg className="h-3.5 w-3.5"><path d="m5 12 5 5 9-10"/></Svg> : i + 1}
            </span>
            {i < STEPS.length - 1 && <span className={`mx-2 h-0.5 flex-1 ${i < at ? "bg-paw-blue" : "bg-[#e2deec]"}`}/>}
          </div>
          <span className={`text-xs ${i === at ? "font-bold text-paw-blue" : "text-[#3f3a52]"}`}>{step}</span>
        </li>))}
    </ol>);
}

function Finding({ title, tag, children }) {
    return (<div className="flex flex-col gap-1">
      <span className={`flex items-center gap-1.5 ${sectionLabel}`}>{title}{tag}</span>
      <p className="whitespace-pre-line text-sm leading-relaxed text-[#2e2944]">{children}</p>
    </div>);
}

function Chips({ title, items, tone = "plain" }) {
    if (items.length === 0) return null;
    return (<div className="flex flex-col gap-1.5">
      <span className={sectionLabel}>{title}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => <span key={item} className={`rounded-lg px-2.5 py-1 text-[13px] ${tone === "brand" ? "bg-paw-blue-soft text-paw-blue" : "border border-[#ebe8f2] bg-[#f6f4fb] text-[#3f3a52]"}`}>{item}</span>)}
      </div>
    </div>);
}

/**
 * What a vet can do with a record, as one clear line and (when allowed) one button:
 * nothing for Completed records, view-only for another vet's.
 */
function vetAction(visit, currentVetId) {
    if (isLocked(visit.recordStatus)) return null;
    if (isTakenByOtherVet(visit, currentVetId)) return { note: `Dr. ${visit.veterinarian}'s record. Only they can work on it.`, button: false };
    return {
        Upcoming: { note: "Not assigned yet. Selecting it makes it yours.", button: true },
        Selected: { note: "Selected by you. It's waiting in My Selected Records.", button: true },
        Ongoing: { note: "Diagnosis in progress. Your saved findings show here.", button: true },
    }[visit.recordStatus] ?? null;
}

/** Message shown when a record has no findings yet. */
function emptyMessage(status, forPetOwner) {
    if (status === "Completed") return "No findings were recorded for this visit.";
    if (forPetOwner) return "The vet's findings and home-care advice will appear here after the visit.";
    if (status === "Ongoing") return "Diagnosis in progress. Saved findings will show here.";
    return "No findings yet. They appear here once the diagnosis is saved.";
}

/**
 * Which records start open: the one being viewed (or the one in progress), and for
 * pet owners also their latest completed visit, where the vet's advice is.
 */
function initiallyOpen(visits, focusId, forPetOwner) {
    const open = new Set();
    const first = visits.find((v) => v.id === focusId) ?? currentRecord(visits) ?? visits[0];
    if (first) open.add(first.id);
    if (forPetOwner) {
        const lastDone = visits.find((v) => v.recordStatus === "Completed");
        if (lastDone) open.add(lastDone.id);
    }
    return open;
}

/** One visit on the timeline: a one-line summary when folded, every finding when open. */
function RecordCard({ visit, open, onToggle, highlighted, isLast, forPetOwner, showStatus, onSelect, selectingId, currentVetId }) {
    const staff = !forPetOwner;
    const detailsId = `record-${visit.id}-details`;
    const services = (visit.services ?? []).map((s) => s.name);
    const supplies = (visit.supplies ?? []).map((s) => `${s.name} × ${s.quantity}${s.unit ? ` ${s.unit}` : ""}`);
    const files = visit.files ?? [];
    const vetNotes = staff ? visit.vetNotes : null;
    const hasFindings = Boolean(visit.diagnosis || visit.treatment || visit.suggestions || visit.labResults || vetNotes) || services.length > 0 || supplies.length > 0 || files.length > 0;
    const summary = [visit.diagnosis || visit.notes, visit.veterinarian && `Dr. ${visit.veterinarian}`].filter(Boolean).join(" · ");
    const action = showStatus && onSelect ? vetAction(visit, currentVetId) : null;
    const completed = isLocked(visit.recordStatus);
    const concernLabel = visit.isEmergency ? "Symptoms" : forPetOwner ? "Your concern" : "Owner's concern";
    const vetLine = visit.veterinarian
        ? `${forPetOwner ? (completed ? "Seen by" : "Your vet:") : "Handled by"} Dr. ${visit.veterinarian}`
        : staff ? "Not assigned yet" : null;

    return (<li className="grid grid-cols-[44px_14px_minmax(0,1fr)] gap-x-2 sm:grid-cols-[56px_16px_minmax(0,1fr)] sm:gap-x-3">
      <div className="pt-4 text-right">
        <p className="text-xs font-bold uppercase tracking-wider text-[#5b5570]">{formatDate(visit.startsAt, { month: "short" })}</p>
        <p className="text-2xl font-bold leading-tight text-[#1a0a3c]">{formatDate(visit.startsAt, { day: "2-digit" })}</p>
        <p className="text-xs text-[#5b5570]">{formatDate(visit.startsAt, { year: "numeric" })}</p>
      </div>

      <div className="relative flex justify-center" aria-hidden="true">
        <span className={`absolute top-0 w-0.5 bg-[#e6e2f0] ${isLast ? "h-6" : "-bottom-3.5"}`}/>
        <span className={`relative mt-5 h-3.5 w-3.5 rounded-full ring-4 ring-[#fcfbfe] ${showStatus ? DOT_COLORS[visit.recordStatus] ?? "bg-gray-300" : "bg-gray-300"}`}/>
      </div>

      <article className={`flex min-w-0 flex-col gap-3.5 rounded-2xl border bg-white px-4 py-4 sm:px-5 ${highlighted ? "border-[#d9d2ef] shadow-[0_4px_14px_rgba(25,4,63,0.06)]" : "border-[#ebe8f2]"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-bold text-[#1a0a3c]">{visit.type}</h4>
              {showStatus && <RecordStatusBadge status={visit.recordStatus} label={forPetOwner ? OWNER_STATUS_LABELS[visit.recordStatus] : undefined}/>}
              {visit.isEmergency && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">Emergency</span>}
            </div>
            <p className="text-[13px] text-[#5b5570]">{formatTime(visit.startsAt)}{staff && visit.recordNumber ? ` · ${visit.recordNumber}` : ""}</p>
            {!open && summary && <p className="truncate text-[13px] text-[#3f3a52]">{summary}</p>}
          </div>
          <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={detailsId} className="inline-flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded-lg border border-[#e2deec] bg-white px-3 text-[13px] font-semibold text-paw-blue transition hover:bg-paw-blue-soft">
            {open ? "Hide details" : "Show details"}
            <Svg className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></Svg>
          </button>
        </div>

        {open && (<div id={detailsId} className="flex flex-col gap-3.5 border-t border-[#f0eef5] pt-3.5">
            {vetLine && (<p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#3b0f8c]">
                <StethoscopeIcon className="h-4 w-4"/>{vetLine}
              </p>)}

            {staff && showStatus && !completed && <RecordProgress status={visit.recordStatus}/>}

            {visit.notes && (<div className={`flex flex-col gap-1 rounded-xl px-3.5 py-3 ${visit.isEmergency ? "bg-red-50" : "bg-[#f6f3ff]"}`}>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${visit.isEmergency ? "text-red-700" : "text-[#5b4b8a]"}`}>{concernLabel}</span>
                <p className={`text-sm leading-relaxed ${visit.isEmergency ? "text-red-900" : "text-[#2e2944]"}`}>{visit.notes}</p>
              </div>)}

            {!hasFindings && <p className="rounded-xl border-[1.5px] border-dashed border-[#d6d1e3] px-4 py-3.5 text-center text-[13px] text-[#5b5570]">{emptyMessage(visit.recordStatus, forPetOwner)}</p>}

            {visit.diagnosis && (<div className="flex flex-col gap-1 rounded-xl bg-[#f6f4fb] px-3.5 py-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5b4b8a]">Diagnosis</span>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#2e2944]">{visit.diagnosis}</p>
              </div>)}

            {forPetOwner && visit.suggestions && (<div className="flex items-start gap-3 rounded-xl bg-emerald-50 px-3.5 py-3">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-emerald-700">
                  <Svg><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></Svg>
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Home care</span>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-emerald-950">{visit.suggestions}</p>
                </div>
              </div>)}

            {(visit.treatment || visit.labResults || (staff && visit.suggestions) || vetNotes) && (<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {visit.treatment && <Finding title="Treatment">{visit.treatment}</Finding>}
                {staff && visit.suggestions && <Finding title="Home care">{visit.suggestions}</Finding>}
                {visit.labResults && <Finding title="Lab results">{visit.labResults}</Finding>}
                {vetNotes && <Finding title="Vet notes" tag={<span className="rounded-full bg-amber-50 px-2 py-px text-[11px] font-semibold normal-case tracking-normal text-amber-800">Clinic only</span>}>{vetNotes}</Finding>}
              </div>)}

            {(services.length > 0 || supplies.length > 0) && (<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Chips title={forPetOwner ? "Services" : "Services given"} items={services} tone="brand"/>
                <Chips title={forPetOwner ? "Medicines & supplies" : "Supplies used"} items={supplies}/>
              </div>)}

            {files.length > 0 && (<div className="flex flex-col gap-1.5">
                <span className={sectionLabel}>{forPetOwner ? "Files from the clinic" : "Files"}</span>
                <RecordFiles files={files}/>
              </div>)}

            {visit.recordNumber && (<p className="flex flex-wrap items-center gap-1.5 text-xs text-[#5b5570]">
                {staff && completed && <LockIcon className="h-3 w-3"/>}
                {forPetOwner
                    ? `Record ${visit.recordNumber}`
                    : [
                        visit.recordNumber,
                        visit.completedAt && `Completed ${formatDate(visit.completedAt, { month: "short", day: "numeric", year: "numeric" })}, ${formatTime(visit.completedAt)}`,
                        visit.createdBy && `Accepted by ${visit.createdBy}`,
                        completed && "View only",
                    ].filter(Boolean).join(" · ")}
              </p>)}

            {action && (<div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0eef5] pt-3.5">
                <p className="flex items-center gap-1.5 text-[13px] text-[#3f3a52]">
                  {!action.button && <LockIcon className="h-3.5 w-3.5"/>}
                  {action.note}
                </p>
                {action.button && (<button type="button" onClick={() => onSelect(visit)} disabled={selectingId === visit.id} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-paw-blue px-5 text-sm font-bold text-white transition hover:bg-paw-blue-dark disabled:opacity-60">
                    {selectingId === visit.id ? "Opening…" : selectLabel(visit.recordStatus)}
                    <Svg><path d="M5 12h14M13 6l6 6-6 6"/></Svg>
                  </button>)}
              </div>)}
          </div>)}
      </article>
    </li>);
}

/**
 * Pet medical record popup, used by vets, clerks, the clinic owner and pet owners:
 * a pet profile on top, then every visit as a timeline card (newest first).
 *  - `appointment`: the record being viewed; it starts open and highlighted.
 *  - `onSelect` (vets only): each open, unfinished record gets one action button
 *    (Select → Start Diagnosis → Continue Diagnosis); another vet's record is view-only
 *    (`currentVetId` tells whose it is) and Completed records are locked.
 *  - `forPetOwner`: plain wording, the owner's next visit instead of their own contact
 *    details, home care highlighted (the server never sends vet notes to pet owners).
 *  - `showStatus={false}` hides every status, progress step and action (the vet's
 *    view-only Appointments module).
 */
export default function PatientRecordModal({ patient, appointment, onClose, onSelect, selectingId, currentVetId, forPetOwner = false, showStatus = true }) {
    const visits = patient.visits ?? [];
    const [open, setOpen] = useState(() => initiallyOpen(visits, appointment?.id, forPetOwner));
    const highlightedId = appointment?.id ?? currentRecord(visits)?.id;

    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const toggle = (id) => setOpen((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });

    const details = [patient.species, patient.breed, patient.sex, formatPetAge(patient), patient.weight != null ? `${Number(patient.weight)} kg` : null].filter(Boolean);
    const upcoming = nextVisit(visits);

    return (<div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
      <section role="dialog" aria-modal="true" aria-labelledby="patient-record-title" className="paw-pet-modal paw-clerk-review-modal">
        <header className="paw-pet-modal-header" style={{ alignItems: "flex-start" }}>
          <div className="flex min-w-0 items-center gap-4">
            <PetAvatar name={patient.name} photo={patient.photo} size="lg"/>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 id="patient-record-title" className="truncate text-2xl font-bold text-[#1a0a3c]">{patient.name}</h2>
                {!forPetOwner && <span className="rounded-full bg-[#f6f4fb] px-2.5 py-0.5 text-xs font-semibold text-[#5b5570]">ID-{String(patient.id).padStart(4, "0")}</span>}
              </div>
              {details.length > 0 && (<div className="flex flex-wrap gap-1.5">
                  {details.map((detail) => <span key={detail} className="rounded-full border border-[#ebe8f2] bg-[#f6f4fb] px-2.5 py-1 text-xs font-semibold text-[#3f3a52]">{detail}</span>)}
                </div>)}
              {forPetOwner
                ? upcoming && (<span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 px-3 py-1 text-[13px] font-semibold text-amber-800">
                      <Svg className="h-4 w-4"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Svg>
                      Next visit: {formatDate(upcoming.startsAt, { weekday: "short", month: "short", day: "numeric" })} at {formatTime(upcoming.startsAt)}
                    </span>)
                : (<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#4b4563]">
                    <span className="inline-flex items-center gap-1.5">
                      <Svg><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></Svg>
                      {patient.owner?.name ?? "Unknown owner"}
                      {patient.isWalkIn && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Walk-in · no account</span>}
                    </span>
                    {patient.owner?.phone && (<span className="inline-flex items-center gap-1.5">
                        <Svg><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></Svg>
                        {patient.owner.phone}
                      </span>)}
                    {patient.owner?.email && (<span className="inline-flex min-w-0 items-center gap-1.5">
                        <Svg><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Svg>
                        <span className="truncate">{patient.owner.email}</span>
                      </span>)}
                  </div>)}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close pet record" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <Svg className="h-5 w-5"><path d="m6 6 12 12M18 6 6 18"/></Svg>
          </button>
        </header>

        <div className="paw-pet-modal-body flex flex-col gap-4 bg-[#fcfbfe]">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-base font-bold text-[#1a0a3c]">{forPetOwner ? `${patient.name}'s visits` : "Medical records"}</h3>
            {visits.length > 0 && <span className="text-[13px] text-[#5b5570]">{visits.length} {visits.length === 1 ? "record" : "records"} · newest first</span>}
          </div>
          {visits.length === 0
            ? <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-[#5b5570]">No medical records yet.</p>
            : (<ol className="flex flex-col gap-3.5">
                {visits.map((visit, index) => (<RecordCard key={visit.id} visit={visit} open={open.has(visit.id)} onToggle={() => toggle(visit.id)} highlighted={visit.id === highlightedId} isLast={index === visits.length - 1} forPetOwner={forPetOwner} showStatus={showStatus} onSelect={onSelect} selectingId={selectingId} currentVetId={currentVetId}/>))}
              </ol>)}
        </div>

        <footer className="paw-pet-modal-footer">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-paw-blue px-6 text-sm font-semibold text-paw-blue hover:bg-paw-blue-soft">Close</button>
        </footer>
      </section>
    </div>);
}
