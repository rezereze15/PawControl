import { useEffect, useMemo, useRef, useState } from "react";
import SearchField from "@/Components/SearchField";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import PatientRecordModal, { formatDate, formatTime } from "../../Veterinarian/components/PatientRecordModal";

const PER_PAGE = 10;
const STATUSES = ["Ongoing", "Upcoming", "Completed", "No Visits"];
const STATUS_STYLES = {
    Ongoing: "border-emerald-400 bg-emerald-50 text-emerald-700",
    Upcoming: "border-amber-300 bg-amber-50 text-amber-600",
    Completed: "border-violet-400 bg-violet-100 text-violet-800",
    "No Visits": "border-gray-300 bg-gray-50 text-gray-500",
};
const LAST_VISIT_RANGES = [
    { id: "all", label: "All Time" },
    { id: "7", label: "Last 7 days", days: 7 },
    { id: "30", label: "Last 30 days", days: 30 },
    { id: "180", label: "Last 6 months", days: 180 },
    { id: "365", label: "Last year", days: 365 },
    { id: "never", label: "Never visited" },
];
const SORTS = {
    recent: { label: "Last visit (newest)", fn: (a, b) => (b.lastVisitAt ?? "").localeCompare(a.lastVisitAt ?? "") },
    oldest: { label: "Last visit (oldest)", fn: (a, b) => (a.lastVisitAt ?? "￿").localeCompare(b.lastVisitAt ?? "￿") },
    name: { label: "Pet name (A–Z)", fn: (a, b) => a.name.localeCompare(b.name) },
    id: { label: "Pet ID", fn: (a, b) => a.id - b.id },
};
const selectClass = "rounded-lg border border-gray-300 bg-white px-3! py-2! text-sm text-gray-700 focus:border-[#3b0f8c] focus:outline-none";

function CalendarIcon() {
    return (<svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>);
}
function ClockIcon() {
    return (<svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/></svg>);
}

/** Free-text values like "cat", "Cat " and "CAT" are the same option. */
const normalize = (value) => String(value ?? "").trim().toLowerCase();
const toLabel = (value) => normalize(value).replace(/\b\w/g, (c) => c.toUpperCase());
function uniqueOptions(values) {
    const keys = [...new Set(values.map(normalize).filter(Boolean))].sort();
    return keys.map((value) => ({ value, label: toLabel(value) }));
}

/** Page numbers with ellipses, e.g. [1, 2, 3, "…", 24]. */
function pageList(page, pageCount) {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const pages = new Set([1, pageCount, page - 1, page, page + 1]);
    if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
    if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p));
    const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
    return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ["…", p] : [p]));
}

function ActionsMenu({ onView }) {
    const [position, setPosition] = useState(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (!position) return;
        const close = (event) => !buttonRef.current?.parentElement.contains(event.target) && setPosition(null);
        const closeNow = () => setPosition(null);
        document.addEventListener("mousedown", close);
        window.addEventListener("scroll", closeNow, true);
        window.addEventListener("resize", closeNow);
        return () => {
            document.removeEventListener("mousedown", close);
            window.removeEventListener("scroll", closeNow, true);
            window.removeEventListener("resize", closeNow);
        };
    }, [position]);

    const toggle = () => {
        if (position) return setPosition(null);
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    };

    return (<div className="inline-block">
      <button ref={buttonRef} type="button" onClick={toggle} aria-label="Record actions" aria-expanded={Boolean(position)} className="rounded-lg p-2! text-[#1a0a3c] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
      </button>
      {position && (<div role="menu" style={{ position: "fixed", top: position.top, right: position.right }} className="z-50 w-40 overflow-hidden rounded-lg border border-gray-100 bg-white py-1! text-left shadow-lg">
          <button type="button" role="menuitem" onClick={() => { setPosition(null); onView(); }} className="block w-full px-4! py-2! text-left text-sm text-gray-700 hover:bg-violet-50 hover:text-[#3b0f8c]">View record</button>
        </div>)}
    </div>);
}

