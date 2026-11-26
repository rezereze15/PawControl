import { useState } from "react";
import DataTable from "@/Components/DataTable";
import StatusBadge from "@/Components/StatusBadge";
import TablePagination, { paginate } from "@/Components/TablePagination";

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

function Staff({ name }) {
    return <span className="font-semibold text-[#1a0a3c]">{name}</span>;
}

// One definition per tab: its rows, the table headings, and how each cell is drawn.
const TABS = [
    {
        id: "payments",
        label: "Payments",
        noun: "payments",
        headers: ["Date & Time", "Receipt", "Pet / Owner", "Amount", "Processed by"],
        cells: (row) => [
            <span className="whitespace-nowrap text-gray-600">{row.when}</span>,
            <><p className="whitespace-nowrap font-semibold text-[#1a0a3c]">{row.receipt}</p>{row.reference && <p className="mt-0.5 text-xs text-gray-500">Ref. {row.reference}</p>}</>,
            <PetOwner row={row}/>,
            <span className="whitespace-nowrap font-semibold text-[#1a0a3c]">{peso.format(row.amount)}</span>,
            <Staff name={row.staffName}/>,
        ],
    },
    {
        id: "petHandling",
        label: "Pet Handling",
        noun: "pet visits",
        headers: ["Visit Date", "Record", "Pet / Owner", "Service", "Status", "Veterinarian"],
        cells: (row) => [
            <span className="whitespace-nowrap text-gray-600">{row.when}</span>,
            <span className="whitespace-nowrap font-semibold text-[#1a0a3c]">{row.record}</span>,
            <PetOwner row={row}/>,
            <span className="text-gray-600">{row.service}</span>,
            <Badge>{row.status}</Badge>,
            <Staff name={row.staffName}/>,
        ],
    },
    {
        id: "reviews",
        label: "Appointment Reviews",
        noun: "reviews",
        headers: ["Date & Time", "Pet / Owner", "Decision", "Reviewed by"],
        cells: (row) => [
            <span className="whitespace-nowrap text-gray-600">{row.when}</span>,
            <><PetOwner row={row}/>{row.reference && <p className="mt-0.5 text-xs text-gray-400">Ref. {row.reference}</p>}</>,
            <><Badge>{row.decision}</Badge>{row.reason && <p className="mt-1.5 max-w-xs text-xs text-gray-500">Reason: {row.reason}</p>}</>,
            <Staff name={row.staffName}/>,
        ],
    },
];

function AdminStaffActivity({ activity = {} }) {
    const [tabId, setTabId] = useState("payments");
    const [page, setPage] = useState(1);

    const tab = TABS.find((t) => t.id === tabId);
    const rows = activity[tab.id] ?? [];
    const { currentPage, pageCount, rows: pageRows } = paginate(rows, page, PAGE_SIZE);

    const switchTab = (id) => {
        setTabId(id);
        setPage(1);
    };

    return (<div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Staff Activity</h1>
        <p className="mt-1 text-sm text-gray-500">See which clerk processed each payment, which veterinarian handled each pet, and who reviewed each booking</p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div role="tablist" aria-label="Staff activity type" className="flex flex-wrap gap-1 border-b border-gray-100 px-3 pt-3">
          {TABS.map((t) => {
            const selected = t.id === tabId;
            return (<button key={t.id} type="button" role="tab" aria-selected={selected} onClick={() => switchTab(t.id)} className={`-mb-px rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${selected ? "border-[#3b0f8c] text-[#1a0a3c]" : "border-transparent text-gray-500 hover:text-[#1a0a3c]"}`}>
                {t.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${selected ? "bg-[#3b0f8c] text-white" : "bg-gray-100 text-gray-500"}`}>{(activity[t.id] ?? []).length}</span>
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
              {pageRows.length === 0 && (<tr><td colSpan={tab.headers.length} className="px-6 py-12 text-center text-sm text-gray-400">No {tab.noun} recorded yet.</td></tr>)}
              {pageRows.map((row) => (<tr key={row.id} className="transition-colors hover:bg-gray-50">
                  {tab.cells(row).map((cell, index) => <td key={tab.headers[index]} className="px-6 py-4 align-top">{cell}</td>)}
                </tr>))}
            </tbody>
          </DataTable>
        </div>

        <TablePagination page={currentPage} pageCount={pageCount} pageSize={PAGE_SIZE} total={rows.length} onPageChange={setPage} label={tab.noun}/>
      </div>
    </div>);
}
export default AdminStaffActivity;
