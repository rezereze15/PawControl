import { useEffect } from "react";
import { leanPhoto } from "../../shared/dashboard/assets";

export function formatAppointmentDate(startsAt, options = { weekday: "long", month: "long", day: "numeric", year: "numeric" }) {
    const date = new Date(startsAt);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, options).format(date);
}

export function formatAppointmentTime(startsAt) {
    const date = new Date(startsAt);
    return Number.isNaN(date.getTime()) ? "Time unavailable" : new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date);
}

export function appointmentStatusClass(status = "Pending") {
    const key = status.toLowerCase();
    if (["accepted", "confirmed"].includes(key)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (key === "rejected" || key === "cancelled") return "border-red-200 bg-red-50 text-red-700";
    return "border-amber-200 bg-amber-50 text-amber-800";
}

function AppointmentDetailsModal({ appointment, onClose }) {
    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return (
        <div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
        }}>
            <section role="dialog" aria-modal="true" aria-labelledby="appointment-details-title" className="paw-pet-modal paw-pet-details-modal">
                <header className="paw-pet-modal-header">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-700">Appointment details</p>
                        <h2 id="appointment-details-title" className="mt-1 text-2xl font-extrabold tracking-tight text-[#1a0a3c]">{appointment.serviceType || "Clinic visit"}</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close appointment details" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
                    </button>
                </header>

                <div className="paw-pet-modal-body">
                    <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-800 p-5 text-white">
                        <img src={appointment.photoUrl || leanPhoto} alt={`${appointment.pet} profile`} className="h-16 w-16 rounded-full border-2 border-white/80 object-cover shadow" />
                        <div className="min-w-0 flex-1">
                            <p className="text-lg font-bold">{appointment.pet}</p>
                            <p className="mt-0.5 text-sm text-violet-100">{[appointment.species, appointment.breed].filter(Boolean).join(" · ") || "Pet profile"}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${appointmentStatusClass(appointment.status)}`}>{appointment.status || "Pending"}</span>
                    </div>

                    <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Date</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-800">{formatAppointmentDate(appointment.startsAt)}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Time</dt>
                            <dd className="mt-1 text-sm font-semibold text-slate-800">{formatAppointmentTime(appointment.startsAt)}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Reference number</dt>
                            <dd className="mt-1 break-all text-sm font-semibold text-slate-800">{appointment.referenceNumber || "Not available"}</dd>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</dt>
                            <dd className="mt-1 text-sm font-semibold capitalize text-slate-800">{appointment.status || "Pending"}</dd>
                        </div>
                    </dl>

                    {appointment.proofUrl && <a href={appointment.proofUrl} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-between rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm font-semibold text-violet-800 transition hover:bg-violet-100">
                        <span>View uploaded proof of payment{appointment.proofIsPdf ? " (PDF)" : ""}</span>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M14 3h7v7M10 14 21 3M21 14v7H3V3h7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </a>}
                    {appointment.notes && <div className="mt-4 rounded-xl border border-slate-100 p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes for the clinic</h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{appointment.notes}</p>
                    </div>}
                    {appointment.rejectionReason && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">Reason provided by the clinic</h3>
                        <p className="mt-2 text-sm leading-6 text-red-800">{appointment.rejectionReason}</p>
                    </div>}
                </div>

                <footer className="paw-pet-modal-footer">
                    <button type="button" onClick={onClose} className="rounded-xl bg-[#3b0f8c] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/15 transition hover:bg-[#2d0a6e] focus:outline-none focus:ring-4 focus:ring-violet-200">Done</button>
                </footer>
            </section>
        </div>
    );
}

export default AppointmentDetailsModal;
