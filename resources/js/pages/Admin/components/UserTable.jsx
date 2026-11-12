import DataTable from "@/Components/DataTable";
import StatusBadge from "@/Components/StatusBadge";
const roleBadge = {
    Admin: "bg-red-100 text-red-500 border border-red-300",
    Clerk: "bg-yellow-100 text-yellow-600 border border-yellow-300",
    Veterinarian: "bg-green-100 text-green-600 border border-green-300",
    Customer: "bg-purple-100 text-purple-600 border border-purple-300",
};
export default function UserTable({ users }) {
    return (<DataTable className="w-full text-sm">
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
                {users.map((u) => (<tr key={u.id} className="hover:bg-gray-50 transition-colors">
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
                  <StatusBadge className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadge[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {u.role}
                  </StatusBadge>
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
                  <StatusBadge className={`px-3 py-1 rounded-full text-xs font-semibold border ${u.status === "Active"
                ? "border-green-400 text-green-600 bg-green-50"
                : "border-gray-300 text-gray-500 bg-gray-50"}`}>
                        {u.status}
                  </StatusBadge>
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
            </DataTable>);
}
