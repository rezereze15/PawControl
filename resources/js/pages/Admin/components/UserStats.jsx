export default function UserStats({ users = [] }) {
    const clinicRoles = ["admin", "owner", "veterinarian", "clerk"];
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const active = users.filter((u) => u.status === "Active").length;
    const newThisMonth = users.filter((u) => u.createdAt && new Date(u.createdAt) >= monthStart).length;

    const cards = [
        {
            label: "Total Users",
            value: users.length,
            sub: newThisMonth ? `+${newThisMonth} this month` : null,
            icon: (<svg className="h-8 w-8" viewBox="0 0 32 32" fill="#1a0a3c" aria-hidden="true"><circle cx="10" cy="10" r="4"/><circle cx="22" cy="10" r="4" opacity=".5"/><path d="M2 28c0-5 3.6-8 8-8s8 3 8 8"/><path d="M20 28c0-5 2.4-8 6-8" stroke="#1a0a3c" strokeWidth="1.5" fill="none" opacity=".5"/></svg>),
        },
        {
            label: "Pet Owners",
            value: users.filter((u) => u.role === "customer").length,
            color: "text-[#3b0f8c]",
            icon: (<svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" stroke="#3b0f8c" strokeWidth="2" aria-hidden="true"><circle cx="16" cy="10" r="5"/><path d="M6 28c0-5.5 4.5-9 10-9" strokeLinecap="round"/><path d="M23 22l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>),
        },
        {
            label: "Clinic Users",
            value: users.filter((u) => clinicRoles.includes(u.role)).length,
            color: "text-[#e87c1e]",
            icon: (<svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" stroke="#e87c1e" strokeWidth="2" aria-hidden="true"><circle cx="16" cy="10" r="5"/><path d="M6 28c0-5.5 4.5-9 10-9s10 3.5 10 9" strokeLinecap="round"/><path d="M16 18v-4M14 16h4" strokeLinecap="round"/></svg>),
        },
        {
            label: "Active Users",
            value: active,
            color: "text-green-500",
            icon: (<svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#22c55e"/><path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>),
        },
        {
            label: "Inactive Users",
            value: users.length - active,
            color: "text-gray-400",
            icon: (<svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="13" stroke="#9ca3af" strokeWidth="2"/><path d="m9 9 14 14" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/></svg>),
        },
    ];

    return (<div className="paw-admin-users-stats grid grid-cols-2 gap-4 md:grid-cols-5">
      {cards.map((c) => (<div key={c.label} className="paw-admin-user-stat flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex-shrink-0">{c.icon}</div>
          <div>
            <p className={`text-xs font-semibold ${c.color ?? "text-gray-500"}`}>{c.label}</p>
            <p className="text-2xl font-extrabold text-[#1a0a3c]">{c.value}</p>
            {c.sub && <p className="text-[10px] text-gray-400">{c.sub}</p>}
          </div>
        </div>))}
    </div>);
}
