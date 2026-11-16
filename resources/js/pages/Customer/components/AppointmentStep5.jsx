import { formatPetAge } from "../../shared/dashboard/petAge";
import { leanPhoto } from "../../shared/dashboard/assets";

const DOWN_PAYMENT = 200;
const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

// One-time entrance for the review screen: a quick fade + 6px rise, staggered per section.
// Seen once per booking, so a little motion is fine; reduced-motion users get no movement.
const ENTER = "transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] starting:translate-y-1.5 starting:opacity-0 motion-reduce:starting:translate-y-0";
const delay = (ms) => ({ transitionDelay: `${ms}ms` });

/** Wizard step indexes, for the "Edit" links. */
const STEP = { owner: 0, pet: 1, schedule: 2, payment: 3 };

function Value({ children }) {
    return children ? <span className="font-semibold text-[#1a0a3c]">{children}</span> : <span className="text-gray-400">Not provided</span>;
}

/** Label / value list used inside the detail cards. */
function Details({ rows }) {
    return (<dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
      {rows.map(([label, value, wide]) => (<div key={label} className={`min-w-0 ${wide ? "col-span-2" : ""}`}>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-400">{label}</dt>
          <dd className="mt-0.5 break-words"><Value>{value}</Value></dd>
        </div>))}
    </dl>);
}

function Card({ title, icon, onEdit, style, children }) {
    return (<section className={`flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 ${ENTER}`} style={style}>
      <header className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#1a0a3c]">
          <span className="grid size-7 place-items-center rounded-full bg-[#f3eefe] text-[#3b0f8c]" aria-hidden="true">{icon}</span>
          {title}
        </h3>
        {onEdit && (<button type="button" onClick={onEdit} className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-paw-blue transition-colors hover:bg-paw-blue-soft focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#ffbb50]">
            Edit
          </button>)}
      </header>
      {children}
    </section>);
}

const Icon = {
    person: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>,
    paw: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="6" cy="10" rx="2.2" ry="2.8"/><ellipse cx="10" cy="6" rx="2.2" ry="2.8"/><ellipse cx="14" cy="6" rx="2.2" ry="2.8"/><ellipse cx="18" cy="10" rx="2.2" ry="2.8"/><path d="M12 11c-3.3 0-6 3.4-6 6.2 0 2 1.7 2.8 3.2 2.3 1-.3 1.8-.8 2.8-.8s1.8.5 2.8.8c1.5.5 3.2-.3 3.2-2.3 0-2.8-2.7-6.2-6-6.2z"/></svg>,
    card: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20" strokeLinecap="round"/></svg>,
    calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/></svg>,
    clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2" strokeLinecap="round"/></svg>,
    file: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>,
};

/**
 * Booking step 5: review everything before submitting. A "ticket" with the visit,
 * detail cards (each with Edit → jump back to that step), and what happens next.
 */
