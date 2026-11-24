import { useState } from "react";
import { CalendarIcon } from "../../shared/dashboard/Icons";
import { pawLogo } from "../../shared/dashboard/assets";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import { formatPetAge } from "../../shared/dashboard/petAge";
import { RecordStatusBadge, selectLabel } from "../../shared/dashboard/recordStatus";
import PatientRecordModal, { formatDate } from "./PatientRecordModal";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Status line for a card in "Today's Operation", from the medical record. */
function operationStatus(appointment) {
    if (appointment.visitStatus === "Ongoing") return { label: "On Going", tone: "text-green-500" };
    if (appointment.visitStatus === "Completed") return { label: "Completed", tone: "text-violet-600" };
    return { label: `Up Coming · ${appointment.time}`, tone: "text-orange-400" };
}

function EmptyState({ children }) {
    return <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{children}</p>;
}

function StatCard({ icon, label, value, note, noteTone = "text-[#e87c1e]", onDetails }) {
    const empty = !value;
    return (<div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
      {icon}
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-4xl font-extrabold text-[#1a0a3c] tabular-nums">{value ?? 0}</p>
        <p className={`text-xs font-semibold mt-0.5 ${empty ? "text-gray-400" : noteTone}`}>{empty ? "No data yet" : note}</p>
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
 * Veterinarian home: live numbers and lists from the database
 * (DashboardController::veterinarianProps / vetHomeStats). Every section has an empty state.
 */
export default function VetHomeSection({ username, stats = {}, appointments = [], patients = [], onNavigate, onSelectRecord, selectingId }) {
    const [viewing, setViewing] = useState(null); // { petId, recordId }
    const today = appointments.filter((a) => a.day === stats.today);
    const tomorrow = appointments.filter((a) => a.day === stats.tomorrow);
    // Diagnoses in progress (any day), newest visit first.
    const active = patients.flatMap((p) => p.visits.filter((v) => v.recordStatus === "Ongoing").map((v) => ({ patient: p, record: v })));

    const viewingPatient = viewing ? patients.find((p) => p.id === viewing.petId) : null;
    const viewingRecord = viewingPatient?.visits.find((v) => v.id === viewing.recordId) ?? null;
    const openAppointment = (a) => a.medicalRecordId && setViewing({ petId: a.petId, recordId: a.medicalRecordId });
    const select = (record) => {
        setViewing(null);
        onSelectRecord?.(record);
    };

    const newPatients = stats.newPatientsThisMonth ?? 0;
    const operations = stats.operationsToday ?? 0;

    return (<div className="flex flex-col gap-6">
      {viewingPatient && <PatientRecordModal patient={viewingPatient} appointment={viewingRecord} onClose={() => setViewing(null)} onSelect={onSelectRecord && select} selectingId={selectingId}/>}

      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Hi, Doc {username}!</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon={<img src={pawLogo} alt="" className="w-12 h-12 object-contain flex-shrink-0"/>} label="Total Patients" value={stats.totalPatients} note={newPatients > 0 ? `+${newPatients} new this month` : "No new patients this month"} noteTone={newPatients > 0 ? "text-[#e87c1e]" : "text-gray-400"} onDetails={() => onNavigate?.("records")}/>
        <StatCard icon={<CalendarIcon color="#5b21b6"/>} label="Appointments" value={stats.upcomingAppointments} note={`${stats.appointmentsToday ?? 0} today`} noteTone="text-gray-500" onDetails={() => onNavigate?.("appointments")}/>
        <StatCard icon={<svg className="w-12 h-12 flex-shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="8" y="4" width="32" height="40" rx="3" stroke="#9ca3af" strokeWidth="2.5" fill="none"/>
              <path d="M16 14h16M16 20h16M16 26h10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 36h6M24 33l3 3-3 3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>} label="# of Operation Today" value={operations} note={`${stats.ongoingToday ?? 0} ongoing · ${stats.completedToday ?? 0} completed`} noteTone="text-green-600"/>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Operation */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[#3b0f8c] font-bold text-lg">Today&apos;s Operation</h2>
            <span className="text-xs font-semibold text-gray-400">{plural(today.length, "appointment")}</span>
          </div>
          {today.length === 0
            ? <EmptyState>No data: no confirmed appointments today.</EmptyState>
            : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {today.map((a) => {
                    const status = operationStatus(a);
                    const age = formatPetAge({ dateOfBirth: a.petDateOfBirth, age: a.petAge });
                    return (<div key={a.id} className={`border rounded-xl p-4 flex items-center gap-3 ${a.isEmergency ? "border-red-200 bg-red-50/40" : "border-gray-200"}`}>
                    <PetAvatar name={a.pet} photo={a.photo}/>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold mb-0.5 ${status.tone}`}>{a.isEmergency ? "Emergency · " : ""}{status.label}</p>
                      <p className="font-extrabold text-[#1a0a3c] text-sm leading-tight truncate">{a.pet}</p>
                      <p className="text-gray-500 text-xs truncate">{[a.breed, a.type].filter(Boolean).join(" · ")}</p>
                      {age && <p className="text-gray-400 text-xs">{age}</p>}
                      <button type="button" onClick={() => openAppointment(a)} disabled={!a.medicalRecordId} className="text-paw-blue text-xs font-medium mt-1 hover:underline cursor-pointer disabled:cursor-default disabled:text-gray-400 disabled:no-underline">
                        View Details
                      </button>
                    </div>
                  </div>);
                })}
            </div>)}
        </div>

        {/* Next Day Appointment */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" color="#3b0f8c"/>
              <span className="text-[#3b0f8c] font-bold text-sm">Next Day Appointment</span>
            </div>
            <button type="button" onClick={() => onNavigate?.("appointments")} className="text-paw-blue text-xs font-medium hover:underline cursor-pointer">
              See more &gt;
            </button>
          </div>
          {tomorrow.length === 0
            ? <EmptyState>No data: no confirmed appointments tomorrow.</EmptyState>
            : (<div className="flex flex-col gap-5">
              {tomorrow.slice(0, 3).map((a) => (<div key={a.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <PetAvatar name={a.pet} photo={a.photo} size="lg"/>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#1a0a3c] text-base leading-tight truncate">{a.pet}</p>
                      <p className="text-gray-500 text-xs truncate">{[a.breed, a.type].filter(Boolean).join(" · ")}</p>
                    </div>
                  </div>
                  <DateTimeLines date={a.date} time={a.time}/>
                  <button type="button" onClick={() => openAppointment(a)} disabled={!a.medicalRecordId} className="w-full bg-paw-blue hover:bg-paw-blue-dark text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50">
                    View Appointment Details
                  </button>
                </div>))}
              {tomorrow.length > 3 && (<button type="button" onClick={() => onNavigate?.("appointments")} className="text-center text-xs font-semibold text-paw-blue hover:underline cursor-pointer">
                  +{tomorrow.length - 3} more tomorrow
                </button>)}
            </div>)}
        </div>
      </div>

      {/* Active diagnoses (Ongoing records, any day) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-[#3b0f8c] font-bold text-lg">Active Diagnoses</h2>
          <span className="text-xs font-semibold text-gray-400">{plural(active.length, "record")} in progress</span>
        </div>
        {active.length === 0
            ? <EmptyState>No data: no diagnoses in progress. Press “Select” on a record to start one.</EmptyState>
            : (<ul className="divide-y divide-gray-100">
              {active.map(({ patient, record }) => (<li key={record.id} className="flex flex-wrap items-center gap-3 py-3">
                  <PetAvatar name={patient.name} photo={patient.photo} size="sm"/>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#1a0a3c]">
                      {patient.name}
                      <RecordStatusBadge status={record.recordStatus}/>
                      {record.isEmergency && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Emergency</span>}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {record.recordNumber} · {record.type} · {formatDate(record.startsAt, { month: "short", day: "numeric", year: "numeric" })}
                      {record.veterinarian ? ` · Dr. ${record.veterinarian}` : ""}
                    </p>
                  </div>
                  {onSelectRecord && (<button type="button" onClick={() => onSelectRecord(record)} disabled={selectingId === record.id} className="rounded-lg bg-paw-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-paw-blue-dark disabled:opacity-60">
                      {selectLabel(record.recordStatus)}
                    </button>)}
                </li>))}
            </ul>)}
      </div>
    </div>);
}
