import DataTable from "@/Components/DataTable";
import StatusBadge from "@/Components/StatusBadge";
const statusBadge = {
    Pending: "border border-yellow-400 text-yellow-600 bg-yellow-50",
    Confirmed: "border border-blue-400 text-blue-600 bg-blue-50",
    Cancelled: "bg-red-400 text-white",
};
export default function AppointmentTable({ appointments, veterinarianView }) {
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
                {appointments.map((a) => (<tr key={a.id} className="hover:bg-gray-50 transition-colors">
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
                          <p className="text-gray-400 text-xs">Ref. {a.referenceNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{a.date}</td>
                    <td className="px-5 py-4 text-gray-600">{a.time}</td>
                    <td className="px-5 py-4 text-gray-600">{a.type}</td>
                    {!veterinarianView && (<td className="px-5 py-4">
                    <StatusBadge className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[a.status]}`}>
                          {a.status}
                    </StatusBadge>
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
            </DataTable>);
}
