export default function UserStats() {
    return (<div className="paw-admin-users-stats grid grid-cols-2 md:grid-cols-5 gap-4">
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
          </div>);
}
