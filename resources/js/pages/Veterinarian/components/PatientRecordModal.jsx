import { formatPetAge } from "../../shared/dashboard/petAge";
import { useEffect } from "react";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import { LockIcon, RecordStatusBadge, isLocked, isTakenByOtherVet, selectLabel } from "../../shared/dashboard/recordStatus";

export function formatDate(iso, options = { month: "long", day: "numeric", year: "numeric" }) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatTime(iso) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export function formatBytes(bytes) {
    if (!bytes) return "";
    return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Attached images / documents. Links go through the app's authorized file route. */
export function RecordFiles({ files = [], onRemove, removingId }) {
    if (files.length === 0) return null;
    return (<ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {files.map((file) => (<li key={file.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2">
          <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${file.isImage ? "bg-sky-50 text-sky-600" : "bg-violet-50 text-violet-700"}`} aria-hidden="true">
            {file.isImage
                ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21" strokeLinejoin="round"/></svg>
                : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5" /></svg>}
          </span>
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 text-xs hover:underline">
            <span className="block truncate font-semibold text-[#1a0a3c]">{file.name}</span>
            <span className="text-gray-400">{formatBytes(file.size)}</span>
          </a>
          {onRemove && (<button type="button" onClick={() => onRemove(file)} disabled={removingId === file.id} aria-label={`Remove ${file.name}`} className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>)}
        </li>))}
    </ul>);
}

/** Clinical findings, services, supplies and files of one medical record. */
function RecordFindings({ visit }) {
    const findings = [
        ["Diagnosis", visit.diagnosis],
        ["Treatment", visit.treatment],
        ["Clinical suggestions", visit.suggestions],
        ["Lab results", visit.labResults],
        ["Vet notes", visit.vetNotes],
    ].filter(([, value]) => value);
    const services = visit.services ?? [];
    const supplies = visit.supplies ?? [];
    const files = visit.files ?? [];
    const empty = findings.length === 0 && services.length === 0 && supplies.length === 0 && files.length === 0;

    return (<div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
      {empty && <p className="text-gray-400">No findings recorded yet.</p>}
      {findings.map(([label, value]) => <p key={label} className="whitespace-pre-line"><span className="font-semibold text-[#1a0a3c]">{label}:</span> {value}</p>)}
      {services.length > 0 && (<p className="mt-1"><span className="font-semibold text-[#1a0a3c]">Services given:</span> {services.map((s) => `${s.name} (${peso.format(Number(s.price))})`).join(", ")}</p>)}
      {supplies.length > 0 && (<p className="mt-1"><span className="font-semibold text-[#1a0a3c]">Supplies used:</span> {supplies.map((s) => `${s.name} × ${s.quantity}${s.unit ? ` ${s.unit}` : ""}`).join(", ")}</p>)}
      <RecordFiles files={files}/>
      <p className="mt-1 text-[11px] text-gray-400">
        {visit.recordNumber}
        {visit.createdBy ? ` · created by ${visit.createdBy}` : ""}
        {visit.completedAt ? ` · completed ${formatDate(visit.completedAt, { month: "short", day: "numeric", year: "numeric" })}` : ""}
      </p>
    </div>);
}

function Field({ label, value }) {
    return (<div className="min-w-0">
      <dt className="text-xs font-bold text-[#1a0a3c]">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-gray-700">{value || <span className="text-gray-300">Not recorded</span>}</dd>
    </div>);
}

/**
 * Pet medical record: animal signalment, owner contact, the appointment being viewed
 * (if any) and every medical record. Read-only unless `onSelect` is given (veterinarians),
 * which adds an action button per record: Select → Start Diagnosis → Continue Diagnosis.
 * Completed records are locked, and records another vet selected are theirs: both show
 * no action (`currentVetId` tells whose they are). `showStatus={false}` hides
 * every status badge (used by the veterinarian's read-only Appointments module).
 */
export default function PatientRecordModal({ patient, appointment, onClose, onSelect, selectingId, currentVetId, showStatus = true }) {
    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const age = formatPetAge(patient, { suffix: false });
    const now = Date.now();

    return (<div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
      <section role="dialog" aria-modal="true" aria-labelledby="patient-record-title" className="paw-pet-modal paw-clerk-review-modal">
        <header className="paw-pet-modal-header">
          <div className="flex min-w-0 items-center gap-3">
            <PetAvatar name={patient.name} photo={patient.photo} size="md"/>
            <div className="min-w-0">
              <h2 id="patient-record-title" className="truncate text-xl font-extrabold text-[#1a0a3c]">{patient.name}</h2>
              <p className="text-xs text-gray-500">ID-{String(patient.id).padStart(4, "0")}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close pet record" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
          </button>
        </header>

        <div className="paw-pet-modal-body flex flex-col gap-5">
          {appointment && (<div className={`flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl px-5 py-4 text-sm ${appointment.isEmergency ? "bg-red-50 text-red-800" : "bg-violet-50 text-[#3b0f8c]"}`}>
              {appointment.isEmergency && <span className="w-full text-xs font-extrabold uppercase tracking-wide text-red-600">Emergency walk-in</span>}
              <span className="flex items-center gap-2 font-bold">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>
                {formatDate(appointment.startsAt)} at {formatTime(appointment.startsAt)}
              </span>
              <span><span className="text-violet-400">Service:</span> <strong>{appointment.type}</strong></span>
              {showStatus && <RecordStatusBadge status={appointment.recordStatus}/>}
              {appointment.notes && <span className="w-full text-gray-700"><span className={`font-semibold ${appointment.isEmergency ? "text-red-500" : "text-violet-400"}`}>{appointment.isEmergency ? "Symptoms:" : "Owner's concern:"}</span> {appointment.notes}</span>}
            </div>)}

          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="mb-4 text-base font-extrabold text-[#1a0a3c]">Animal Signalment</h3>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Patient/Pet Name" value={patient.name}/>
              <Field label="Species" value={patient.species}/>
              <Field label="Breed" value={patient.breed}/>
              <Field label="Sex" value={patient.sex}/>
              <Field label="Date of Birth" value={patient.dateOfBirth ? formatDate(patient.dateOfBirth) : null}/>
              <Field label="Age" value={age}/>
              <Field label="Weight" value={patient.weight != null ? `${Number(patient.weight)} kg` : null}/>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="mb-3 flex flex-wrap items-center gap-2 text-base font-extrabold text-[#1a0a3c]">
              Owner
              {patient.isWalkIn && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Walk-in · no account</span>}
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Name" value={patient.owner?.name}/>
              <Field label="Email" value={patient.owner?.email}/>
              <Field label="Contact Number" value={patient.owner?.phone}/>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="mb-3 text-base font-extrabold text-[#1a0a3c]">{patient.visits.some((v) => v.recordNumber) ? "Medical Records" : "Visit History"}</h3>
            {patient.visits.length === 0 ? <p className="text-sm text-gray-400">No confirmed visits yet.</p> : (<ul className="divide-y divide-gray-100">
                {patient.visits.map((visit) => {
                const upcoming = new Date(visit.startsAt).getTime() >= now;
                return (<li key={visit.id} className={`flex flex-wrap items-start justify-between gap-2 py-3 ${appointment?.id === visit.id ? "rounded-lg bg-violet-50/60 px-2" : ""}`}>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-semibold text-[#1a0a3c]">
                          {visit.type}
                          {visit.isEmergency && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Emergency</span>}
                        </p>
                        {visit.notes && <p className="text-xs text-gray-500">{visit.notes}</p>}
                        {visit.veterinarian && <p className="text-xs font-semibold text-[#3b0f8c]">Handled by Dr. {visit.veterinarian}</p>}
                        {visit.recordNumber && <RecordFindings visit={visit}/>}
                      </div>
                      <div className="flex flex-col items-end gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-3">
                          <span>{formatDate(visit.startsAt, { month: "short", day: "numeric", year: "numeric" })} · {formatTime(visit.startsAt)}</span>
                          {!showStatus ? null : visit.recordStatus
                        ? <RecordStatusBadge status={visit.recordStatus}/>
                        : <span className={`rounded-md border px-2 py-0.5 font-semibold ${upcoming ? "border-blue-300 bg-blue-50 text-blue-700" : "border-violet-300 bg-violet-50 text-violet-700"}`}>{upcoming ? "Upcoming" : "Completed"}</span>}
                        </div>
                        {onSelect && visit.recordNumber && (isTakenByOtherVet(visit, currentVetId)
                        ? (<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400" title="Only the vet who selected this record can work on it.">
                              <LockIcon className="h-3 w-3"/> Dr. {visit.veterinarian}&apos;s record · view only
                            </span>)
                        : isLocked(visit.recordStatus)
                        ? (<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400" title="Completed records are final and can't be changed.">
                              <LockIcon className="h-3 w-3"/> Locked · view only
                            </span>)
                        : (<button type="button" onClick={() => onSelect(visit)} disabled={selectingId === visit.id} className="rounded-lg bg-paw-blue px-3 py-1.5 text-xs font-bold text-white transition hover:bg-paw-blue-dark disabled:opacity-60">
                              {selectingId === visit.id ? "Opening…" : selectLabel(visit.recordStatus)}
                            </button>))}
                      </div>
                    </li>);
            })}
              </ul>)}
          </div>
        </div>

        <footer className="paw-pet-modal-footer">
          <button type="button" onClick={onClose} className="rounded-lg border border-paw-blue px-6 py-2 text-sm font-semibold text-paw-blue hover:bg-paw-blue-soft">Close</button>
        </footer>
      </section>
    </div>);
}
