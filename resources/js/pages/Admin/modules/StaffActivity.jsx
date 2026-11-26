import { useMemo, useState } from "react";
import DataTable from "@/Components/DataTable";
import SearchField from "@/Components/SearchField";
import StatusBadge from "@/Components/StatusBadge";
import TablePagination, { paginate } from "@/Components/TablePagination";
import UserAvatar from "@/Components/UserAvatar";

/**
 * Admin → Staff Activity: who processed each payment, which vet handled each pet, and who
 * reviewed each booking (accountability). Read-only. Data comes from App\Support\StaffActivity.
 */

const PAGE_SIZE = 10;

// Formats 1500 as "₱1,500.00".
const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

const BADGE = "rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap";
const BADGE_COLORS = {
    Accepted: "border-green-400 bg-green-50 text-green-600",
    Completed: "border-green-400 bg-green-50 text-green-600",
    Rejected: "border-red-300 bg-red-50 text-red-600",
    "Emergency walk-in": "border-orange-300 bg-orange-50 text-orange-600",
    Ongoing: "border-blue-300 bg-blue-50 text-blue-600",
    Selected: "border-violet-300 bg-violet-50 text-violet-600",
};

function Badge({ children }) {
    return <StatusBadge className={`${BADGE} ${BADGE_COLORS[children] ?? "border-gray-300 bg-gray-50 text-gray-500"}`}>{children}</StatusBadge>;
}

function PetOwner({ row }) {
    return (<>
      <p className="font-semibold text-[#1a0a3c]">{row.pet}</p>
      <p className="mt-0.5 text-xs text-gray-500">{row.owner}</p>
    </>);
}

/** Round staff photo, or their first initial when they have none (the app's usual UserAvatar). */
function StaffAvatar({ name, photoUrl, size = "h-8 w-8" }) {
    return (<span className={`${size} flex-none overflow-hidden rounded-full`}>
      <UserAvatar photoUrl={photoUrl} name={name} textClassName="text-xs"/>
    </span>);
}

function Staff({ name, photoUrl }) {
    return (<span className="flex items-center gap-2.5 whitespace-nowrap">
      <StaffAvatar name={name} photoUrl={photoUrl}/>
      <span className="font-semibold text-[#1a0a3c]">{name}</span>
    </span>);
}

// One definition per tab: its rows, the table headings, and how each cell is drawn.
// `photoOf(staffId)` gives a staff member's photo link (null shows their initial).
const TABS = [
    {
        id: "payments",
        label: "Payments",
        noun: "payments",
        headers: ["Date & Time", "Receipt", "Pet / Owner", "Amount", "Processed by"],
        cells: (row, photoOf) => [
            <span className="whitespace-nowrap text-gray-600">{row.when}</span>,
            <><p className="whitespace-nowrap font-semibold text-[#1a0a3c]">{row.receipt}</p>{row.reference && <p className="mt-0.5 text-xs text-gray-500">Ref. {row.reference}</p>}</>,
            <PetOwner row={row}/>,
            <span className="whitespace-nowrap font-semibold text-[#1a0a3c]">{peso.format(row.amount)}</span>,
            <Staff name={row.staffName} photoUrl={photoOf(row.staffId)}/>,
        ],
    },
    {
        id: "petHandling",
        label: "Pet Handling",
        noun: "pet visits",
        headers: ["Visit Date", "Record", "Pet / Owner", "Service", "Status", "Veterinarian"],
        cells: (row, photoOf) => [
            <span className="whitespace-nowrap text-gray-600">{row.when}</span>,
            <span className="whitespace-nowrap font-semibold text-[#1a0a3c]">{row.record}</span>,
            <PetOwner row={row}/>,
            <span className="text-gray-600">{row.service}</span>,
            <Badge>{row.status}</Badge>,
            <Staff name={row.staffName} photoUrl={photoOf(row.staffId)}/>,
        ],
    },
    {
        id: "reviews",
        label: "Appointment Reviews",
        noun: "reviews",
        headers: ["Date & Time", "Pet / Owner", "Decision", "Reviewed by"],
        cells: (row, photoOf) => [
            <span className="whitespace-nowrap text-gray-600">{row.when}</span>,
            <><PetOwner row={row}/>{row.reference && <p className="mt-0.5 text-xs text-gray-400">Ref. {row.reference}</p>}</>,
            <><Badge>{row.decision}</Badge>{row.reason && <p className="mt-1.5 max-w-xs text-xs text-gray-500">Reason: {row.reason}</p>}</>,
            <Staff name={row.staffName} photoUrl={photoOf(row.staffId)}/>,
        ],
    },
];

