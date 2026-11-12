import { useState } from "react";
import { MAY_2026 } from "../components/appointmentConstants";
export function useAppointmentSchedule() {
    const [selectedDate, setSelectedDate] = useState(15);
    const [selectedTime, setSelectedTime] = useState(null);
    const [service, setService] = useState("");
    const cells = [...Array(MAY_2026.startDay).fill(null), ...Array(MAY_2026.days).fill(0).map((_, index) => index + 1)];
    const weeks = [];
    for (let index = 0; index < cells.length; index += 7)
        weeks.push(cells.slice(index, index + 7).concat(Array(7).fill(null)).slice(0, 7));
    return { selectedDate, setSelectedDate, selectedTime, setSelectedTime, service, setService, weeks };
}
