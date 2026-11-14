import { useMemo, useState } from 'react';
import UserStats from '../components/UserStats';
import UserFilters from '../components/UserFilters';
import UserTable from '../components/UserTable';
import UserFormModal from '../components/UserFormModal';
import UserStatusModal from '../components/UserStatusModal';

const PAGE_SIZE = 10;

function AdminManageUsers({ users = [], roles = [], currentUserId }) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    // { mode: "create" } | { mode: "edit", id } | { mode: "status", id }
    const [dialog, setDialog] = useState(null);

    const roleLabels = useMemo(() => Object.fromEntries(roles.map((r) => [r.name, r.label])), [roles]);
    const query = search.trim().toLowerCase();
    const filtered = users.filter((u) => (!query || [u.name, u.username, u.email].some((f) => String(f ?? "").toLowerCase().includes(query)))
        && (!roleFilter || u.role === roleFilter)
        && (!statusFilter || u.status === statusFilter));

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const pageUsers = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const first = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const filter = (setter) => (value) => { setter(value); setPage(1); };
    // Look users up by id so dialogs always show the latest server data.
    const dialogUser = dialog?.id ? users.find((u) => u.id === dialog.id) : null;

    return (<div className="paw-admin-users flex flex-col gap-6">
      <div className="paw-admin-users-heading flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Manage Users</h1>
          <p className="mt-1 text-sm text-gray-500">Create accounts, assign roles, and control who can sign in</p>
        </div>
        <button type="button" onClick={() => setDialog({ mode: "create" })} className="whitespace-nowrap rounded-lg bg-[#1a0a3c] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2d0a6e]">
          + Add New User
        </button>
      </div>

      <UserStats users={users}/>
      <UserFilters roles={roles} search={search} roleFilter={roleFilter} statusFilter={statusFilter} onSearchChange={filter(setSearch)} onRoleChange={filter(setRoleFilter)} onStatusChange={filter(setStatusFilter)} onReset={() => {
            setSearch("");
            setRoleFilter("");
            setStatusFilter("");
            setPage(1);
        }}/>
      <div className="paw-admin-users-table overflow-visible rounded-xl bg-white shadow-sm">
        <UserTable users={pageUsers} roleLabels={roleLabels} currentUserId={currentUserId} onEdit={(u) => setDialog({ mode: "edit", id: u.id })} onToggleStatus={(u) => setDialog({ mode: "status", id: u.id })}/>
        <div className="paw-admin-users-pagination flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-sm text-gray-500">Showing {first} to {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40">&lt; Previous</button>
            <span className="px-2 text-xs text-gray-500">Page {currentPage} of {pageCount}</span>
            <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40">Next &gt;</button>
          </div>
        </div>
      </div>

      {dialog?.mode === "create" && <UserFormModal roles={roles} onClose={() => setDialog(null)}/>}
      {dialog?.mode === "edit" && dialogUser && <UserFormModal key={dialogUser.id} user={dialogUser} roles={roles} isSelf={dialogUser.id === currentUserId} onClose={() => setDialog(null)}/>}
      {dialog?.mode === "status" && dialogUser && <UserStatusModal user={dialogUser} onClose={() => setDialog(null)}/>}
    </div>);
}
export default AdminManageUsers;
