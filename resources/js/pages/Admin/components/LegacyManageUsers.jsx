import { useState } from "react";
import { asaPhoto, chaewonPhoto, leanPhoto, maloiPhoto } from "../../shared/dashboard/assets";
const MOCK_USERS = [
    {
        id: "UID-0001",
        name: "Chaewon",
        email: "chaeown@gmail.com",
        role: "Admin",
        status: "Active",
        lastLogin: "April 25, 2026",
        lastLoginTime: "12:20 AM",
        photo: chaewonPhoto,
    },
    {
        id: "UID-0002",
        name: "Maloi",
        email: "maloi2@gmail.com",
        role: "Clerk",
        status: "Active",
        lastLogin: "April 25, 2026",
        lastLoginTime: "11:02 AM",
        photo: maloiPhoto,
    },
    {
        id: "UID-0003",
        name: "Haerin",
        email: "hayrin01@gmail.com",
        role: "Veterinarian",
        status: "Active",
        lastLogin: "April 25, 2026",
        lastLoginTime: "11:30 AM",
        photo: leanPhoto,
    },
    {
        id: "UID-0004",
        name: "Asa",
        email: "asababy@gmail.com",
        role: "Veterinarian",
        status: "Inactive",
        lastLogin: "April 25, 2025",
        lastLoginTime: "11:00 AM",
        photo: asaPhoto,
    },
];
function LegacyManageUsers({}) {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All Roles");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const roleBadge = {
        Admin: "bg-red-100 text-red-500 border border-red-300",
        Clerk: "bg-yellow-100 text-yellow-600 border border-yellow-300",
        Veterinarian: "bg-green-100 text-green-600 border border-green-300",
        Customer: "bg-purple-100 text-purple-600 border border-purple-300",
    };
    const filtered = MOCK_USERS.filter((u) => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === "All Roles" || u.role === roleFilter;
        const matchStatus = statusFilter === "All Status" || u.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });
    return (<div className="paw-admin-users flex flex-col gap-6">
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

      {/* Stat cards */}
      <div className="paw-admin-users-stats grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
            {
                label: "Total Users",
                value: "22",
                sub: null,
                icon: (<svg className="w-8 h-8" viewBox="0 0 32 32" fill="#1a0a3c">
                <circle cx="10" cy="10" r="4"/>
                <circle cx="22" cy="10" r="4" opacity=".5"/>
                <path d="M2 28c0-5 3.6-8 8-8s8 3 8 8"/>
                <path d="M20 28c0-5 2.4-8 6-8" stroke="#1a0a3c" strokeWidth="1.5" fill="none" opacity=".5"/>
              </svg>),
            },
            {
                label: "Customer Users",
                value: "17",
                sub: null,
                icon: (<svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="#3b0f8c" strokeWidth="2">
                <circle cx="16" cy="10" r="5"/>
                <path d="M6 28c0-5.5 4.5-9 10-9" strokeLinecap="round"/>
                <path d="M23 22l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>),
                color: "text-[#3b0f8c]",
            },
            {
                label: "Clinic Users",
                value: "5",
                sub: null,
                icon: (<svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" stroke="#e87c1e" strokeWidth="2">
                <circle cx="16" cy="10" r="5"/>
                <path d="M6 28c0-5.5 4.5-9 10-9s10 3.5 10 9" strokeLinecap="round"/>
                <path d="M16 18v-4M14 16h4" strokeLinecap="round"/>
              </svg>),
                color: "text-[#e87c1e]",
            },
            {
                label: "Active Users",
                value: "20",
                sub: "+3 This month",
                icon: (<svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="13" fill="#22c55e"/>
                <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>),
                color: "text-green-500",
            },
            {
                label: "Inactive Users",
                value: "2",
                sub: "+2 This Month",
                icon: (<svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="13" stroke="#9ca3af" strokeWidth="2"/>
                <circle cx="16" cy="16" r="4" stroke="#9ca3af" strokeWidth="2"/>
                <path d="M16 6v4M16 22v4M6 16h4M22 16h4" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
              </svg>),
                color: "text-gray-400",
            },
        ].map((c) => (<div key={c.label} className="paw-admin-user-stat bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="flex-shrink-0">{c.icon}</div>
            <div>
              <p className={`text-xs font-semibold ${c.color ?? "text-gray-500"}`}>
                {c.label}
              </p>
              <p className="text-2xl font-extrabold text-[#1a0a3c]">
                {c.value}
              </p>
              {c.sub && <p className="text-[10px] text-gray-400">{c.sub}</p>}
            </div>
          </div>))}
      </div>

      {/* Filters */}
      <div className="paw-admin-users-filters bg-white rounded-xl shadow-sm px-5 py-4">
        <div className="paw-admin-users-filter-controls flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Search
            </label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Search by users, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"/>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Roles
            </label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b0f8c] bg-white">
              {["All Roles", "Admin", "Clerk", "Veterinarian", "Customer"].map((r) => (<option key={r}>{r}</option>))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Status
            </label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b0f8c] bg-white">
              {["All Status", "Active", "Inactive"].map((s) => (<option key={s}>{s}</option>))}
            </select>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round"/>
              </svg>
              Filters
            </button>
            <button onClick={() => {
            setSearch("");
            setRoleFilter("All Roles");
            setStatusFilter("All Status");
        }} className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round"/>
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="paw-admin-users-table bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
            "Users",
            "Role",
            "Email",
            "Last Login",
            "Status",
            "Actions",
        ].map((h) => (<th key={h} className="px-6 py-4 text-left font-bold text-[#1a0a3c] text-sm">
                  {h}
                </th>))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (<tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {u.photo ? (<img src={u.photo} alt={u.name} className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                          {u.name[0]}
                        </div>)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1a0a3c]">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadge[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                      {u.lastLogin}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2" strokeLinecap="round"/>
                      </svg>
                      {u.lastLoginTime}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${u.status === "Active"
                ? "border-green-400 text-green-600 bg-green-50"
                : "border-gray-300 text-gray-500 bg-gray-50"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button type="button" aria-label={`Actions for ${u.name}`} className="paw-admin-user-actions flex items-center justify-center p-2 rounded text-gray-500 hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <circle cx="12" cy="5" r="1.75"/>
                      <circle cx="12" cy="12" r="1.75"/>
                      <circle cx="12" cy="19" r="1.75"/>
                    </svg>
                  </button>
                </td>
              </tr>))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="paw-admin-users-pagination flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing 1 to {filtered.length} of 22 entries
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              &lt; Previous
            </button>
            {[1, 2, 3].map((n) => (<button key={n} className={`w-8 h-8 text-xs rounded-lg font-semibold ${n === 1
                ? "bg-[#1a0a3c] text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {n}
              </button>))}
            <span className="px-1 text-gray-400 text-xs">...</span>
            <button className="w-8 h-8 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
              5
            </button>
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>);
}
export default LegacyManageUsers;
