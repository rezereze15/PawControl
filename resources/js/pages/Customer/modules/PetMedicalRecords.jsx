import { useState } from "react";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import PatientRecordModal, { formatDate } from "../../Veterinarian/components/PatientRecordModal";

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
                const latest = pet.visits[0];
                return (<article key={pet.id} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <PetAvatar name={pet.name} photo={pet.photo}/>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-extrabold text-[#1a0a3c]">{pet.name}</h2>
                    <p className="truncate text-xs text-gray-500">{[pet.species, pet.breed].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500">Records</dt>
                    <dd className="font-bold text-[#1a0a3c]">{pet.visits.length}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Latest</dt>
                    <dd className="font-bold text-[#1a0a3c]">{latest ? formatDate(latest.startsAt, { month: "short", day: "numeric", year: "numeric" }) : "—"}</dd>
                  </div>
                  {latest && (<div className="col-span-2">
                      <dt className="text-xs text-gray-500">Latest service</dt>
                      <dd className="flex flex-wrap items-center gap-2 font-semibold text-[#1a0a3c]">
                        {latest.type}
                        {latest.isEmergency && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">Emergency</span>}
                      </dd>
                    </div>)}
                </dl>
                <button type="button" onClick={() => setSelectedId(pet.id)} className="mt-auto rounded-lg border border-paw-blue px-4 py-2 text-sm font-semibold text-paw-blue hover:bg-paw-blue-soft">
                  View medical records
                </button>
              </article>);
            })}
        </div>)}

      {selected && <PatientRecordModal patient={selected} onClose={() => setSelectedId(null)}/>}
    </div>);
}
