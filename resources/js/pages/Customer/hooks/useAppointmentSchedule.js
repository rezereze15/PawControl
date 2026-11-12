import { useMemo, useState } from "react";

export function useAppointmentSchedule() {
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const calendar = useMemo(() => {
        const year = calendarMonth.getFullYear();
        const monthIndex = calendarMonth.getMonth();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const cells = [
            ...Array(new Date(year, monthIndex, 1).getDay()).fill(null),
            ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
        ];
        const weeks = [];

        for (let index = 0; index < cells.length; index += 7) {
            weeks.push(cells.slice(index, index + 7).concat(Array(7).fill(null)).slice(0, 7));
        }

        return {
            year,
            monthIndex,
            monthLabel: calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
            weeks,
        };
    }, [calendarMonth]);

    const previousMonth = () => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1));
    const nextMonth = () => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1));

    return { ...calendar, previousMonth, nextMonth };
}
