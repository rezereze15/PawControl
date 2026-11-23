import { useState } from 'react';
import SearchField from '@/Components/SearchField';
import SupplyTable from '../components/SupplyTable';
import SupplyFormModal from '../components/SupplyFormModal';
import SupplyStatusModal from '../components/SupplyStatusModal';

const select = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3b0f8c] focus:outline-none";

function AdminManageSupplies({ supplies = [], options = {} }) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    // "" (all) | "Active" | "Inactive" | "Low stock"
    const [statusFilter, setStatusFilter] = useState("");
    const lowStockCount = supplies.filter((s) => s.isLowStock).length;
    // { mode: "create" } | { mode: "edit", id } | { mode: "status", id }
    const [dialog, setDialog] = useState(null);
    // Look the supply up by id so the form always shows the latest server data.
    const dialogSupply = dialog?.id ? supplies.find((s) => s.id === dialog.id) : null;

    // Filtering happens in the browser, like Manage Services.
    const query = search.trim().toLowerCase();
    const filtered = supplies.filter((s) => (!query || [s.name, s.description].some((f) => String(f ?? "").toLowerCase().includes(query)))
        && (!category || s.category === category)
        && (!statusFilter || (statusFilter === "Low stock" ? s.isLowStock : (statusFilter === "Active") === s.isActive)));

    return (<div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Manage Medical Supplies</h1>
          <p className="mt-1 text-sm text-gray-500">Track the clinic's medical supplies and their stock levels</p>
        </div>
        <button type="button" onClick={() => setDialog({ mode: "create" })} className="whitespace-nowrap rounded-lg bg-[#1a0a3c] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2d0a6e]">
          + Add New Supply
        </button>
      </div>

      <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-gray-500">Search</label>
            <SearchField value={search} onChange={setSearch} placeholder="Search by name or description..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]"/>
          </div>
          <div>
            <label htmlFor="supply-category-filter" className="mb-1 block text-xs font-semibold text-gray-500">Category</label>
            <select id="supply-category-filter" value={category} onChange={(e) => setCategory(e.target.value)} className={select}>
              <option value="">All Categories</option>
              {(options.categories ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="supply-status-filter" className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
            <select id="supply-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={select}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Low stock">Low stock ({lowStockCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* overflow-visible so the ⋮ menu isn't cut off on the last row. */}
      <div className="overflow-visible rounded-xl bg-white shadow-sm">
        <SupplyTable supplies={filtered} onEdit={(s) => setDialog({ mode: "edit", id: s.id })} onToggleStatus={(s) => setDialog({ mode: "status", id: s.id })}/>
      </div>
      <p className="text-sm text-gray-500">Showing {filtered.length} of {supplies.length} supplies</p>

      {dialog?.mode === "create" && <SupplyFormModal supplies={supplies} options={options} onClose={() => setDialog(null)}/>}
      {dialog?.mode === "edit" && dialogSupply && <SupplyFormModal key={dialogSupply.id} supply={dialogSupply} supplies={supplies} options={options} onClose={() => setDialog(null)}/>}
      {dialog?.mode === "status" && dialogSupply && <SupplyStatusModal supply={dialogSupply} onClose={() => setDialog(null)}/>}
    </div>);
}
export default AdminManageSupplies;
