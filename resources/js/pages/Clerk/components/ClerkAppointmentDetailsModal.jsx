import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import { STATUS_BADGE } from "./AppointmentTable";

export const REJECTION_REASONS = [
    "Proof of payment is unclear / blurry",
    "Reference number does not match the payment",
    "Payment amount is incorrect",
    "Payment was not received",
    "Selected schedule is no longer available",
    "Other",
];

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

function Row({ label, children }) {
    return (<div className="grid grid-cols-[88px_1fr] items-start gap-3 py-1.5 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words font-semibold text-[#1a0a3c]">{children}</dd>
    </div>);
}

function ProofPreview({ appointment }) {
    const [failed, setFailed] = useState(false);

    if (!appointment.proofUrl) {
        return <p className="py-10 text-center text-sm text-gray-400">No proof of payment was uploaded.</p>;
    }

    return (<div className="flex flex-col items-center gap-3">
      {appointment.proofIsPdf ? (<div className="flex h-56 w-full flex-col items-center justify-center gap-2 rounded-xl bg-violet-50 text-violet-800">
          <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14h6M9 17h4" strokeLinecap="round"/></svg>
          <span className="text-sm font-semibold">PDF receipt</span>
        </div>) : failed ? (<p className="flex h-56 w-full items-center justify-center rounded-xl bg-red-50 px-4 text-center text-sm text-red-700">The image could not be loaded. Try “View full size”.</p>) : (<a href={appointment.proofUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
          <img src={appointment.proofUrl} alt={`Proof of payment for reference ${appointment.referenceNumber}`} onError={() => setFailed(true)} className="max-h-72 w-full rounded-xl bg-violet-50 object-contain"/>
        </a>)}
      <a href={appointment.proofUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#4a7fdc] px-6 py-2 text-xs font-bold text-white transition hover:bg-[#3a6cc5] focus:outline-none focus:ring-2 focus:ring-blue-300">
        View full size
      </a>
    </div>);
}

export default function ClerkAppointmentDetailsModal({ appointment, onClose }) {
    const accept = useForm({});
    const reject = useForm({ rejection_reason: "" });
    const [preset, setPreset] = useState("");
    const [details, setDetails] = useState("");
    const [confirmingReject, setConfirmingReject] = useState(false);
    const busy = accept.processing || reject.processing;
    const isPending = appointment.status === "Pending";

    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && !busy && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [busy, onClose]);

    const reason = [preset && preset !== "Other" ? preset : "", details.trim()].filter(Boolean).join(" — ");

    function submitAccept() {
        accept.post(`/appointments/${appointment.id}/accept`, { preserveScroll: true, onSuccess: onClose });
    }

    function submitReject() {
        if (reason.length < 5) {
            reject.setError("rejection_reason", "Please select a remark or describe why the appointment is rejected.");
            return;
        }
        reject.transform(() => ({ rejection_reason: reason }));
        reject.post(`/appointments/${appointment.id}/reject`, { preserveScroll: true, onSuccess: onClose });
    }

    const serverError = accept.errors.appointment || reject.errors.appointment;

    return (<div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) onClose();
        }}>
      <section role="dialog" aria-modal="true" aria-labelledby="clerk-appointment-title" className="paw-pet-modal paw-clerk-review-modal">
        <header className="paw-pet-modal-header">
          <h2 id="clerk-appointment-title" className="text-xl font-extrabold text-[#1a0a3c]">Appointment Details</h2>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close appointment details" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
          </button>
        </header>

        <div className="paw-pet-modal-body">
          <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <PetAvatar name={appointment.pet} photo={appointment.photo} size="lg"/>
                <div className="min-w-0">
                  <p className="text-lg font-extrabold text-[#1a0a3c]">{appointment.pet}</p>
                  <p className="text-xs text-gray-500">{[appointment.species, appointment.breed].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <dl>
                <Row label="Owner">{appointment.owner}<span className="block text-xs font-normal text-gray-500">{appointment.phone}</span></Row>
                {appointment.representative && appointment.representative !== appointment.owner && <Row label="Brought by">{appointment.representative}</Row>}
                <Row label="Date">{appointment.date}</Row>
                <Row label="Time">{appointment.time}</Row>
                <Row label="Type">{appointment.type}</Row>
                <Row label="Status">
                  <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_BADGE[appointment.status] ?? ""}`}>{appointment.status}</span>
                </Row>
                {appointment.notes && <Row label="Concern">{appointment.notes}</Row>}
              </dl>
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div>
                  <p className="text-xs text-gray-500">Payment amount</p>
                  <p className="text-base font-extrabold text-[#1a0a3c]">{peso.format(appointment.paymentAmount ?? 200)}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Reference no.</p>
                  <p className="break-all font-mono text-base font-extrabold text-[#1a0a3c]">{appointment.referenceNumber}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4">
              <h3 className="mb-3 text-sm font-bold text-[#1a0a3c]">Payment Proof</h3>
              <ProofPreview appointment={appointment}/>
              <p className="mt-3 text-center text-[11px] text-gray-400">Compare the reference number on the receipt with the one above.</p>
            </div>
          </div>

          {!isPending && (<div className={`mt-5 rounded-xl border p-4 text-sm ${appointment.status === "Rejected" ? "border-red-100 bg-red-50 text-red-800" : "border-blue-100 bg-blue-50 text-blue-800"}`}>
              <p className="font-bold">{appointment.status}{appointment.reviewedBy ? ` by ${appointment.reviewedBy}` : ""}</p>
              {appointment.rejectionReason && <p className="mt-1">Reason: {appointment.rejectionReason}</p>}
            </div>)}

          {isPending && (<div className="mt-5">
              <label htmlFor="rejection-preset" className="mb-2 block text-sm font-bold text-[#1a0a3c]">
                Remarks <span className="font-normal text-gray-400">(required only when rejecting)</span>
              </label>
              <select id="rejection-preset" value={preset} onChange={(event) => { setPreset(event.target.value); reject.clearErrors(); }} className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c] sm:w-80">
                <option value="">Select a reason…</option>
                {REJECTION_REASONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <textarea value={details} onChange={(event) => { setDetails(event.target.value); reject.clearErrors(); }} maxLength={400} rows={3} aria-label="Additional details for the pet owner" placeholder="Add details for the pet owner (e.g. which part of the receipt is unreadable)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]"/>
              {reject.errors.rejection_reason && <p className="mt-1 text-sm text-red-600" role="alert">{reject.errors.rejection_reason}</p>}
            </div>)}

          {serverError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{serverError}</p>}
        </div>

        <footer className="paw-pet-modal-footer">
          {isPending ? (confirmingReject ? (<>
                <span className="mr-auto text-sm text-gray-600">Reject and notify the owner?</span>
                <button type="button" onClick={() => setConfirmingReject(false)} disabled={busy} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Back</button>
                <button type="button" onClick={submitReject} disabled={busy} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{reject.processing ? "Rejecting…" : "Yes, reject"}</button>
              </>) : (<>
                <button type="button" onClick={() => {
                    if (reason.length < 5) {
                        reject.setError("rejection_reason", "Please select a remark or describe why the appointment is rejected.");
                        return;
                    }
                    setConfirmingReject(true);
                }} disabled={busy} className="mr-auto rounded-lg border-2 border-red-500 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">Reject Appointment</button>
                <button type="button" onClick={submitAccept} disabled={busy} className="rounded-lg border-2 border-green-700 bg-green-700 px-5 py-2 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60">{accept.processing ? "Accepting…" : "Confirm Payment & Accept"}</button>
              </>)) : (<button type="button" onClick={onClose} className="rounded-xl bg-[#3b0f8c] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2d0a6e]">Close</button>)}
        </footer>
      </section>
    </div>);
}