// ─── Date range ───────────────────────────────────────────────────────────────
// Rows carry `day` as "YYYY-MM-DD" on the clinic's clock, so plain string comparison works.

const SELECT = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3b0f8c] focus:outline-none";

const RANGES = [
    { id: "today", label: "Today" },
    { id: "week", label: "This week" },
    { id: "month", label: "This month" },
    { id: "all", label: "All time" },
];

/** Today's date at the clinic (Philippines), whatever the viewer's computer timezone is. */
function clinicToday() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
}

const iso = (date) => date.toISOString().slice(0, 10);

/** [first day, last day] of the range, or null for "All time". Weeks run Monday to Sunday. */
function rangeBounds(rangeId, today = clinicToday()) {
    const [y, m, d] = today.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    if (rangeId === "today") return [today, today];
    if (rangeId === "week") {
        const monday = new Date(date);
        monday.setUTCDate(d - ((date.getUTCDay() + 6) % 7));
        const sunday = new Date(monday);
        sunday.setUTCDate(monday.getUTCDate() + 6);
        return [iso(monday), iso(sunday)];
    }
    if (rangeId === "month") return [iso(new Date(Date.UTC(y, m - 1, 1))), iso(new Date(Date.UTC(y, m, 0)))];
    return null;
}

// ─── Stat tiles (same look as the admin Home cards) ───────────────────────────

