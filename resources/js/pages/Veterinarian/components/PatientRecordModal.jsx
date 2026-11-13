import { useEffect } from "react";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";

export function formatDate(iso, options = { month: "long", day: "numeric", year: "numeric" }) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", options).format(date);
}

export function formatTime(iso) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

function Field({ label, value }) {
    return (<div className="min-w-0">
      <dt className="text-xs font-bold text-[#1a0a3c]">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-gray-700">{value || <span className="text-gray-300">Not recorded</span>}</dd>
    </div>);
}

/**
 * Read-only pet medical record for veterinarians: animal signalment,
 * owner contact, the appointment being viewed (if any) and visit history.
 */
export default function PatientRecordModal({ patient, appointment, onClose }) {
    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const age = patient.age == null ? null : `${patient.age} ${Number(patient.age) === 1 ? "year" : "years"}`;
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
          {appointment && (<div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-violet-50 px-5 py-4 text-sm text-[#3b0f8c]">
              <span className="flex items-center gap-2 font-bold">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>
                {formatDate(appointment.startsAt)} at {formatTime(appointment.startsAt)}
              </span>
              <span><span className="text-violet-400">Service:</span> <strong>{appointment.type}</strong></span>
              {appointment.notes && <span className="w-full text-gray-700"><span className="font-semibold text-violet-400">Owner's concern:</span> {appointment.notes}</span>}
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
            <h3 className="mb-3 text-base font-extrabold text-[#1a0a3c]">Owner</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Name" value={patient.owner?.name}/>
              <Field label="Email" value={patient.owner?.email}/>
              <Field label="Contact Number" value={patient.owner?.phone}/>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="mb-3 text-base font-extrabold text-[#1a0a3c]">Visit History</h3>
            {patient.visits.length === 0 ? <p className="text-sm text-gray-400">No confirmed visits yet.</p> : (<ul className="divide-y divide-gray-100">
                {patient.visits.map((visit) => {
                const upcoming = new Date(visit.startsAt).getTime() >= now;
                return (<li key={visit.id} className={`flex flex-wrap items-center justify-between gap-2 py-3 ${appointment?.id === visit.id ? "rounded-lg bg-violet-50/60 px-2" : ""}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1a0a3c]">{visit.type}</p>
                        {visit.notes && <p className="text-xs text-gray-500">{visit.notes}</p>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>{formatDate(visit.startsAt, { month: "short", day: "numeric", year: "numeric" })} · {formatTime(visit.startsAt)}</span>
                        <span className={`rounded-md border px-2 py-0.5 font-semibold ${upcoming ? "border-blue-300 bg-blue-50 text-blue-700" : "border-violet-300 bg-violet-50 text-violet-700"}`}>{upcoming ? "Upcoming" : "Completed"}</span>
                      </div>
                    </li>);
            })}
              </ul>)}
          </div>
        </div>

        <footer className="paw-pet-modal-footer">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#3b0f8c] px-6 py-2 text-sm font-semibold text-[#3b0f8c] hover:bg-violet-50">Close</button>
        </footer>
      </section>
    </div>);
}
