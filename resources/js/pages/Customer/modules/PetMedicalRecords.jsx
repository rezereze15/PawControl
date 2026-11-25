import { useState } from "react";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import { formatPetAge } from "../../shared/dashboard/petAge";
import { lastVisit, nextVisit } from "../../shared/dashboard/recordStatus";
import PatientRecordModal, { formatDate, formatTime } from "../../Veterinarian/components/PatientRecordModal";

/**
 * Pet owner view: medical records of the signed-in owner's own pets only
 * (the server sends nothing else). A record is created when the clinic accepts an appointment.
 */
export default function CustomerPetMedicalRecords({ records = [], onBookAppointment }) {
    const [selectedId, setSelectedId] = useState(null);
    const selected = records.find((pet) => pet.id === selectedId) ?? null;

    return (<div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Pet Medical Records</h1>
        <p className="mt-1 text-sm text-gray-500">A record is added each time the clinic accepts one of your pet&apos;s appointments.</p>
      </div>

      {records.length === 0 ? (<div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-gray-500">No medical records yet. They appear here once the clinic accepts an appointment.</p>
          {onBookAppointment && (<button type="button" onClick={onBookAppointment} className="rounded-lg bg-paw-blue px-5 py-2 text-sm font-bold text-white hover:bg-paw-blue-dark">
              Book an appointment
            </button>)}
        </div>) : (<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((pet) => {
                const next = nextVisit(pet.visits);
                const last = lastVisit(pet.visits);
                // Only the latest completed visit's advice: older advice may be out of date.
                const homeCare = pet.visits.find((v) => v.recordStatus === "Completed")?.suggestions;
                const details = [pet.species, pet.breed, formatPetAge(pet)].filter(Boolean).join(" · ");
                return (<article key={pet.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <PetAvatar name={pet.name} photo={pet.photo}/>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-extrabold text-[#1a0a3c]">{pet.name}</h2>
                    <p className="truncate text-xs text-gray-500">{details}</p>
                  </div>
                </div>
                {next && (<p className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 px-3 py-1 text-[13px] font-semibold text-amber-800">
                    <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    Next visit: {formatDate(next.startsAt, { weekday: "short", month: "short", day: "numeric" })} · {formatTime(next.startsAt)}
                  </p>)}
                <div className="flex flex-col gap-0.5 text-sm">
                  <span className="text-xs text-gray-500">Last visit</span>
                  {last ? (<span className="flex flex-wrap items-center gap-2 font-semibold text-[#1a0a3c]">
                      {formatDate(last.startsAt, { month: "short", day: "numeric", year: "numeric" })} · {last.type}
                      {last.isEmergency && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">Emergency</span>}
                    </span>) : <span className="text-gray-500">No visits yet</span>}
                </div>
                {homeCare && (<div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 px-3 py-2.5">
                    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Home care</p>
                      <p className="line-clamp-2 text-sm text-emerald-950">{homeCare}</p>
                    </div>
                  </div>)}
                <button type="button" onClick={() => setSelectedId(pet.id)} className="mt-auto min-h-11 rounded-lg border border-paw-blue px-4 text-sm font-semibold text-paw-blue hover:bg-paw-blue-soft">
                  View records ({pet.visits.length})
                </button>
              </article>);
            })}
        </div>)}

      {selected && <PatientRecordModal patient={selected} onClose={() => setSelectedId(null)} forPetOwner/>}
    </div>);
}
