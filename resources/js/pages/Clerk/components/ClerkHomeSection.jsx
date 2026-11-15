import { useState } from "react";
import { CalendarIcon } from "../../shared/dashboard/Icons";
import { pawLogo } from "../../shared/dashboard/assets";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import ClerkAppointmentDetailsModal from "./ClerkAppointmentDetailsModal";

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

/** Status line for a card in "Today's Operation". */
function operationStatus(appointment) {
    if (appointment.status === "Pending") return { label: "Pending approval", tone: "text-amber-500" };
    if (appointment.hasStarted) return { label: "On Going", tone: "text-green-500" };
    return { label: `Up Next · ${appointment.time}`, tone: "text-orange-400" };
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function StatCard({ icon, label, value, note, noteTone = "text-[#e87c1e]", onDetails }) {
    return (<div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
      {icon}
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-4xl font-extrabold text-[#1a0a3c] tabular-nums">{value}</p>
        {note && <p className={`${noteTone} text-xs font-semibold mt-0.5`}>{note}</p>}
        <button type="button" onClick={onDetails} className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline cursor-pointer">
          View Details
        </button>
      </div>
    </div>);
}

function EmptyState({ children }) {
    return <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{children}</p>;
}

/**
 * Clerk home: live numbers and lists built from the clerk's appointment data
 * (DashboardController::clerkProps / clerkHomeStats).
 */
export default function ClerkHomeSection({ username, appointments = [], stats = {}, onNavigate }) {
    const [selectedId, setSelectedId] = useState(null);
    // Look the appointment up on every render so Accept/Reject in the modal shows fresh data.
    const selected = appointments.find((a) => a.id === selectedId) ?? null;

    const active = appointments.filter((a) => a.status !== "Rejected");
    const today = active.filter((a) => a.day === stats.today);
    const tomorrow = active.filter((a) => a.day === stats.tomorrow);
    const newPatients = stats.newPatientsThisMonth ?? 0;
    const pending = stats.pendingAppointments ?? 0;

    return (<div className="flex flex-col gap-6">
      {selected && <ClerkAppointmentDetailsModal key={selected.id} appointment={selected} onClose={() => setSelectedId(null)}/>}

      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Hi, {username}!</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard icon={<img src={pawLogo} alt="" className="w-12 h-12 object-contain flex-shrink-0"/>} label="Total Patients" value={stats.totalPatients ?? 0} note={`+${newPatients} new this month`} onDetails={() => onNavigate?.("records")}/>
        <StatCard icon={<CalendarIcon color="#5b21b6"/>} label="Appointments" value={stats.upcomingAppointments ?? 0} note={pending > 0 ? `${pending} Pending` : "No pending requests"} noteTone={pending > 0 ? "text-red-500" : "text-gray-400"} onDetails={() => onNavigate?.("appointments")}/>
        <StatCard icon={<svg className="w-12 h-12 flex-shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="8" y="4" width="32" height="40" rx="3" stroke="#9ca3af" strokeWidth="2.5" fill="none"/>
              <path d="M16 14h16M16 20h16M16 26h10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 36h6M24 33l3 3-3 3" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>} label="Upcoming Billing" value={stats.upcomingBilling ?? 0} note={`${peso.format(stats.downPaymentsReceived ?? 0)} down payments received`} noteTone="text-gray-500" onDetails={() => onNavigate?.("billings")}/>
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
            ? <EmptyState>No appointments scheduled for today.</EmptyState>
            : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {today.map((a) => {
                    const status = operationStatus(a);
                    return (<div key={a.id} className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <PetAvatar name={a.pet} photo={a.photo}/>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold mb-0.5 ${status.tone}`}>{status.label}</p>
                      <p className="font-extrabold text-[#1a0a3c] text-sm leading-tight truncate">{a.pet}</p>
                      <p className="text-gray-500 text-xs truncate">{[a.breed, a.type].filter(Boolean).join(" · ")}</p>
                      {a.petAge != null && <p className="text-gray-400 text-xs">{a.petAge} {a.petAge === 1 ? "year" : "years"} old</p>}
                      <button type="button" onClick={() => setSelectedId(a.id)} className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline cursor-pointer">
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
            <button type="button" onClick={() => onNavigate?.("appointments")} className="text-[#3b0f8c] text-xs font-medium hover:underline cursor-pointer">
              See more &gt;
            </button>
          </div>
          {tomorrow.length === 0
            ? <EmptyState>No appointments for tomorrow yet.</EmptyState>
            : (<div className="flex flex-col gap-5">
              {tomorrow.slice(0, 3).map((a) => (<div key={a.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <PetAvatar name={a.pet} photo={a.photo} size="lg"/>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#1a0a3c] text-base leading-tight truncate">{a.pet}</p>
                      <p className="text-gray-500 text-xs truncate">{[a.breed, a.owner].filter(Boolean).join(" · ")}</p>
                      {a.status === "Pending" && <p className="text-xs font-semibold text-amber-500">Pending approval</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-gray-600 pl-1">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <path d="M16 2v4M8 2v4M3 10h18"/>
                      </svg>
                      {a.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2" strokeLinecap="round"/>
                      </svg>
                      {a.time}
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedId(a.id)} className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer">
                    View Appointment Details
                  </button>
                </div>))}
              {tomorrow.length > 3 && (<button type="button" onClick={() => onNavigate?.("appointments")} className="text-center text-xs font-semibold text-[#3b0f8c] hover:underline cursor-pointer">
                  +{tomorrow.length - 3} more tomorrow
                </button>)}
            </div>)}
        </div>
      </div>
    </div>);
}
