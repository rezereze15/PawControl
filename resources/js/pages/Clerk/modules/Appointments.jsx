import { useMemo, useState } from 'react';
import AppointmentHeader from '../components/AppointmentHeader';
import AppointmentFilters from '../components/AppointmentFilters';
import AppointmentTable from '../components/AppointmentTable';
import ClerkAppointmentDetailsModal from '../components/ClerkAppointmentDetailsModal';
import Pagination from '@/Components/Pagination';
function ClerkAppointments({ appointments = [] }) {
    const [filter, setFilter] = useState("Pending");
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const counts = useMemo(() => appointments.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] ?? 0) + 1 }), { All: appointments.length }), [appointments]);
    const query = search.trim().toLowerCase();
    const filtered = appointments.filter((a) => {
        const matchFilter = filter === "All" || a.status === filter;
        const matchSearch = !query || [a.owner, a.pet, a.type, a.referenceNumber, a.phone].some((f) => String(f ?? "").toLowerCase().includes(query));
        return matchFilter && matchSearch;
    });
    // Look the appointment up by id so the modal always reflects the latest server data.
    const selected = appointments.find((a) => a.id === selectedId) ?? null;
    return (<div className="paw-appointments-view flex flex-col gap-6">
      <AppointmentHeader search={search} onSearchChange={setSearch}/>
      <AppointmentFilters filter={filter} onFilterChange={setFilter} counts={counts}/>
      <div className="paw-appointments-table-card bg-white rounded-xl shadow-sm overflow-visible">
        <AppointmentTable appointments={filtered} onView={(a) => setSelectedId(a.id)}/>
        <Pagination itemCount={filtered.length} totalEntries={appointments.length} lastPage={Math.max(1, Math.ceil(appointments.length / 5))} className="paw-appointments-pagination flex items-center justify-between px-5 py-4 border-t border-gray-100"/>
      </div>
      {selected && <ClerkAppointmentDetailsModal key={selected.id} appointment={selected} onClose={() => setSelectedId(null)}/>}
    </div>);
}
export { ClerkAppointments };
export default ClerkAppointments;
