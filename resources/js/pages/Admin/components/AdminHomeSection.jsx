// Admin home screen: a summary of what the admin manages (users, services, medical supplies).
// All numbers come in as props from the backend (DashboardController). Until the backend
// sends them, the cards show a dash and the lists show an empty message.

const DASH = "—";

// Role keys stored in the users.role column -> label shown on screen.
const ROLE_LABELS = {
    customer: "Customer",
    clerk: "Clerk",
    veterinarian: "Veterinarian",
    owner: "Owner",
    admin: "Admin",
};

// Shows a dash until a real number arrives, otherwise formats it (e.g. 1,250).
function display(value) {
    return value === null || value === undefined ? DASH : Number(value).toLocaleString();
}

function formatDate(value) {
    if (!value)
        return "";
    return new Date(value).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({ icon, iconBg = "bg-gray-100", label, value, note, actionLabel = "Manage", onAction, highlight = false }) {
    return (<div className={`bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm ${highlight ? "ring-2 ring-orange-400" : ""}`}>
      <div className={`${iconBg} rounded-xl p-3 flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-4xl font-extrabold ${highlight ? "text-[#e87c1e]" : "text-[#1a0a3c]"}`}>
          {value}
        </p>
        {note && <p className="text-gray-400 text-xs font-semibold mt-0.5">{note}</p>}
        <button type="button" onClick={onAction} className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
          {actionLabel} &rarr;
        </button>
      </div>
    </div>);
}

function Panel({ title, children }) {
    return (<div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      <h2 className="text-[#3b0f8c] font-bold text-lg">{title}</h2>
      {children}
    </div>);
}

function EmptyState({ message }) {
    return <p className="text-sm text-gray-400 py-6 text-center">{message}</p>;
}

const usersIcon = (<svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <circle cx="16" cy="16" r="7" fill="#374151"/>
    <circle cx="32" cy="16" r="7" fill="#374151" opacity="0.6"/>
    <path d="M4 40c0-8 5-12 12-12s12 4 12 12" fill="#374151"/>
    <path d="M28 40c0-8 5-12 12-12" stroke="#374151" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
  </svg>);

const servicesIcon = (<svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round"/>
  </svg>);

const suppliesIcon = (<svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8">
    <path d="M9 3h6v4l3 3v10H6V10l3-3V3Z" strokeLinejoin="round"/>
    <path d="M9 7h6M12 11v6M9 14h6" strokeLinecap="round"/>
  </svg>);

const lowStockIcon = (<svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="#e87c1e" strokeWidth="1.8">
    <path d="M12 3 2 20h20L12 3Z" strokeLinejoin="round"/>
    <path d="M12 10v4M12 17h.01" strokeLinecap="round"/>
  </svg>);

function AdminHomeSection({ username, stats = {}, usersByRole = [], recentUsers = [], lowStockSupplies = [], onNavigate, }) {
    const go = (section) => onNavigate?.(section);

    // Turn [{ role: "clerk", count: 3 }, ...] into { clerk: 3, ... } for quick lookup.
    const roleCounts = Object.fromEntries(usersByRole.map((r) => [r.role, r.count]));
    const hasRoleData = usersByRole.length > 0;
    const maxRoleCount = Math.max(1, ...usersByRole.map((r) => r.count));

    const hasLowStock = (stats.lowStockCount ?? 0) > 0;

    return (<div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
        Hi, {username}!
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={usersIcon} label="Total Users" value={display(stats.totalUsers)} note={`${display(stats.activeUsers)} active`} onAction={() => go("users")}/>
        <StatCard icon={servicesIcon} label="Active Services" value={display(stats.activeServices)} onAction={() => go("services")}/>
        <StatCard icon={suppliesIcon} label="Medical Supplies" value={display(stats.totalSupplies)} onAction={() => go("supplies")}/>
        <StatCard icon={lowStockIcon} iconBg="bg-orange-100" label="Low Stock Alerts" value={display(stats.lowStockCount)} actionLabel="View" highlight={hasLowStock} onAction={() => go("supplies")}/>
      </div>

      {/* Detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Panel title="Users by Role">
          <div className="flex flex-col gap-3">
            {Object.entries(ROLE_LABELS).map(([role, label]) => {
            const count = roleCounts[role] ?? 0;
            return (<div key={role} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-gray-600 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3b0f8c] rounded-full" style={{ width: `${(count / maxRoleCount) * 100}%` }}/>
                  </div>
                  <span className="w-8 text-right font-bold text-[#1a0a3c]">
                    {hasRoleData ? count : DASH}
                  </span>
                </div>);
        })}
          </div>
        </Panel>

        <Panel title="Recently Added Users">
          {recentUsers.length === 0 ? (<EmptyState message="No users yet."/>) : (<ul className="flex flex-col divide-y divide-gray-100">
              {recentUsers.map((user) => (<li key={user.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-bold text-[#1a0a3c] text-sm truncate">{user.name}</p>
                    <p className="text-gray-500 text-xs">{ROLE_LABELS[user.role] ?? user.role}</p>
                  </div>
                  <span className="text-gray-400 text-xs flex-shrink-0">{formatDate(user.createdAt)}</span>
                </li>))}
            </ul>)}
        </Panel>

        <Panel title="Low Stock Supplies">
          {lowStockSupplies.length === 0 ? (<EmptyState message={stats.lowStockCount === undefined ? "No supply data yet." : "All supplies are well stocked."}/>) : (<ul className="flex flex-col divide-y divide-gray-100">
              {lowStockSupplies.map((supply) => (<li key={supply.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-bold text-[#1a0a3c] text-sm truncate">{supply.name}</p>
                    <p className="text-gray-400 text-xs">Reorder at {supply.reorderLevel}</p>
                  </div>
                  <span className="text-[#e87c1e] text-xs font-bold flex-shrink-0">
                    {supply.stockQuantity} {supply.unitOfMeasure} left
                  </span>
                </li>))}
            </ul>)}
        </Panel>
      </div>
    </div>);
}
export default AdminHomeSection;
