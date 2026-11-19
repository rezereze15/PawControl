import { useState } from 'react';
import SearchField from '@/Components/SearchField';
import ServiceTable from '../components/ServiceTable';
import ServiceFormModal from '../components/ServiceFormModal';
import ServiceStatusModal from '../components/ServiceStatusModal';

const select = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3b0f8c] focus:outline-none";

function AdminManageServices({ services = [] }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    // { mode: "create" } | { mode: "edit", id } | { mode: "status", id }
    const [dialog, setDialog] = useState(null);
    // Look the service up by id so the form always shows the latest server data.
    const dialogService = dialog?.id ? services.find((s) => s.id === dialog.id) : null;

    // Filtering happens in the browser: there are only a few services, so no need to ask the server.
    const query = search.trim().toLowerCase();
    const filtered = services.filter((s) => (!query || [s.name, s.description].some((f) => String(f ?? "").toLowerCase().includes(query)))
        && (!statusFilter || (statusFilter === "Active") === s.isActive));

    return (<div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Manage Services</h1>
          <p className="mt-1 text-sm text-gray-500">Create, edit, or deactivate the services that the Clinic can offer</p>
        </div>
        <button type="button" onClick={() => setDialog({ mode: "create" })} className="whitespace-nowrap rounded-lg bg-[#1a0a3c] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2d0a6e]">
          + Add New Service
        </button>
      </div>

      <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-gray-500">Search</label>
            <SearchField value={search} onChange={setSearch} placeholder="Search by name or description..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]"/>
          </div>
          <div>
            <label htmlFor="service-status-filter" className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
            <select id="service-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={select}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-visible rounded-xl bg-white shadow-sm">
        <ServiceTable services={filtered} onEdit={(s) => setDialog({ mode: "edit", id: s.id })} onToggleStatus={(s) => setDialog({ mode: "status", id: s.id })}/>
      </div>
      <p className="text-sm text-gray-500">Showing {filtered.length} of {services.length} services</p>

      {dialog?.mode === "create" && <ServiceFormModal services={services} onClose={() => setDialog(null)}/>}
      {dialog?.mode === "edit" && dialogService && <ServiceFormModal key={dialogService.id} service={dialogService} services={services} onClose={() => setDialog(null)}/>}
      {dialog?.mode === "status" && dialogService && <ServiceStatusModal service={dialogService} onClose={() => setDialog(null)}/>}
    </div>);
}
export default AdminManageServices;
