import { useState } from 'react';
import UserStats from '../components/UserStats';
import UserFilters from '../components/UserFilters';
import UserTable from '../components/UserTable';
import Pagination from '@/Components/Pagination';
import { MOCK_USERS } from '../components/UserTypes';

function AdminManageUsers() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All Roles")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "All Roles" || u.role === roleFilter
    const matchStatus =
      statusFilter === "All Status" || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  return (
    <div className="paw-admin-users flex flex-col gap-6">
      {/* Title row */}
      <div className="paw-admin-users-heading flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
            Manage Users
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View, edit, and manage system users and their roles
          </p>
        </div>
        <button className="bg-[#1a0a3c] hover:bg-[#2d0a6e] text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap">
          + Add New User
        </button>
      </div>

      <UserStats />
      <UserFilters
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
        onReset={() => {
          setSearch("")
          setRoleFilter("All Roles")
          setStatusFilter("All Status")
        }}
      />
      <div className="paw-admin-users-table bg-white rounded-xl shadow-sm overflow-hidden">
        <UserTable users={filtered} />
        <Pagination
          itemCount={filtered.length}
          totalEntries={22}
          lastPage={5}
          className="paw-admin-users-pagination flex items-center justify-between px-6 py-4 border-t border-gray-100"
        />
      </div>
    </div>
  )
}

export default AdminManageUsers
