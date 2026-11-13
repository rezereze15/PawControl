const DOT = { Pending: "bg-yellow-400", Confirmed: "bg-blue-400", Rejected: "bg-red-500" };
export default function AppointmentFilters({ filter, onFilterChange, veterinarianView, counts = {} }) {
    if (veterinarianView) return null;
    return (<div className="paw-appointment-filterbar bg-white rounded-xl shadow-sm px-6 py-4 flex flex-wrap items-center gap-6" role="tablist" aria-label="Filter appointments by status">
              {["All", "Pending", "Confirmed", "Rejected"].map((f) => (<button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => onFilterChange(f)} className={`flex items-center gap-2 text-sm font-semibold transition-colors ${filter === f
                    ? "text-[#1a0a3c]"
                    : "text-gray-400 hover:text-gray-600"}`}>
                  {f !== "All" && <span className={`w-3 h-3 rounded-full ${DOT[f]}`}/>}
                  {f}
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500">{counts[f] ?? 0}</span>
                </button>))}
            </div>);
}
