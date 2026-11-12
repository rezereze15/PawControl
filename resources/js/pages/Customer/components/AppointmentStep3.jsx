import { useAppointmentSchedule } from "../hooks/useAppointmentSchedule";
import { ALL_TIMES, UNAVAILABLE_TIMES } from "./appointmentConstants";
function AppointmentStep3({ onNext, onBack }) {
    const { selectedDate, setSelectedDate, selectedTime, setSelectedTime, service, setService, weeks } = useAppointmentSchedule();
    return (<div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-6 items-start">
        {/* Service */}
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            Please input your pet's concern and the vaccination you'd like to schedule to
            help protect them from common diseases, or a checkup to monitor
            their overall health and well-being.
          </p>
          <input type="text" value={service} onChange={(event) => setService(event.target.value)} placeholder="Enter the service" aria-label="Service" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"/>
        </div>

        {/* Calendar */}
        <div className="border border-gray-300 rounded-xl p-4">
          <p className="text-center font-bold text-[#1a0a3c] mb-3">May 2026</p>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (<div key={d} className="text-xs text-gray-500 font-medium py-1">
                {d}
              </div>))}
            {weeks.map((week, wi) => week.map((day, di) => (<button key={`${wi}-${di}`} disabled={!day} onClick={() => day && setSelectedDate(day)} className={`text-xs py-1.5 rounded-full transition-colors ${!day
                ? ""
                : day === selectedDate
                    ? "bg-[#3b0f8c] text-white font-bold"
                    : "hover:bg-purple-100 text-[#1a0a3c]"}`}>
                  {day || ""}
                </button>)))}
          </div>
        </div>

        {/* Time slots */}
        <div className="border border-gray-300 rounded-xl p-4">
          <p className="font-bold text-[#1a0a3c] mb-3 text-sm">Select Time</p>
          <div className="grid grid-cols-3 gap-2">
            {ALL_TIMES.map((t) => {
            const taken = UNAVAILABLE_TIMES.includes(t);
            const active = selectedTime === t;
            return (<button key={t} disabled={taken} onClick={() => !taken && setSelectedTime(t)} className={`text-xs px-2 py-1.5 rounded-full border-2 font-semibold transition-colors ${taken
                    ? "border-orange-400 bg-orange-50 text-orange-600 cursor-not-allowed"
                    : active
                        ? "border-orange-500 bg-orange-400 text-white"
                        : "border-[#3b0f8c] text-[#3b0f8c] hover:bg-purple-50"}`}>
                  {t}
                </button>);
        })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-400" aria-hidden="true"/>
              Already selected
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#3b0f8c]" aria-hidden="true"/>
              Available
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={onNext} className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors">
          Next
        </button>
      </div>
    </div>);
}
export default AppointmentStep3;
