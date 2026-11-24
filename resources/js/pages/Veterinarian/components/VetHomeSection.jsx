import { useState } from "react";
import { CalendarIcon } from "../../shared/dashboard/Icons";
import { pawLogo } from "../../shared/dashboard/assets";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import { formatPetAge } from "../../shared/dashboard/petAge";
import { selectLabel } from "../../shared/dashboard/recordStatus";
import PatientRecordModal, { formatDate, formatTime } from "./PatientRecordModal";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function EmptyState({ children }) {
    return <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{children}</p>;
}

function StatCard({ icon, label, value, note, noteTone = "text-[#e87c1e]", subNote, onDetails }) {
    const empty = !value;
    return (<div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
      {icon}
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-4xl font-extrabold text-[#1a0a3c] tabular-nums">{value ?? 0}</p>
        <p className={`text-xs font-semibold mt-0.5 ${empty ? "text-gray-400" : noteTone}`}>{empty ? "No data yet" : note}</p>
        {!empty && subNote && <p className="text-xs font-semibold mt-0.5 text-[#3b0f8c]">{subNote}</p>}
        {onDetails && (<button type="button" onClick={onDetails} className="text-paw-blue text-xs font-medium mt-1 hover:underline cursor-pointer">
            View Details
          </button>)}
      </div>
    </div>);
}

function DateTimeLines({ date, time }) {
    return (<div className="flex flex-col gap-1 text-xs text-gray-600 pl-1">
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        {date}
      </div>
      <div className="flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
        {time}
      </div>
    </div>);
}

/**
 * Veterinarian home: clinic numbers from the database (vetHomeStats), plus this vet's
 * own records: My Active Diagnoses (Ongoing) and My Selected Records (Selected).
 * Every section has an empty state.
 */
export default function VetHomeSection({ username, stats = {}, patients = [], onNavigate, onSelectRecord, selectingId, currentVetId }) {
    const [viewing, setViewing] = useState(null); // { petId, recordId }
    // Records this vet selected, soonest visit first.
    const mine = patients
        .flatMap((p) => p.visits.filter((v) => currentVetId != null && v.veterinarianId === currentVetId).map((v) => ({ patient: p, record: v })))
        .sort((a, b) => a.record.startsAt.localeCompare(b.record.startsAt));
    const myActive = mine.filter(({ record }) => record.recordStatus === "Ongoing");
    const mySelected = mine.filter(({ record }) => record.recordStatus === "Selected");

    const viewingPatient = viewing ? patients.find((p) => p.id === viewing.petId) : null;
    const viewingRecord = viewingPatient?.visits.find((v) => v.id === viewing.recordId) ?? null;
    const view = ({ patient, record }) => setViewing({ petId: patient.id, recordId: record.id });
    const select = (record) => {
        // Selecting asks "Are you sure?" over the modal and keeps it open to show the new status.
        if (record.recordStatus !== "Upcoming") setViewing(null);
        onSelectRecord?.(record);
    };

    const newPatients = stats.newPatientsThisMonth ?? 0;
    const operations = stats.operationsToday ?? 0;

    return (<div className="flex flex-col gap-6">
      {viewingPatient && <PatientRecordModal patient={viewingPatient} appointment={viewingRecord} onClose={() => setViewing(null)} onSelect={onSelectRecord && select} selectingId={selectingId} currentVetId={currentVetId}/>}

      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Hi, Doc {username}!</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon={<img src={pawLogo} alt="" className="w-12 h-12 object-contain flex-shrink-0"/>} label="Total Patients" value={stats.totalPatients} note={newPatients > 0 ? `+${newPatients} new this month` : "No new patients this month"} noteTone={newPatients > 0 ? "text-[#e87c1e]" : "text-gray-400"} onDetails={() => onNavigate?.("records")}/>
        <StatCard icon={<CalendarIcon color="#5b21b6"/>} label="Appointments" value={stats.upcomingAppointments} note={`${stats.appointmentsToday ?? 0} today`} noteTone="text-gray-500" onDetails={() => onNavigate?.("appointments")}/>
        <StatCard icon={<svg className="w-12 h-12 flex-shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="8" y="4" width="32" height="40" rx="3" stroke="#9ca3af" strokeWidth="2.5" fill="none"/>
              <path d="M16 14h16M16 20h16M16 26h10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 36h6M24 33l3 3-3 3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>} label="# of Operation Today" value={operations} note={`${stats.ongoingToday ?? 0} ongoing · ${stats.completedToday ?? 0} completed`} noteTone="text-green-600" subNote={`Mine today: ${stats.myOperationsToday ?? 0}`}/>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* My Active Diagnoses: this vet's Ongoing records */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[#3b0f8c] font-bold text-lg">My Active Diagnoses</h2>
            <span className="text-xs font-semibold text-gray-400">{plural(myActive.length, "record")} in progress</span>
          </div>
          {myActive.length === 0
            ? <EmptyState>You have no diagnoses in progress. Start one from My Selected Records.</EmptyState>
            : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myActive.map(({ patient, record }) => {
                    const age = formatPetAge(patient);
                    return (<div key={record.id} className={`border rounded-xl p-4 flex items-center gap-3 ${record.isEmergency ? "border-red-200 bg-red-50/40" : "border-gray-200"}`}>
                    <PetAvatar name={patient.name} photo={patient.photo}/>
                    <div className="min-w-0">
                      <p className="text-xs font-bold mb-0.5 text-green-500">{record.isEmergency ? "Emergency · " : ""}On Going</p>
                      <p className="font-extrabold text-[#1a0a3c] text-sm leading-tight truncate">{patient.name}</p>
                      <p className="text-gray-500 text-xs truncate">{[patient.breed, record.type].filter(Boolean).join(" · ")}</p>
                      <p className="text-gray-400 text-xs">{record.recordNumber} · {formatDate(record.startsAt, { month: "short", day: "numeric" })} {formatTime(record.startsAt)}{age ? ` · ${age}` : ""}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => onSelectRecord?.(record)} disabled={selectingId === record.id} className="rounded-lg bg-paw-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-paw-blue-dark disabled:opacity-60">
                          {selectLabel(record.recordStatus)}
                        </button>
                        <button type="button" onClick={() => view({ patient, record })} className="text-paw-blue text-xs font-medium hover:underline cursor-pointer">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>);
                })}
            </div>)}
        </div>

        {/* My Selected Records: selected by this vet, diagnosis not started yet */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" color="#3b0f8c"/>
              <span className="text-[#3b0f8c] font-bold text-sm">My Selected Records</span>
            </div>
            <button type="button" onClick={() => onNavigate?.("records")} className="text-paw-blue text-xs font-medium hover:underline cursor-pointer">
              See all &gt;
            </button>
          </div>
          {mySelected.length === 0
            ? <EmptyState>You haven&apos;t selected any records. Select one from Pet Medical Records.</EmptyState>
            : (<div className="flex flex-col gap-5">
              {mySelected.slice(0, 3).map(({ patient, record }) => (<div key={record.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <PetAvatar name={patient.name} photo={patient.photo} size="lg"/>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-extrabold text-[#1a0a3c] text-base leading-tight">
                        <span className="truncate">{patient.name}</span>
                        {record.isEmergency && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Emergency</span>}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{[patient.breed, record.type].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                  <DateTimeLines date={formatDate(record.startsAt, { month: "short", day: "numeric", year: "numeric" })} time={formatTime(record.startsAt)}/>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onSelectRecord?.(record)} disabled={selectingId === record.id} className="flex-1 bg-paw-blue hover:bg-paw-blue-dark text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50">
                      {selectingId === record.id ? "Opening…" : selectLabel(record.recordStatus)}
                    </button>
                    <button type="button" onClick={() => view({ patient, record })} className="rounded-lg border border-paw-blue px-3 py-2 text-xs font-semibold text-paw-blue hover:bg-paw-blue-soft cursor-pointer">
                      View
                    </button>
                  </div>
                </div>))}
              {mySelected.length > 3 && (<button type="button" onClick={() => onNavigate?.("records")} className="text-center text-xs font-semibold text-paw-blue hover:underline cursor-pointer">
                  +{mySelected.length - 3} more selected
                </button>)}
            </div>)}
        </div>
      </div>
    </div>);
}