/** Owner view: every registered pet, filterable, with its medical record on demand. */
export default function PetMedicalRecords({ records = [] }) {
    const [search, setSearch] = useState("");
    const [species, setSpecies] = useState("All");
    const [status, setStatus] = useState("All");
    const [lastVisit, setLastVisit] = useState("all");
    const [sex, setSex] = useState("All");
    const [sort, setSort] = useState("recent");
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);

    const speciesOptions = useMemo(() => uniqueOptions(records.map((r) => r.species)), [records]);
    const sexOptions = useMemo(() => uniqueOptions(records.map((r) => r.sex)), [records]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        const range = LAST_VISIT_RANGES.find((r) => r.id === lastVisit);
        const cutoff = range?.days ? Date.now() - range.days * 86400000 : null;
        return records
            .filter((r) => (species === "All" || normalize(r.species) === species)
                && (status === "All" || r.status === status)
                && (sex === "All" || normalize(r.sex) === sex)
                && (lastVisit !== "never" || !r.lastVisitAt)
                && (cutoff === null || (r.lastVisitAt && new Date(r.lastVisitAt).getTime() >= cutoff))
                && (!query || [r.name, r.breed, r.species, r.owner?.name, r.owner?.email, r.owner?.phone, r.veterinarian, `ID-${String(r.id).padStart(4, "0")}`]
                    .some((f) => String(f ?? "").toLowerCase().includes(query))))
            .sort(SORTS[sort].fn);
    }, [records, search, species, status, sex, lastVisit, sort]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const currentPage = Math.min(page, pageCount);
    const rows = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    const selected = records.find((r) => r.id === selectedId);
    const isFiltered = search || species !== "All" || status !== "All" || lastVisit !== "all" || sex !== "All" || sort !== "recent";
    const extraFilterCount = (sex !== "All") + (sort !== "recent");

    // Any filter change goes back to the first page.
    const withReset = (setter) => (value) => { setter(value); setPage(1); };
    const reset = () => {
        setSearch(""); setSpecies("All"); setStatus("All"); setLastVisit("all"); setSex("All"); setSort("recent"); setPage(1);
    };

    return (<div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Pet Medical Records</h1>
        <p className="mt-1! text-sm text-gray-500">A list of all registered pets in the system.</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-white px-6! py-4! shadow-sm">
        <label className="flex min-w-[16rem] flex-[2] flex-col gap-1 text-xs text-gray-500">
          Search
          <SearchField value={search} onChange={withReset(setSearch)} placeholder="Search by pet name, owner, breed, veterinarian..." className="w-full rounded-lg border border-gray-300 py-2! pl-9! pr-4! text-sm focus:border-[#3b0f8c] focus:outline-none"/>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Species
          <select value={species} onChange={(e) => withReset(setSpecies)(e.target.value)} className={selectClass}>
            <option value="All">All Species</option>
            {speciesOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Status
          <select value={status} onChange={(e) => withReset(setStatus)(e.target.value)} className={selectClass}>
            <option value="All">All Status</option>
            {STATUSES.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Last Visit
          <select value={lastVisit} onChange={(e) => withReset(setLastVisit)(e.target.value)} className={selectClass}>
            {LAST_VISIT_RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => setShowFilters((open) => !open)} aria-expanded={showFilters} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3! py-2! text-sm text-gray-700 hover:bg-gray-50">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" strokeLinecap="round"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>
            Filters{extraFilterCount > 0 && <span className="rounded-full bg-[#3b0f8c] px-1.5! text-[10px] font-bold text-white">{extraFilterCount}</span>}
          </button>
        <button type="button" onClick={reset} disabled={!isFiltered} className="flex items-center gap-1.5 pb-2! text-sm text-blue-600 hover:underline disabled:cursor-default disabled:text-gray-400 disabled:no-underline">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Reset
        </button>
        {showFilters && (<div className="flex w-full flex-wrap items-end gap-4 border-t border-gray-100 pt-4!">
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              Sex
              <select value={sex} onChange={(e) => withReset(setSex)(e.target.value)} className={selectClass}>
                <option value="All">All</option>
                {sexOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-500">
              Sort by
              <select value={sort} onChange={(e) => withReset(setSort)(e.target.value)} className={selectClass}>
                {Object.entries(SORTS).map(([id, s]) => <option key={id} value={id}>{s.label}</option>)}
              </select>
            </label>
          </div>)}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {["Pet Info", "Owner", "Species/Breed", "Last Visit", "Status", "Veterinarian", "Actions"].map((h) => <th key={h} className={`px-5! py-4! font-bold text-[#1a0a3c] ${h === "Actions" ? "text-center" : "text-left"}`}>{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 && <tr><td colSpan={7} className="px-5! py-12! text-center text-gray-400">No pet records found.</td></tr>}
            {rows.map((r) => (<tr key={r.id} className="hover:bg-gray-50">
                <td className="px-5! py-3!">
                  <div className="flex items-center gap-3">
                    <PetAvatar name={r.name} photo={r.photo}/>
                    <div>
                      <p className="text-base font-bold text-[#1a0a3c]">{r.name}</p>
                      <p className="text-xs text-gray-500">ID-{String(r.id).padStart(4, "0")}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5! py-3! text-xs">
                  <p className="font-bold text-[#1a0a3c]">{r.owner?.name}</p>
                  {r.owner?.email && <p className="text-gray-600">{r.owner.email}</p>}
                  {r.owner?.phone && <p className="text-gray-600">{r.owner.phone}</p>}
                </td>
                <td className="px-5! py-3! text-xs text-gray-700">
                  <p>{r.species ? toLabel(r.species) : "—"}</p>
                  <p>{r.breed}</p>
                </td>
                <td className="px-5! py-3! text-xs text-gray-700">
                  {r.lastVisitAt ? (<>
                      <p className="flex items-center gap-1.5"><CalendarIcon/>{formatDate(r.lastVisitAt)}</p>
                      <p className="flex items-center gap-1.5"><ClockIcon/>{formatTime(r.lastVisitAt)}</p>
                    </>) : <span className="whitespace-nowrap text-gray-400">No visits yet</span>}
                </td>
                <td className="px-5! py-3!">
                  <span className={`inline-block whitespace-nowrap rounded-md border px-2! py-1! text-[11px] font-semibold ${STATUS_STYLES[r.status] ?? STATUS_STYLES["No Visits"]}`}>
                    {r.status === "Ongoing" ? "On Going" : r.status === "Upcoming" ? "Up Coming" : r.status}
                  </span>
                </td>
                <td className="px-5! py-3! text-xs text-gray-700">{r.veterinarian || <span className="text-gray-400">—</span>}</td>
                <td className="px-5! py-3! text-center">
                  <ActionsMenu onView={() => setSelectedId(r.id)}/>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          {filtered.length === 0 ? "Showing 0 entries" : `Showing ${(currentPage - 1) * PER_PAGE + 1} to ${(currentPage - 1) * PER_PAGE + rows.length} of ${filtered.length} entries`}
        </p>
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className="rounded-lg border border-gray-300 bg-white px-3! py-1.5! text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-default disabled:text-gray-300 disabled:hover:bg-white">&lt; Previous</button>
          {pageList(currentPage, pageCount).map((p, i) => (p === "…"
            ? <span key={`gap-${i}`} className="px-1! text-xs text-gray-400">…</span>
            : <button key={p} type="button" onClick={() => setPage(p)} aria-current={p === currentPage ? "page" : undefined} className={`h-8 w-8 rounded-lg text-xs font-semibold ${p === currentPage ? "bg-[#5b6cf9] text-white" : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"}`}>{p}</button>))}
          <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount} className="rounded-lg border border-gray-300 bg-white px-3! py-1.5! text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-default disabled:text-gray-300 disabled:hover:bg-white">Next &gt;</button>
        </nav>
      </div>

      {selected && <PatientRecordModal patient={selected} onClose={() => setSelectedId(null)}/>}
    </div>);
}
