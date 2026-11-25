import { useState } from "react";
import AppointmentHeader from "../../Clerk/components/AppointmentHeader";
import AppointmentTable from "../../Clerk/components/AppointmentTable";
import PatientRecordModal, { formatDate } from "../components/PatientRecordModal";
import TablePagination, { paginate } from "@/Components/TablePagination";

const PAGE_SIZE = 10;

/**
 * View-only list of today's clerk-accepted (Confirmed) appointments, by the clinic's date.
 * No status labels or diagnosis actions: diagnoses are started from Pet Medical Records.
 */
export default function VetAppointments({ appointments = [], today, patients = [] }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);
    const query = search.trim().toLowerCase();
    // The server only sends today's Confirmed appointments; checking again keeps this page to exactly that.
    const todays = appointments.filter((a) => a.status === "Confirmed" && (!today || a.day === today));
    const filtered = todays.filter((a) => !query || [a.owner, a.pet, a.type, a.date, a.time].some((f) => String(f ?? "").toLowerCase().includes(query)));
    const { currentPage, pageCount, rows } = paginate(filtered, page, PAGE_SIZE);
    const patient = selected ? patients.find((p) => p.id === selected.petId) : null;
    const todayLabel = today ? formatDate(`${today}T00:00:00`, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "today";

    return (<div className="paw-appointments-view vet-view flex flex-col gap-6">
      <AppointmentHeader search={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} subtitle={`Today's appointments accepted by the clerk — ${todayLabel} (view only). Start diagnoses from Pet Medical Records.`}/>
      <div className="paw-list-card bg-white rounded-xl shadow-sm overflow-visible">
        <AppointmentTable appointments={rows} veterinarianView onView={setSelected} emptyMessage={todays.length === 0 ? "No data: no accepted appointments scheduled for today." : "No appointments match your search."}/>
        <TablePagination page={currentPage} pageCount={pageCount} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} label="appointments today"/>
      </div>
      {selected && patient && <PatientRecordModal patient={patient} appointment={patient.visits.find((v) => v.appointmentId === selected.id)} onClose={() => setSelected(null)} showStatus={false}/>}
    </div>);
}
