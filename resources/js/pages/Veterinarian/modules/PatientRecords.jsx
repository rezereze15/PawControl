import { useMemo, useState } from "react";
import SearchField from "@/Components/SearchField";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import PatientRecordModal, { formatDate, formatTime } from "../components/PatientRecordModal";

/** Every pet that has at least one clerk-confirmed appointment. */
export default function PatientRecords({ patients = [] }) {
    const [search, setSearch] = useState("");
    const [species, setSpecies] = useState("All");
    const [selectedId, setSelectedId] = useState(null);
    const speciesOptions = useMemo(() => [...new Set(patients.map((p) => p.species).filter(Boolean))].sort(), [patients]);
    const query = search.trim().toLowerCase();
    const filtered = patients.filter((p) => (species === "All" || p.species === species)
        && (!query || [p.name, p.breed, p.species, p.owner?.name, p.owner?.email].some((f) => String(f ?? "").toLowerCase().includes(query))));
    const selected = patients.find((p) => p.id === selectedId);

    return (<div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Pet Medical Records</h1>
        <p className="mt-1 text-sm text-gray-500">Pets with confirmed appointments at the clinic.</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl bg-white px-6 py-4 shadow-sm">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-xs text-gray-500">
          Search
          <SearchField value={search} onChange={setSearch} placeholder="Search by pet name, owner, breed..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-[#3b0f8c] focus:outline-none"/>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Species
          <select value={species} onChange={(event) => setSpecies(event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#3b0f8c] focus:outline-none">
            <option value="All">All Species</option>
            {speciesOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        {(search || species !== "All") && <button type="button" onClick={() => { setSearch(""); setSpecies("All"); }} className="pb-2 text-xs font-semibold text-blue-600 hover:underline">Reset</button>}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {["Pet Info", "Owner", "Species/Breed", "Last Visit", "Visits", "Actions"].map((h) => <th key={h} className="px-5 py-4 text-left font-bold text-[#1a0a3c]">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">No pet records found.</td></tr>}
            {filtered.map((p) => (<tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <PetAvatar name={p.name} photo={p.photo} size="sm"/>
                    <div>
                      <p className="font-bold text-[#1a0a3c]">{p.name}</p>
                      <p className="text-xs text-gray-400">ID-{String(p.id).padStart(4, "0")}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs">
                  <p className="font-bold text-[#1a0a3c]">{p.owner?.name}</p>
                  <p className="text-gray-500">{p.owner?.email}</p>
                  <p className="text-gray-500">{p.owner?.phone}</p>
                </td>
                <td className="px-5 py-4 text-xs text-gray-600"><p>{p.species}</p><p>{p.breed}</p></td>
                <td className="px-5 py-4 text-xs text-gray-600"><p>{formatDate(p.lastVisitAt, { month: "long", day: "numeric", year: "numeric" })}</p><p>{formatTime(p.lastVisitAt)}</p></td>
                <td className="px-5 py-4 text-xs text-gray-600">{p.visits.length}</td>
                <td className="px-5 py-4">
                  <button type="button" onClick={() => setSelectedId(p.id)} className="rounded-lg border border-[#3b0f8c] px-3 py-1.5 text-xs font-semibold text-[#3b0f8c] hover:bg-violet-50">View record</button>
                </td>
              </tr>))}
          </tbody>
        </table>
      </div>
      {selected && <PatientRecordModal patient={selected} onClose={() => setSelectedId(null)}/>}
    </div>);
}
