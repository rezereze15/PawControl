import { useMemo, useState } from 'react';
import AppointmentHeader from '../components/AppointmentHeader';
import AppointmentFilters from '../components/AppointmentFilters';
import AppointmentTable from '../components/AppointmentTable';
import ClerkAppointmentDetailsModal from '../components/ClerkAppointmentDetailsModal';
import TablePagination, { paginate } from '@/Components/TablePagination';
import EmergencyButton from '../components/EmergencyButton';

const PAGE_SIZE = 10;

function ClerkAppointments({ appointments = [], onEmergency }) {
    const [filter, setFilter] = useState("Pending");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);
    const counts = useMemo(() => appointments.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] ?? 0) + 1 }), { All: appointments.length }), [appointments]);
    const query = search.trim().toLowerCase();
    const filtered = appointments.filter((a) => {
        const matchFilter = filter === "All" || a.status === filter;
        const matchSearch = !query || [a.owner, a.pet, a.type, a.referenceNumber, a.phone, a.isEmergency ? "emergency walk-in" : ""].some((f) => String(f ?? "").toLowerCase().includes(query));
        return matchFilter && matchSearch;
    });
    const { currentPage, pageCount, rows } = paginate(filtered, page, PAGE_SIZE);
    // Changing the tab or the search goes back to the first page.
    const withReset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };
    // Look the appointment up by id so the modal always reflects the latest server data.
    const selected = appointments.find((a) => a.id === selectedId) ?? null;
    return (<div className="paw-appointments-view flex flex-col gap-6">
      <AppointmentHeader subtitle="Review online requests and register emergency walk-ins" action={onEmergency && <EmergencyButton onClick={onEmergency}/>}/>
      <AppointmentFilters filter={filter} onFilterChange={withReset(setFilter)} counts={counts} search={search} onSearchChange={withReset(setSearch)}/>
      <div className="paw-list-card bg-white rounded-xl shadow-sm overflow-visible">
        <AppointmentTable appointments={rows} onView={(a) => setSelectedId(a.id)}/>
        <TablePagination page={currentPage} pageCount={pageCount} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage}/>
      </div>
      {selected && <ClerkAppointmentDetailsModal key={selected.id} appointment={selected} onClose={() => setSelectedId(null)}/>}
    </div>);
}
export { ClerkAppointments };
export default ClerkAppointments;
