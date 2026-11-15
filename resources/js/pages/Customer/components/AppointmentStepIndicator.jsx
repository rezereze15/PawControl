import { APPT_STEPS } from "./appointmentConstants";

/**
 * Wizard progress. Phones: numbered circles only, plus "Step 3 of 5 · <label>" below
 * (five labels don't fit side by side). From 640px up the labels sit under each circle.
 */
function AppointmentStepIndicator({ current }) {
    return (<div className="mb-6 sm:mb-8">
      <ol className="flex w-full items-start" aria-label="Booking progress">
        {APPT_STEPS.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (<li key={label} className="relative flex flex-1 flex-col items-center" aria-current={active ? "step" : undefined}>
            {i < APPT_STEPS.length - 1 && (<div className={`paw-step-connector absolute top-4 z-0 h-0.5 sm:top-5 ${done ? "bg-[#3b0f8c]" : "bg-gray-300"}`} style={{ left: "calc(50% + 20px)", width: "calc(100% - 40px)" }} aria-hidden="true"/>)}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`flex size-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white sm:size-10 sm:text-sm ${active ? "bg-[#1a0a3c] ring-4 ring-[#ffbb50]/40" : done ? "bg-[#3b0f8c]" : "bg-[#3b0f8c]/60"}`}>
                {done ? (<svg className="size-4 sm:size-5" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
                    <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>) : (i + 1)}
                <span className="sr-only">{label}{done ? " (done)" : ""}</span>
              </div>
              <span className={`mt-2 hidden max-w-[88px] text-center text-xs sm:block ${active ? "font-bold text-[#1a0a3c]" : "text-gray-500"}`} aria-hidden="true">
                {label}
              </span>
            </div>
          </li>);
        })}
      </ol>
      <p className="mt-3 text-center text-sm text-gray-500 sm:hidden">
        Step {current + 1} of {APPT_STEPS.length} · <span className="font-bold text-[#1a0a3c]">{APPT_STEPS[current]}</span>
      </p>
    </div>);
}
export default AppointmentStepIndicator;
