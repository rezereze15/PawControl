import SearchField from "@/Components/SearchField"

interface UserFiltersProps {
  search: string
  roleFilter: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onRoleChange: (value: string) => void
  onStatusChange: (value: string) => void
  onReset: () => void
}

export default function UserFilters({ search, roleFilter, statusFilter, onSearchChange, onRoleChange, onStatusChange, onReset }: UserFiltersProps) {
  return (
          <div className="paw-admin-users-filters bg-white rounded-xl shadow-sm px-5 py-4">
            <div className="paw-admin-users-filter-controls flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Search
                </label>
            <SearchField
              value={search}
              onChange={onSearchChange}
              placeholder="Search by users, email..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"
            />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Roles
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => onRoleChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b0f8c] bg-white"
                >
                  {["All Roles", "Admin", "Clerk", "Veterinarian", "Customer"].map(
                    (r) => (
                      <option key={r}>{r}</option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3b0f8c] bg-white"
                >
                  {["All Status", "Active", "Inactive"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                    <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
                  </svg>
                  Filters
                </button>
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 4v6h6M23 20v-6h-6" />
                    <path
                      d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15"
                      strokeLinecap="round"
                    />
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          </div>
  )
}
