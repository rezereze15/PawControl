import { useState } from "react";
import { leanPhoto } from "../../shared/dashboard/assets";
const MOCK_APPOINTMENTS = [
    {
        id: "ID-0005",
        owner: "Gusion Q. Pogi",
        phone: "09887766521",
        pet: "Kwek-Kwek",
        photo: null,
        date: "May 9, 2026",
        time: "1:00 PM",
        type: "Check-up",
        status: "Pending",
    },
    {
        id: "ID-0006",
        owner: "Jojo P. Muzon",
        phone: "09231122331",
        pet: "Siomai",
        photo: leanPhoto,
        date: "May 21, 2026",
        time: "5:00 PM",
        type: "Check-up",
        status: "Pending",
    },
    {
        id: "ID-0007",
        owner: "Lebron W. James",
        phone: "09176762131",
        pet: "Kikiam",
        photo: null,
        date: "May 25, 2026",
        time: "10:00 AM",
        type: "Check-up",
        status: "Cancelled",
    },
    {
        id: "ID-0008",
        owner: "Maria Santos",
        phone: "09123456789",
        pet: "Mochi",
        photo: null,
        date: "May 28, 2026",
        time: "2:00 PM",
        type: "Vaccination",
        status: "Confirmed",
    },
];
function LegacyAppointments({ veterinarianView = false, }) {
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const filtered = MOCK_APPOINTMENTS.filter((a) => {
        const matchFilter = filter === "All" || a.status === filter;
        const matchSearch = [a.owner, a.pet, a.type].some((f) => f.toLowerCase().includes(search.toLowerCase()));
        return matchFilter && matchSearch;
    });
    const statusBadge = {
        Pending: "border border-yellow-400 text-yellow-600 bg-yellow-50",
        Confirmed: "border border-blue-400 text-blue-600 bg-blue-50",
        Cancelled: "bg-red-400 text-white",
    };
    return (<div className={`paw-appointments-view flex flex-col gap-6 ${veterinarianView ? 'vet-view' : ''}`}>
      {/* Title row */}
      <div className="paw-appointments-heading flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
            Appointments
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage Upcoming Appointments
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search by pet name, owner, breed, veterinarian..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3b0f8c] w-72"/>
          </div>
          <button className="bg-[#1a0a3c] hover:bg-[#2d0a6e] text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
            + New Appointment
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      {!veterinarianView && (<div className="paw-appointment-filterbar bg-white rounded-xl shadow-sm px-6 py-4 flex items-center gap-6">
          {["All", "Pending", "Confirmed", "Cancelled"].map((f) => (<button key={f} onClick={() => setFilter(f)} className={`flex items-center gap-2 text-sm font-semibold transition-colors ${filter === f
                    ? "text-[#1a0a3c]"
                    : "text-gray-400 hover:text-gray-600"}`}>
              {f !== "All" && (<span className={`w-3 h-3 rounded-full ${f === "Pending"
                        ? "bg-yellow-400"
                        : f === "Confirmed"
                            ? "bg-blue-400"
                            : "bg-red-500"}`}/>)}
              {f}
            </button>))}
        </div>)}

      {/* Table */}
      <div className="paw-appointments-table-card bg-white rounded-xl shadow-sm overflow-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {[
            "Owner",
            "Pet",
            "Date",
            "Time",
            "Type",
            ...(veterinarianView ? [] : ["Status"]),
            "Actions",
        ].map((h) => (<th key={h} className="px-5 py-4 text-left font-bold text-[#1a0a3c]">
                  {h}
                </th>))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((a) => (<tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#1a0a3c] text-sm">
                    {a.owner}
                  </p>
                  <p className="text-gray-400 text-xs">{a.phone}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {a.photo ? (<img src={a.photo} alt={a.pet} className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                          {a.pet[0]}
                        </div>)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1a0a3c]">{a.pet}</p>
                      <p className="text-gray-400 text-xs">{a.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{a.date}</td>
                <td className="px-5 py-4 text-gray-600">{a.time}</td>
                <td className="px-5 py-4 text-gray-600">{a.type}</td>
                {!veterinarianView && (<td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[a.status]}`}>
                      {a.status}
                    </span>
                  </td>)}
                <td className="px-5 py-4">
                  <span aria-label={`View ${a.pet}'s appointment`} className="flex w-fit items-center justify-center p-2 text-gray-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </span>
                </td>
              </tr>))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="paw-appointments-pagination flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Showing 1 to {filtered.length} of 118 entries
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
              24
            </button>
            <button className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>);
}
// â”€â”€â”€ Veterinarian Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default LegacyAppointments;
