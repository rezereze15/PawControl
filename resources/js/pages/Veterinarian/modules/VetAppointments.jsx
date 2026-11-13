import { useState } from "react";
import AppointmentHeader from "../../Clerk/components/AppointmentHeader";
import AppointmentTable from "../../Clerk/components/AppointmentTable";
import PatientRecordModal from "../components/PatientRecordModal";

/** Confirmed (clerk-accepted) appointments from today onward. */
export default function VetAppointments({ appointments = [], patients = [] }) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const query = search.trim().toLowerCase();
    const filtered = appointments.filter((a) => !query || [a.owner, a.pet, a.type, a.date].some((f) => String(f ?? "").toLowerCase().includes(query)));
    const patient = selected ? patients.find((p) => p.id === selected.petId) : null;

    return (<div className="paw-appointments-view vet-view flex flex-col gap-6">
      <AppointmentHeader search={search} onSearchChange={setSearch} subtitle="Confirmed appointments ready for consultation"/>
      <div className="paw-appointments-table-card bg-white rounded-xl shadow-sm overflow-visible">
        <AppointmentTable appointments={filtered} veterinarianView onView={setSelected}/>
        <p className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">Showing {filtered.length} of {appointments.length} confirmed appointments</p>
      </div>
      {selected && patient && <PatientRecordModal patient={patient} appointment={patient.visits.find((v) => v.id === selected.id)} onClose={() => setSelected(null)}/>}
    </div>);
}
