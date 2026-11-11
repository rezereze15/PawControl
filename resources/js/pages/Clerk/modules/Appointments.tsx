import { useState } from 'react';
import AppointmentHeader from '../components/AppointmentHeader';
import AppointmentFilters from '../components/AppointmentFilters';
import AppointmentTable from '../components/AppointmentTable';
import Pagination from '@/Components/Pagination';
import { MOCK_APPOINTMENTS, type AppointmentFilter } from '../components/AppointmentTypes';

interface ClerkAppointmentsProps {
  veterinarianView?: boolean
}

function ClerkAppointments({
  veterinarianView = false,
}: ClerkAppointmentsProps) {
  const [filter, setFilter] = useState<AppointmentFilter>("All")
  const [search, setSearch] = useState("")

  const filtered = MOCK_APPOINTMENTS.filter((a) => {
    const matchFilter = filter === "All" || a.status === filter
    const matchSearch = [a.owner, a.pet, a.type].some((f) =>
      f.toLowerCase().includes(search.toLowerCase()),
    )
    return matchFilter && matchSearch
  })



  return (
    <div className={`paw-appointments-view flex flex-col gap-6 ${veterinarianView ? 'vet-view' : ''}`}>
      <AppointmentHeader search={search} onSearchChange={setSearch} />
      <AppointmentFilters filter={filter} onFilterChange={setFilter} veterinarianView={veterinarianView} />
      <div className="paw-appointments-table-card bg-white rounded-xl shadow-sm overflow-visible">
        <AppointmentTable appointments={filtered} veterinarianView={veterinarianView} />
        <Pagination
          itemCount={filtered.length}
          totalEntries={118}
          lastPage={24}
          className="paw-appointments-pagination flex items-center justify-between px-5 py-4 border-t border-gray-100"
        />
      </div>
    </div>
  )
}

export { ClerkAppointments }
export default ClerkAppointments

// â”€â”€â”€ Veterinarian Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
