import { useMemo, useState } from "react";
import SearchField from "@/Components/SearchField";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import PatientRecordModal, { formatDate, formatTime } from "../components/PatientRecordModal";
import TablePagination, { paginate } from "@/Components/TablePagination";
import { RECORD_STATUSES, RecordStatusBadge, currentRecord, isTakenByOtherVet, selectLabel, statusRank } from "../../shared/dashboard/recordStatus";

const PAGE_SIZE = 10;
const control = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-paw-blue focus:outline-none";
const EMPTY_FILTERS = { search: "", species: "All", status: "All", service: "All", from: "", to: "" };

/** YYYY-MM-DD in the viewer's time zone, to compare with <input type="date"> values. */
function localDay(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

/** Species compared without case or spaces, so "cat" and "Cat" are one option. */
const speciesKey = (species) => String(species ?? "").trim().toLowerCase();
const speciesLabel = (key) => key.charAt(0).toUpperCase() + key.slice(1);

/** Booked service plus every service the vet recorded as given. */
function recordServices(record) {
    return [record.type, ...(record.services ?? []).map((s) => s.name)].filter(Boolean);
}

function Filter({ label, children, className = "" }) {
    return (<label className={`flex flex-col gap-1 text-xs text-gray-500 ${className}`}>
      {label}
      {children}
    </label>);
}

/**
 * Every pet with at least one medical record (created when the clerk accepts an appointment).
 * Used by vets and clerks. Status, service and date filters apply to individual records:
 * a pet is listed when at least one of its records matches.
 */
export default function PatientRecords({ patients = [], onSelectRecord, selectingId, currentVetId }) {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);

    const speciesOptions = useMemo(() => [...new Set(patients.map((p) => speciesKey(p.species)).filter(Boolean))].sort(), [patients]);
    const serviceOptions = useMemo(() => [...new Set(patients.flatMap((p) => p.visits.flatMap(recordServices)))].sort((a, b) => a.localeCompare(b)), [patients]);

    // Accept the dates in either order.
    const [from, to] = filters.from && filters.to && filters.from > filters.to ? [filters.to, filters.from] : [filters.from, filters.to];
    const recordFilterActive = filters.status !== "All" || filters.service !== "All" || Boolean(from || to);
    const isFiltered = recordFilterActive || filters.search.trim() !== "" || filters.species !== "All";

    const recordMatches = (record) => {
        if (filters.status !== "All" && record.recordStatus !== filters.status) return false;
        if (filters.service !== "All" && !recordServices(record).includes(filters.service)) return false;
        const day = localDay(record.startsAt);
        if (from && day < from) return false;
        if (to && day > to) return false;
        return true;
    };

    const query = filters.search.trim().toLowerCase();
    const filtered = patients
        .filter((p) => filters.species === "All" || speciesKey(p.species) === filters.species)
        .filter((p) => !query || [p.name, p.owner?.name, `ID-${String(p.id).padStart(4, "0")}`].some((f) => String(f ?? "").toLowerCase().includes(query)))
        .map((p) => ({ patient: p, matching: recordFilterActive ? p.visits.filter(recordMatches) : p.visits }))
        .filter(({ matching }) => matching.length > 0)
        // Default order: Selected, Upcoming, Ongoing, Completed (most recently seen first within each).
        .sort((a, b) => statusRank(a.patient.status) - statusRank(b.patient.status));

    const { currentPage, pageCount, rows } = paginate(filtered, page, PAGE_SIZE);
    const setFilter = (key) => (value) => {
        setFilters((current) => ({ ...current, [key]: value }));
        setPage(1); // Any filter change goes back to the first page.
    };
    const onChange = (key) => (event) => setFilter(key)(event.target.value);
    const selected = patients.find((p) => p.id === selectedId);

    return (<div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Pet Medical Records</h1>
        <p className="mt-1 text-sm text-gray-500">A record is created each time the clinic accepts an appointment.</p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-white px-6 py-4 shadow-sm">
        <Filter label="Search">
          <SearchField value={filters.search} onChange={setFilter("search")} placeholder="Search by pet name or owner name..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-paw-blue focus:outline-none"/>
        </Filter>
        <div className="flex flex-wrap items-end gap-4">
          <Filter label="Species">
            <select value={filters.species} onChange={onChange("species")} className={control}>
              <option value="All">All Species</option>
              {speciesOptions.map((option) => <option key={option} value={option}>{speciesLabel(option)}</option>)}
            </select>
          </Filter>
          <Filter label="Status">
            <select value={filters.status} onChange={onChange("status")} className={control}>
              <option value="All">All Statuses</option>
              {RECORD_STATUSES.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Filter>
          <Filter label="Service" className="min-w-[12rem]">
            <select value={filters.service} onChange={onChange("service")} className={control}>
              <option value="All">All Services</option>
              {serviceOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Filter>
          <Filter label="Visit date from">
            <input type="date" value={filters.from} onChange={onChange("from")} className={control}/>
          </Filter>
          <Filter label="to">
            <input type="date" value={filters.to} onChange={onChange("to")} className={control}/>
          </Filter>
          {isFiltered && (<button type="button" onClick={() => { setFilters(EMPTY_FILTERS); setPage(1); }} className="pb-2 text-sm font-medium text-paw-blue hover:text-paw-blue-dark">
              Reset filters
            </button>)}
        </div>
      </div>

      <div className="paw-list-card bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Pet Info", "Owner", "Species/Breed", "Last Visit", "Records", "Status", "Veterinarian", "Actions"].map((h) => <th key={h} className="px-5 py-4 text-left font-bold text-[#1a0a3c]">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (<tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                {patients.length === 0 ? "No data: no medical records yet." : "No records match these filters."}
              </td></tr>)}
            {rows.map(({ patient: p, matching }) => {
                // With record filters on, the action button works on a record that matches them.
                // An Upcoming record has no shortcut here: the vet must View it, then Select it.
                // Completed records are locked, so a pet with only those has View only.
                const record = currentRecord(matching);
                // Another vet's record: only they can work on it, so this vet just views it.
                const taken = record && isTakenByOtherVet(record, currentVetId);
                const showAction = onSelectRecord && record && record.recordStatus !== "Upcoming" && !taken;
                return (<tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <PetAvatar name={p.name} photo={p.photo} size="sm"/>
                    <div>
                      <p className="font-bold text-[#1a0a3c]">{p.name}</p>
                      <p className="text-xs text-gray-400">ID-{String(p.id).padStart(4, "0")}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#1a0a3c] text-sm">{p.owner?.name}</p>
                  <p className="text-gray-400 text-xs">{p.owner?.email}</p>
                  <p className="text-gray-400 text-xs">{p.owner?.phone}</p>
                </td>
                <td className="px-5 py-4 text-gray-600"><p>{p.species}</p><p className="text-gray-400 text-xs">{p.breed}</p></td>
                <td className="px-5 py-4 text-gray-600"><p>{formatDate(p.lastVisitAt, { month: "long", day: "numeric", year: "numeric" })}</p><p className="text-gray-400 text-xs">{formatTime(p.lastVisitAt)}</p></td>
                <td className="px-5 py-4 text-gray-600">{recordFilterActive ? <span title="Records matching the filters, out of all this pet's records">{matching.length} of {p.visits.length}</span> : p.visits.length}</td>
                <td className="px-5 py-4"><RecordStatusBadge status={p.status}/></td>
                <td className="px-5 py-4 text-gray-600">{p.veterinarian ? `Dr. ${p.veterinarian}` : <span className="text-gray-400">—</span>}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setSelectedId(p.id)} className="rounded-lg border border-paw-blue px-3 py-1.5 text-xs font-semibold text-paw-blue hover:bg-paw-blue-soft">View record</button>
                    {showAction && (<button type="button" onClick={() => onSelectRecord(record)} disabled={selectingId === record.id} className="rounded-lg bg-paw-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-paw-blue-dark disabled:opacity-60">
                        {selectingId === record.id ? "Opening…" : selectLabel(record.recordStatus)}
                      </button>)}
                    {onSelectRecord && taken && <span className="self-center text-[11px] font-semibold text-gray-400">Dr. {record.veterinarian}&apos;s record · view only</span>}
                  </div>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
        </div>
        <TablePagination page={currentPage} pageCount={pageCount} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage}/>
      </div>
      {selected && <PatientRecordModal patient={selected} onClose={() => setSelectedId(null)} selectingId={selectingId} currentVetId={currentVetId} onSelect={onSelectRecord && ((record) => {
            // Selecting asks "Are you sure?" over this modal and keeps it open to show the new status.
            if (record.recordStatus !== "Upcoming") setSelectedId(null);
            onSelectRecord(record);
        })}/>}
    </div>);
}
