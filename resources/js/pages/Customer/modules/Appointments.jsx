import { useMemo, useState } from "react";
import AppointmentDetailsModal, { appointmentStatusClass, formatAppointmentDate, formatAppointmentTime } from "../components/AppointmentDetailsModal";
import { leanPhoto } from "../../shared/dashboard/assets";
import TablePagination, { paginate } from "@/Components/TablePagination";

function SearchIcon() {
    return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4" strokeLinecap="round"/></svg>;
}

function CustomerAppointments({ appointments = [], onBookAppointment }) {
    const [search, setSearch] = useState("");
    const [species, setSpecies] = useState("All Species");
    const [status, setStatus] = useState("All Status");
    const [dateRange, setDateRange] = useState("All Time");
    const [sortOrder, setSortOrder] = useState("Soonest first");
    const [pageSize, setPageSize] = useState(5);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openActionId, setOpenActionId] = useState(null);

    const speciesOptions = useMemo(() => [...new Set(appointments.map((appointment) => appointment.species).filter(Boolean))].sort(), [appointments]);
    const statusOptions = useMemo(() => [...new Set(appointments.map((appointment) => appointment.status || "Pending"))].sort(), [appointments]);

    const filteredAppointments = useMemo(() => {
        const now = Date.now();
        const matches = appointments.filter((appointment) => {
            const date = new Date(appointment.startsAt).getTime();
            const query = search.trim().toLowerCase();
            const matchesSearch = !query || [
                appointment.pet,
                appointment.species,
                appointment.breed,
                appointment.serviceType,
                appointment.referenceNumber,
            ].some((value) => String(value ?? "").toLowerCase().includes(query));
            const matchesSpecies = species === "All Species" || appointment.species === species;
            const matchesStatus = status === "All Status" || (appointment.status || "Pending") === status;
            const matchesDate = dateRange === "All Time"
                || (dateRange === "Upcoming" && date >= now && !["rejected", "cancelled"].includes((appointment.status || "").toLowerCase()))
                || (dateRange === "Past Visits" && date < now);

            return matchesSearch && matchesSpecies && matchesStatus && matchesDate;
        });

        matches.sort((a, b) => {
            const difference = new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
            return sortOrder === "Soonest first" ? difference : -difference;
        });
        return matches;
    }, [appointments, search, species, status, dateRange, sortOrder]);

    const { currentPage, pageCount, rows: pageAppointments } = paginate(filteredAppointments, page, pageSize);
    const activeFilterCount = Number(Boolean(search.trim())) + Number(species !== "All Species") + Number(status !== "All Status") + Number(dateRange !== "All Time");

    function updateFilter(setter, value) {
        setter(value);
        setPage(1);
    }

    function resetFilters() {
        setSearch("");
        setSpecies("All Species");
        setStatus("All Status");
        setDateRange("All Time");
        setSortOrder("Soonest first");
        setPageSize(5);
        setPage(1);
    }

    return (
        <div className="paw-appointments-table-page flex min-w-0 flex-col gap-6">
            {selectedAppointment && <AppointmentDetailsModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />}

            <header className="paw-appointment-history-heading flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.16em] text-violet-700">Your schedule</p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#1a0a3c]">Appointment history</h2>
                    <p className="mt-1 text-sm text-slate-500">Find a visit, check its status, and review its details.</p>
                </div>
                <span className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">{filteredAppointments.length} {filteredAppointments.length === 1 ? "appointment" : "appointments"}</span>
            </header>

            <section className="paw-appointment-filter-panel overflow-visible rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label="Search and filter appointments">
                <div className="paw-appointment-filter-grid grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="min-w-0 text-xs font-semibold text-slate-500">
                        Search
                        <span className="relative mt-1.5 block">
                            <input type="search" value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} placeholder="Pet name, service, or reference" className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-3 pr-9 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-3 focus:ring-violet-100" />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></span>
                        </span>
                    </label>

                    <label className="min-w-0 text-xs font-semibold text-slate-500">
                        Species
                        <select value={species} onChange={(event) => updateFilter(setSpecies, event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-100">
                            <option>All Species</option>{speciesOptions.map((option) => <option key={option}>{option}</option>)}
                        </select>
                    </label>

                    <label className="min-w-0 text-xs font-semibold text-slate-500">
                        Status
                        <select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-100">
                            <option>All Status</option>{statusOptions.map((option) => <option key={option}>{option}</option>)}
                        </select>
                    </label>

                    <label className="min-w-0 text-xs font-semibold text-slate-500">
                        Visit date
                        <select value={dateRange} onChange={(event) => updateFilter(setDateRange, event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal text-slate-700 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-100">
                            {["All Time", "Upcoming", "Past Visits"].map((option) => <option key={option}>{option}</option>)}
                        </select>
                    </label>

                    <div className="relative flex items-end">
                        <button type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)} className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition xl:w-auto ${filtersOpen ? "border-paw-blue bg-paw-blue-soft text-paw-blue" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}>
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h16M7 12h10m-7 5h4" strokeLinecap="round"/><circle cx="8" cy="7" r="1.5" fill="white"/><circle cx="15" cy="12" r="1.5" fill="white"/></svg> Filters {activeFilterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-paw-blue px-1.5 text-[10px] text-white">{activeFilterCount}</span>}
                        </button>
                        {filtersOpen && <div className="paw-pop absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Sort by</p>
                            {["Soonest first", "Newest first"].map((option) => <button key={option} type="button" onClick={() => { setSortOrder(option); setFiltersOpen(false); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${sortOrder === option ? "bg-paw-blue-soft font-semibold text-paw-blue" : "text-slate-600 hover:bg-slate-50"}`}>{option}</button>)}
                            <label className="mt-3 block border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">Rows per page
                                <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-normal text-slate-700">
                                    {[5, 10, 20].map((size) => <option key={size} value={size}>{size} entries</option>)}
                                </select>
                            </label>
                        </div>}
                    </div>

                    <button type="button" onClick={resetFilters} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-paw-blue transition hover:bg-paw-blue-soft hover:text-paw-blue-dark">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 11a8 8 0 1 1 2.3 5.7M4 5v6h6" strokeLinecap="round" strokeLinejoin="round"/></svg> Reset
                    </button>
                </div>
            </section>

            <div className="paw-appointment-results min-w-0" aria-label="Appointment results">
                <section className="paw-list-card bg-white rounded-xl shadow-sm" aria-label="Appointment table">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th scope="col" className="px-5 py-4 font-bold text-[#1a0a3c]">Date &amp; time</th>
                                <th scope="col" className="px-5 py-4 font-bold text-[#1a0a3c]">Pet information</th>
                                <th scope="col" className="px-5 py-4 font-bold text-[#1a0a3c]">Service</th>
                                <th scope="col" className="px-5 py-4 font-bold text-[#1a0a3c]">Status</th>
                                <th scope="col" className="px-5 py-4 font-bold text-[#1a0a3c]">Veterinarian</th>
                                <th scope="col" className="px-5 py-4 font-bold text-[#1a0a3c] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pageAppointments.map((appointment) => (
                                <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <p className="text-gray-600">{formatAppointmentDate(appointment.startsAt, { month: "short", day: "numeric", year: "numeric" })}</p>
                                        <p className="text-xs text-gray-400">{formatAppointmentTime(appointment.startsAt)}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={appointment.photoUrl || leanPhoto} alt={`${appointment.pet} profile`} className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                                            <div className="min-w-0"><p className="truncate font-bold text-[#1a0a3c]">{appointment.pet}</p><p className="truncate text-xs text-gray-400">{[appointment.species, appointment.breed].filter(Boolean).join(" · ") || "Pet"}</p></div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4"><span className="text-gray-600">{appointment.serviceType || "Clinic visit"}</span></td>
                                    <td className="px-5 py-4"><span className={`rounded-full border px-3 py-1 text-xs font-semibold ${appointmentStatusClass(appointment.status)}`}>{appointment.status || "Pending"}</span></td>
                                    <td className="whitespace-nowrap px-5 py-4 text-gray-400">Not assigned</td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="relative inline-block text-left">
                                            <button type="button" aria-label={`Actions for ${appointment.pet}'s appointment`} aria-expanded={openActionId === appointment.id} onClick={() => setOpenActionId(openActionId === appointment.id ? null : appointment.id)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300">
                                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>
                                            </button>
                                            {openActionId === appointment.id && <div className="paw-pop absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg">
                                                <button type="button" onClick={() => { setSelectedAppointment(appointment); setOpenActionId(null); }} className="w-full rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-paw-blue-soft hover:text-paw-blue">View details</button>
                                            </div>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pageAppointments.length === 0 && <tr><td colSpan="6" className="px-6 py-20 text-center">
                                <div className="mx-auto flex max-w-sm flex-col items-center">
                                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50 text-violet-700"><SearchIcon /></span>
                                    <h2 className="mt-3 font-bold text-slate-800">No appointments found</h2>
                                    <p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p>
                                    <button type="button" onClick={resetFilters} className="mt-3 text-sm font-bold text-paw-blue hover:underline">Clear all filters</button>
                                </div>
                            </td></tr>}
                        </tbody>
                    </table>
                </div>
                <TablePagination page={currentPage} pageCount={pageCount} pageSize={pageSize} total={filteredAppointments.length} onPageChange={setPage}/>
                </section>

            </div>
        </div>
    );
}

export default CustomerAppointments;
