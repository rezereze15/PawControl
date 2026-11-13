import DataTable from "@/Components/DataTable";
import StatusBadge from "@/Components/StatusBadge";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
export const STATUS_BADGE = {
    Pending: "border border-yellow-400 text-yellow-600 bg-yellow-50",
    Confirmed: "border border-blue-400 text-blue-600 bg-blue-50",
    Rejected: "border border-red-400 text-red-600 bg-red-50",
    Cancelled: "bg-red-400 text-white",
};
export default function AppointmentTable({ appointments, veterinarianView, onView }) {
    return (<DataTable className="w-full text-sm">
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
                {appointments.length === 0 && (<tr>
                    <td colSpan={veterinarianView ? 6 : 7} className="px-5 py-12 text-center text-sm text-gray-400">No appointments match these filters.</td>
                  </tr>)}
                {appointments.map((a) => (<tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#1a0a3c] text-sm">
                        {a.owner}
                      </p>
                      <p className="text-gray-400 text-xs">{a.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <PetAvatar name={a.pet} photo={a.photo} size="sm"/>
                        <div>
                          <p className="font-bold text-[#1a0a3c]">{a.pet}</p>
                          <p className="text-gray-400 text-xs">{veterinarianView ? `ID-${String(a.petId).padStart(4, "0")}` : `Ref. ${a.referenceNumber}`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{a.date}</td>
                    <td className="px-5 py-4 text-gray-600">{a.time}</td>
                    <td className="px-5 py-4 text-gray-600">{a.type}</td>
                    {!veterinarianView && (<td className="px-5 py-4">
                    <StatusBadge className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE[a.status] ?? ""}`}>
                          {a.status}
                    </StatusBadge>
                      </td>)}
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => onView?.(a)} aria-label={`View ${a.pet}'s appointment`} className="flex w-fit items-center gap-1.5 rounded-lg p-2 text-gray-500 transition hover:bg-violet-50 hover:text-[#3b0f8c] focus:outline-none focus:ring-2 focus:ring-violet-300">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        {!veterinarianView && a.status === "Pending" && <span className="text-xs font-bold">Review</span>}
                      </button>
                    </td>
                  </tr>))}
              </tbody>
            </DataTable>);
}
