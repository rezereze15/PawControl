import { APPT_STEPS } from "./appointmentConstants";

interface AppointmentStepIndicatorProps {
  current: number
}

function AppointmentStepIndicator({ current }: AppointmentStepIndicatorProps) {
  return (
    <div className="mb-8 flex w-full items-start">
      {APPT_STEPS.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="relative flex flex-1 flex-col items-center">
            {i < APPT_STEPS.length - 1 && (
              <div
                className={`paw-step-connector absolute top-5 z-0 h-0.5 ${done ? 'bg-[#3b0f8c]' : 'bg-gray-300'}`}
                style={{ left: "calc(50% + 24px)", width: "calc(100% - 48px)" }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0
                ${
                  done
                    ? "bg-[#3b0f8c]"
                    : active
                      ? "bg-[#1a0a3c]"
                      : "bg-[#3b0f8c]"
                }`}
              >
                {done ? (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                  >
                    <path
                      d="M4 10l4 4 8-8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center max-w-[80px] ${
                  active ? "font-bold text-[#1a0a3c]" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AppointmentStepIndicator