function AppointmentStep5({ owner, pets = [], data, processing, onBack, onDone, onEdit }) {
    const pet = pets.find((option) => String(option.id) === String(data.pet_id));
    const when = data.selected_date && data.selected_time ? new Date(`${data.selected_date}T${data.selected_time}`) : null;
    const representative = [data.ar_first_name, data.ar_last_name].filter(Boolean).join(" ");
    const proof = data.proof_of_down_payment;
    const edit = (step) => (onEdit ? () => onEdit(step) : undefined);

    return (<div className="flex flex-col gap-5">
      {/* Ticket: the visit at a glance */}
      <section className={`relative overflow-hidden rounded-2xl bg-[#19043f] p-5 text-white sm:p-6 ${ENTER}`} style={delay(0)}>
        <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-[radial-gradient(closest-side,rgb(255_187_80/0.28),transparent)]" aria-hidden="true"/>
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img src={pet?.photoUrl || leanPhoto} alt="" className="size-16 flex-none rounded-full object-cover ring-2 ring-[#ffbb50] ring-offset-2 ring-offset-[#19043f]"/>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#ffbb50]">{data.service_type || "Service not selected"}</p>
              <p className="truncate text-2xl font-extrabold leading-tight">{pet?.name || "No pet selected"}</p>
              <p className="truncate text-sm text-white/70">{[pet?.species, pet?.breed].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl bg-white/8 px-4 py-3 sm:min-w-[230px]">
            {when ? (<>
                <p className="flex items-center gap-2 text-sm font-semibold"><span className="text-[#ffbb50]">{Icon.calendar}</span>{when.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
                <p className="flex items-center gap-2 text-sm font-semibold"><span className="text-[#ffbb50]">{Icon.clock}</span>{when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</p>
              </>) : <p className="text-sm text-white/70">Date and time not selected</p>}
            {onEdit && <button type="button" onClick={() => onEdit(STEP.schedule)} className="self-start cursor-pointer text-xs font-semibold text-[#ffbb50] underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#ffbb50]">Change date or service</button>}
          </div>
        </div>
        {data.notes && (<p className="relative mt-4 rounded-xl bg-white/8 px-4 py-3 text-sm text-white/85">
            <span className="mr-1 font-semibold text-white">Concern:</span>{data.notes}
          </p>)}
      </section>

      {/* Details */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card title="Owner" icon={Icon.person} onEdit={edit(STEP.owner)} style={delay(60)}>
          <Details rows={[
            ["Full name", owner?.name, true],
            ["Brought by", representative, true],
            ["Contact number", owner?.phone],
            ["Email", owner?.email],
            ["Address", owner?.address, true],
        ]}/>
        </Card>

        <Card title="Pet" icon={Icon.paw} onEdit={edit(STEP.pet)} style={delay(110)}>
          <Details rows={[
            ["Name", pet?.name],
            ["Species", pet?.species],
            ["Breed", pet?.breed, true],
            ["Age", pet && formatPetAge(pet, { suffix: false })],
            ["Sex", pet?.sex],
            ["Date of birth", pet?.dateOfBirth],
            ["Weight", pet?.weight == null ? null : `${pet.weight} kg`],
        ]}/>
        </Card>

        <Card title="Payment" icon={Icon.card} onEdit={edit(STEP.payment)} style={delay(150)}>
          <div className="flex items-baseline justify-between rounded-xl bg-[#fff7e8] px-4 py-3">
            <span className="text-xs font-semibold text-[#9a5b00]">Down payment</span>
            <span className="text-lg font-extrabold tabular-nums text-[#1a0a3c]">{peso.format(DOWN_PAYMENT)}</span>
          </div>
          <Details rows={[
            ["Reference number", data.reference_number && <span className="font-mono tracking-wide">{data.reference_number}</span>, true],
            ["Proof of payment", proof && <span className="inline-flex max-w-full items-center gap-1.5"><span className="flex-none text-[#3b0f8c]">{Icon.file}</span><span className="truncate">{proof.name}</span></span>, true],
        ]}/>
          <p className="text-xs leading-relaxed text-gray-500">Non-refundable and deducted from your total service fee.</p>
        </Card>
      </div>

      {/* What happens next */}
      <section className={`rounded-2xl border border-gray-200 bg-[#faf9fd] p-5 ${ENTER}`} style={delay(190)}>
        <h3 className="mb-3 text-sm font-bold text-[#1a0a3c]">What happens next</h3>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ["Confirm your booking", "Your request is sent to the clinic."],
            ["Clinic reviews your payment", "We check your proof of down payment."],
            ["Get your confirmation", owner?.email ? `We'll email ${owner.email}.` : "We'll email you once it's confirmed."],
        ].map(([title, text], index) => (<li key={title} className="flex items-start gap-3">
              <span className="grid size-6 flex-none place-items-center rounded-full bg-[#3b0f8c] text-xs font-bold text-white">{index + 1}</span>
              <span className="min-w-0 text-sm">
                <span className="block font-semibold text-[#1a0a3c]">{title}</span>
                <span className="block break-words text-xs text-gray-500">{text}</span>
              </span>
            </li>))}
        </ol>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="cursor-pointer rounded-full border-2 border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-600 transition-[background-color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-gray-50 active:scale-[0.97] motion-reduce:active:scale-100">
          Back
        </button>
        <button type="button" onClick={onDone} disabled={processing} aria-busy={processing} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-paw-blue px-8 py-3 text-sm font-bold text-white shadow-[0_10px_22px_-10px_rgb(25_4_63/0.7)] transition-[background-color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:enabled:bg-paw-blue-dark active:enabled:scale-[0.97] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#ffbb50] disabled:cursor-progress disabled:opacity-80 motion-reduce:active:enabled:scale-100">
          {processing && <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-[#ffbb50]" aria-hidden="true"/>}
          {processing ? "Booking…" : "Confirm booking"}
        </button>
      </div>
    </div>);
}
export default AppointmentStep5;
