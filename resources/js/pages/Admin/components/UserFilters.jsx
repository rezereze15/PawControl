import SearchField from "@/Components/SearchField";
export default function UserFilters({ roles = [], search, roleFilter, statusFilter, onSearchChange, onRoleChange, onStatusChange, onReset }) {
    const select = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3b0f8c] focus:outline-none";
    return (<div className="paw-admin-users-filters rounded-xl bg-white px-5 py-4 shadow-sm">
      <div className="paw-admin-users-filter-controls flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-gray-500">Search</label>
          <SearchField value={search} onChange={onSearchChange} placeholder="Search by name, username, email..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]"/>
        </div>
        <div>
          <label htmlFor="role-filter" className="mb-1 block text-xs font-semibold text-gray-500">Roles</label>
          <select id="role-filter" value={roleFilter} onChange={(e) => onRoleChange(e.target.value)} className={select}>
            <option value="">All Roles</option>
            {roles.map((r) => <option key={r.name} value={r.name}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status-filter" className="mb-1 block text-xs font-semibold text-gray-500">Status</label>
          <select id="status-filter" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className={select}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button type="button" onClick={onReset} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round"/></svg>
          Reset
        </button>
      </div>
    </div>);
}
