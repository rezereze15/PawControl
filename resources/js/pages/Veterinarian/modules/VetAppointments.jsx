import { useState } from "react";
import AppointmentHeader from "../../Clerk/components/AppointmentHeader";
import AppointmentTable from "../../Clerk/components/AppointmentTable";
import PatientRecordModal from "../components/PatientRecordModal";
import TablePagination, { paginate } from "@/Components/TablePagination";

const PAGE_SIZE = 10;

/** Confirmed (clerk-accepted) appointments from today onward. */
export default function VetAppointments({ appointments = [], patients = [] }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const query = search.trim().toLowerCase();
    const filtered = appointments.filter((a) => !query || [a.owner, a.pet, a.type, a.date].some((f) => String(f ?? "").toLowerCase().includes(query)));
    const { currentPage, pageCount, rows } = paginate(filtered, page, PAGE_SIZE);
    const patient = selected ? patients.find((p) => p.id === selected.petId) : null;

    return (<div className="paw-appointments-view vet-view flex flex-col gap-6">
      <AppointmentHeader search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} subtitle="Confirmed appointments ready for consultation"/>
      <div className="paw-list-card bg-white rounded-xl shadow-sm overflow-visible">
        <AppointmentTable appointments={rows} veterinarianView onView={setSelected}/>
        <TablePagination page={currentPage} pageCount={pageCount} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} label="confirmed appointments"/>
      </div>
      {selected && patient && <PatientRecordModal patient={patient} appointment={patient.visits.find((v) => v.appointmentId === selected.id)} onClose={() => setSelected(null)}/>}
    </div>);
}