function StatTile({ icon, label, value }) {
    return (<div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
      <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-4xl font-extrabold text-[#1a0a3c] break-words">{value}</p>
      </div>
    </div>);
}

const ICON = { className: "w-10 h-10", viewBox: "0 0 24 24", fill: "none", stroke: "#374151", strokeWidth: 1.8 };

const collectedIcon = (<svg {...ICON}>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="12" cy="12" r="2.5"/>
    <path d="M6 10v4M18 10v4" strokeLinecap="round"/>
  </svg>);

const paymentsIcon = (<svg {...ICON}>
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" strokeLinejoin="round"/>
    <path d="M9 7h6M9 11h6M9 15h3" strokeLinecap="round"/>
  </svg>);

const petsIcon = (<svg {...ICON}>
    <circle cx="7" cy="8" r="2"/>
    <circle cx="12" cy="5.5" r="2"/>
    <circle cx="17" cy="8" r="2"/>
    <path d="M12 11c-3 0-5.5 3.5-5.5 6 0 1.7 1.3 2.5 2.8 2.5 1.2 0 1.8-.6 2.7-.6s1.5.6 2.7.6c1.5 0 2.8-.8 2.8-2.5 0-2.5-2.5-6-5.5-6Z" strokeLinejoin="round"/>
  </svg>);

const reviewsIcon = (<svg {...ICON}>
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
    <path d="m9 15 2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>);

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCard({ title, people, selectedId, onSelect, emptyText }) {
    return (<div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">{title}</h2>
      {people.length === 0 && <p className="text-sm text-gray-400">{emptyText}</p>}
      <ul className="flex flex-col gap-0.5">
        {people.map((p) => {
            const selected = p.id === selectedId;
            return (<li key={p.id}>
                <button type="button" onClick={() => onSelect(selected ? "" : p.id)} aria-pressed={selected} title={selected ? "Show all staff" : `Show only ${p.name}`} className={`flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-0.5 rounded-lg px-3 py-1.5 text-left transition-colors ${selected ? "bg-[#3b0f8c] text-white" : "hover:bg-gray-50"}`}>
                  <span className="flex items-center gap-2">
                    <StaffAvatar name={p.name} photoUrl={p.photoUrl} size="h-7 w-7"/>
                    <span className={`text-sm font-semibold ${selected ? "" : "text-[#1a0a3c]"}`}>
                      {p.name}{!p.active && <span className={`ml-1.5 text-xs font-normal ${selected ? "text-white/70" : "text-gray-400"}`}>(inactive)</span>}
                    </span>
                  </span>
                  <span className={`text-xs ${selected ? "text-white/80" : "text-gray-500"}`}>{p.summary}</span>
                </button>
              </li>);
        })}
      </ul>
    </div>);
}

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminStaffActivity({ activity = {} }) {
    const [tabId, setTabId] = useState("payments");
    const [page, setPage] = useState(1);
    const [range, setRange] = useState("month");
    const [staffId, setStaffId] = useState("");
    const [search, setSearch] = useState("");

    const staff = activity.staff ?? [];
    const tab = TABS.find((t) => t.id === tabId);
    const photoOf = (id) => staff.find((s) => s.id === id)?.photoUrl ?? null;

    // Every list limited to the chosen dates (the summary cards use these).
    const inRange = useMemo(() => {
        const bounds = rangeBounds(range);
        const keep = (row) => !bounds || (row.day >= bounds[0] && row.day <= bounds[1]);
        return Object.fromEntries(TABS.map((t) => [t.id, (activity[t.id] ?? []).filter(keep)]));
    }, [activity, range]);

    // ...then also limited to the chosen staff member and the search text (the tables use these).
    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        const keep = (row) => (!staffId || row.staffId === Number(staffId))
            && (!query || [row.pet, row.owner, row.receipt, row.reference, row.record, row.staffName]
                .some((field) => String(field ?? "").toLowerCase().includes(query)));
        return Object.fromEntries(TABS.map((t) => [t.id, inRange[t.id].filter(keep)]));
    }, [inRange, staffId, search]);

    const rows = filtered[tab.id];
    const { currentPage, pageCount, rows: pageRows } = paginate(rows, page, PAGE_SIZE);

    // Workload per person for the chosen dates. Inactive staff only appear if they did something.
    const summary = (role, describe) => staff
        .filter((s) => s.role === role)
        .map((s) => ({ ...s, ...describe(s.id) }))
        .filter((s) => s.active || s.total > 0);

    const clerks = summary("clerk", (id) => {
        const paid = inRange.payments.filter((r) => r.staffId === id);
        const reviewed = inRange.reviews.filter((r) => r.staffId === id).length;
        const collected = paid.reduce((sum, r) => sum + r.amount, 0);
        return { total: paid.length + reviewed, summary: `${plural(paid.length, "payment")} · ${peso.format(collected)} · ${plural(reviewed, "review")}` };
    });

    const vets = summary("veterinarian", (id) => {
        const handled = inRange.petHandling.filter((r) => r.staffId === id);
        const completed = handled.filter((r) => r.status === "Completed").length;
        return { total: handled.length, summary: `${plural(handled.length, "pet")} handled · ${completed} completed` };
    });

    // Any filter change starts again from page 1.
    const update = (setter) => (value) => {
        setter(value);
        setPage(1);
    };
    const switchTab = update(setTabId);
    const filtersActive = range !== "month" || staffId !== "" || search !== "";
    const clearFilters = () => {
        setRange("month");
        setStaffId("");
        setSearch("");
        setPage(1);
    };

    return (<div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Staff Activity</h1>
        <p className="mt-1 text-sm text-gray-500">See which clerk processed each payment, which veterinarian handled each pet, and who reviewed each booking</p>
      </div>

      <div className="rounded-xl bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <p id="activity-range-label" className="mb-1 block text-xs font-semibold text-gray-500">Date</p>
            {/* One click per range; the chosen one is filled purple, like the selected tab. */}
            <div role="group" aria-labelledby="activity-range-label" className="flex flex-wrap gap-2">
              {RANGES.map((r) => {
                const selected = r.id === range;
                return (<button key={r.id} type="button" aria-pressed={selected} onClick={() => update(setRange)(r.id)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${selected ? "border-[#3b0f8c] bg-[#3b0f8c] text-white" : "border-gray-300 bg-white text-gray-600 hover:border-[#3b0f8c] hover:text-[#1a0a3c]"}`}>
                    {r.label}
                  </button>);
            })}
            </div>
          </div>
          <div>
            <label htmlFor="activity-staff" className="mb-1 block text-xs font-semibold text-gray-500">Staff</label>
            <select id="activity-staff" value={staffId} onChange={(e) => update(setStaffId)(e.target.value === "" ? "" : Number(e.target.value))} className={SELECT}>
              <option value="">All staff</option>
              <optgroup label="Clerks">
                {staff.filter((s) => s.role === "clerk").map((s) => <option key={s.id} value={s.id}>{s.name}{s.active ? "" : " (inactive)"}</option>)}
              </optgroup>
              <optgroup label="Veterinarians">
                {staff.filter((s) => s.role === "veterinarian").map((s) => <option key={s.id} value={s.id}>{s.name}{s.active ? "" : " (inactive)"}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-gray-500">Search</label>
            <SearchField value={search} onChange={update(setSearch)} placeholder="Search pet, owner, receipt or reference..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]"/>
          </div>
          {filtersActive && (<button type="button" onClick={clearFilters} className="rounded-lg px-3 py-2 text-sm font-semibold text-[#3b0f8c] hover:bg-gray-50">
              Clear filters
            </button>)}
        </div>
      </div>

      {/* Totals for the current filters (dates, staff member and search). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatTile icon={collectedIcon} label="Collected" value={peso.format(filtered.payments.reduce((sum, r) => sum + r.amount, 0))}/>
        <StatTile icon={paymentsIcon} label="Payments Processed" value={filtered.payments.length.toLocaleString()}/>
        <StatTile icon={petsIcon} label="Pets Handled" value={filtered.petHandling.length.toLocaleString()}/>
        <StatTile icon={reviewsIcon} label="Bookings Reviewed" value={filtered.reviews.length.toLocaleString()}/>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SummaryCard title="Clerks" people={clerks} selectedId={staffId} onSelect={update(setStaffId)} emptyText="No clerk accounts yet."/>
        <SummaryCard title="Veterinarians" people={vets} selectedId={staffId} onSelect={update(setStaffId)} emptyText="No veterinarian accounts yet."/>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div role="tablist" aria-label="Staff activity type" className="flex flex-wrap gap-1 border-b border-gray-100 px-3 pt-3">
          {TABS.map((t) => {
            const selected = t.id === tabId;
            return (<button key={t.id} type="button" role="tab" aria-selected={selected} onClick={() => switchTab(t.id)} className={`-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${selected ? "border-[#3b0f8c] text-[#1a0a3c]" : "border-transparent text-gray-500 hover:text-[#1a0a3c]"}`}>
                {t.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${selected ? "bg-[#3b0f8c] text-white" : "bg-gray-100 text-gray-500"}`}>{filtered[t.id].length}</span>
              </button>);
        })}
        </div>

        <div role="tabpanel" className="overflow-x-auto">
          <DataTable className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {tab.headers.map((h) => <th key={h} className="whitespace-nowrap px-6 py-4 text-left text-sm font-bold text-[#1a0a3c]">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageRows.length === 0 && (<tr><td colSpan={tab.headers.length} className="px-6 py-12 text-center text-sm text-gray-400">{filtersActive ? `No ${tab.noun} match these filters.` : `No ${tab.noun} this month.`}</td></tr>)}
              {pageRows.map((row) => (<tr key={row.id} className="transition-colors hover:bg-gray-50">
                  {tab.cells(row, photoOf).map((cell, index) => <td key={tab.headers[index]} className="px-6 py-4 align-top">{cell}</td>)}
                </tr>))}
            </tbody>
          </DataTable>
        </div>

        <TablePagination page={currentPage} pageCount={pageCount} pageSize={PAGE_SIZE} total={rows.length} onPageChange={setPage} label={tab.noun}/>
      </div>
    </div>);
}
export default AdminStaffActivity;
