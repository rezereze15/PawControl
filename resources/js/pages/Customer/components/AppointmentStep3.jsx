import { useEffect, useState } from "react";
import { useAppointmentSchedule } from "../hooks/useAppointmentSchedule";
import { ALL_TIMES, SERVICE_TYPES } from "./appointmentConstants";
function toTimeValue(label) {
    const [time, meridiem] = label.split(" ");
    let hour = Number(time.split(":")[0]);
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:00`;
}

function toDateValue(year, monthIndex, day) {
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function AppointmentStep3({ data, setData, errors, onNext, onBack }) {
    const { year, monthIndex, monthLabel, weeks, previousMonth, nextMonth } = useAppointmentSchedule();
    const [today] = useState(() => new Date());
    const [confirmedSlots, setConfirmedSlots] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(true);
    const [availabilityError, setAvailabilityError] = useState(false);
    const monthValue = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const todayValue = toDateValue(today.getFullYear(), today.getMonth(), today.getDate());
    const fieldError = (errors.app_date_time || errors.service_type || errors.notes) && <p className="mt-1 text-sm text-red-600" role="alert">{errors.app_date_time || errors.service_type || errors.notes}</p>;

    useEffect(() => {
        const controller = new AbortController();
        setAvailabilityLoading(true);
        setAvailabilityError(false);

        fetch(`/appointments/availability?month=${monthValue}`, {
            headers: { Accept: "application/json" },
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) throw new Error("Availability request failed.");
                return response.json();
            })
            .then((result) => setConfirmedSlots(result.confirmedSlots ?? []))
            .catch((error) => {
                if (error.name !== "AbortError") setAvailabilityError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setAvailabilityLoading(false);
            });

        return () => controller.abort();
    }, [monthValue]);

    const isSlotUnavailable = (date, time) =>
        confirmedSlots.includes(`${date}T${toTimeValue(time)}`);

    return (<div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-6 items-start">
        {/* Service */}
        <div className="flex flex-col gap-3">
          <label htmlFor="appointment-service" className="text-sm font-bold text-[#1a0a3c]">Service type <span className="text-red-500">*</span></label>
          <select id="appointment-service" value={data.service_type} onChange={(event) => setData("service_type", event.target.value)} aria-label="Service type" required className="w-full border border-gray-300 rounded-lg bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]">
            <option value="" disabled>Select a service</option>
            {SERVICE_TYPES.map((service) => <option key={service} value={service}>{service}</option>)}
          </select>
          <label htmlFor="appointment-notes" className="text-sm font-bold text-[#1a0a3c]">Pet concern or details <span className="text-gray-400">(optional)</span></label>
          <textarea id="appointment-notes" maxLength={500} value={data.notes} onChange={(event) => setData("notes", event.target.value)} placeholder="Tell us what your pet needs" aria-label="Pet concern or details" rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"/>
        </div>

        {/* Calendar */}
        <div className="border border-gray-300 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={previousMonth} aria-label="Previous month" disabled={year === today.getFullYear() && monthIndex <= today.getMonth()} className="px-2 text-[#3b0f8c] disabled:opacity-30">‹</button>
            <p className="text-center font-bold text-[#1a0a3c]">{monthLabel}</p>
            <button type="button" onClick={nextMonth} aria-label="Next month" className="px-2 text-[#3b0f8c]">›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (<div key={d} className="text-xs text-gray-500 font-medium py-1">
                {d}
              </div>))}
            {weeks.map((week, wi) => week.map((day, di) => {
            const dateValue = day ? toDateValue(year, monthIndex, day) : "";
            const dateUnavailable = day && ALL_TIMES.every((time) => isSlotUnavailable(dateValue, time));
            const disabled = !day || dateValue < todayValue || availabilityLoading || availabilityError || dateUnavailable;
            const selected = dateValue === data.selected_date;
            return (<button key={`${wi}-${di}`} disabled={disabled} aria-label={dateUnavailable ? `${dateValue}, unavailable` : dateValue} onClick={() => day && setData("selected_date", dateValue)} className={`text-xs py-1.5 rounded-full transition-colors ${!day
                ? ""
                : selected
                    ? "bg-[#3b0f8c] text-white font-bold"
                    : disabled ? "text-gray-300 cursor-not-allowed" : "hover:bg-purple-100 text-[#1a0a3c]"}`}>
                  {day || ""}
                </button>);
            }))}
          </div>
          {availabilityLoading && <p className="mt-2 text-xs text-gray-500">Checking availability…</p>}
          {availabilityError && <p className="mt-2 text-xs text-red-600" role="alert">Availability could not be loaded. Please try again.</p>}
        </div>

        {/* Time slots */}
        <div className="border border-gray-300 rounded-xl p-4">
          <p className="font-bold text-[#1a0a3c] mb-3 text-sm">Select Time</p>
          <div className="grid grid-cols-3 gap-2">
            {ALL_TIMES.map((t) => {
            const active = data.selected_time === toTimeValue(t);
            const unavailable = data.selected_date && isSlotUnavailable(data.selected_date, t);
            return (<button key={t} disabled={availabilityLoading || availabilityError || unavailable} aria-label={unavailable ? `${t}, unavailable` : t} onClick={() => setData("selected_time", toTimeValue(t))} className={`text-xs px-2 py-1.5 rounded-full border-2 font-semibold transition-colors ${unavailable
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : active
                        ? "border-orange-500 bg-orange-400 text-white"
                        : "border-[#3b0f8c] text-[#3b0f8c] hover:bg-purple-50"}`}>
                  {unavailable ? `${t} Unavailable` : t}
                </button>);
        })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#3b0f8c]" aria-hidden="true"/>
              Available
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-gray-300" aria-hidden="true"/>
              Unavailable
            </span>
          </div>
        </div>
      </div>

      {fieldError}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={onNext} disabled={availabilityLoading || availabilityError} className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors disabled:opacity-50">
          Next
        </button>
      </div>
    </div>);
}
export default AppointmentStep3;
