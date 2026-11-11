import type { AppointmentFilter } from "./AppointmentTypes"

interface AppointmentFiltersProps {
  filter: AppointmentFilter
  onFilterChange: (filter: AppointmentFilter) => void
  veterinarianView: boolean
}

export default function AppointmentFilters({ filter, onFilterChange, veterinarianView }: AppointmentFiltersProps) {
  return (
    <>
          {!veterinarianView && (
            <div className="paw-appointment-filterbar bg-white rounded-xl shadow-sm px-6 py-4 flex items-center gap-6">
              {(["All", "Pending", "Confirmed", "Cancelled"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                    filter === f
                      ? "text-[#1a0a3c]"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {f !== "All" && (
                    <span
                      className={`w-3 h-3 rounded-full ${
                        f === "Pending"
                          ? "bg-yellow-400"
                          : f === "Confirmed"
                            ? "bg-blue-400"
                            : "bg-red-500"
                      }`}
                    />
                  )}
                  {f}
                </button>
              ))}
            </div>
          )}
    </>
  )
}
