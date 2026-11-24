/**
 * Notification lists for the top-bar bell, one builder per role.
 *
 * There is no notifications table yet, so each list is derived from data the dashboard already
 * receives. Ids include the status, so when an appointment changes (e.g. Pending → Confirmed)
 * it shows up as a new unread notification. `section` is the dashboard section the bell opens.
 * When real notifications come from the backend, pass them to the layout in the same shape:
 * { id, title, body, when, tone: "info" | "success" | "warning" | "danger", section }.
 */

import { unitLabel } from "./units";

const localDay = (date = new Date()) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");

function formatWhen(iso) {
    if (!iso) return "";
    const date = new Date(iso);
    const today = localDay();
    const tomorrow = localDay(new Date(Date.now() + 86400000));
    const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const day = localDay(date);
    if (day === today) return `Today, ${time}`;
    if (day === tomorrow) return `Tomorrow, ${time}`;
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${time}`;
}

/** Clerk: booking requests waiting for review, and today's confirmed visits. */
export function clerkNotifications(appointments = [], today = localDay()) {
    const pending = appointments
        .filter((a) => a.status === "Pending")
        .map((a) => ({
            id: `appt-${a.id}-pending`,
            title: "New appointment request",
            body: `${a.owner} booked ${a.type} for ${a.pet}.`,
            when: formatWhen(a.startsAt),
            tone: "warning",
            section: "appointments",
        }));
    const todayConfirmed = appointments
        .filter((a) => a.status === "Confirmed" && a.day === today && !a.hasStarted)
        .map((a) => ({
            id: `appt-${a.id}-today`,
            title: `${a.pet} is coming in today`,
            body: `${a.type} at ${a.time} · ${a.owner}`,
            when: formatWhen(a.startsAt),
            tone: "info",
            section: "appointments",
        }));
    return [...pending, ...todayConfirmed];
}

/** Customer: decisions on their bookings, plus a reminder for visits in the next 24 hours. */
export function customerNotifications(appointments = []) {
    const now = Date.now();
    const list = [];
    appointments.forEach((a) => {
        const starts = new Date(a.startsAt).getTime();
        const service = a.serviceType || "appointment";
        if (a.status === "Confirmed" && starts >= now) {
            list.push({ id: `appt-${a.id}-confirmed`, title: "Appointment confirmed", body: `${a.pet}'s ${service} is confirmed.`, when: formatWhen(a.startsAt), tone: "success", section: "appointments" });
            if (starts - now <= 86400000) {
                list.push({ id: `appt-${a.id}-reminder`, title: "Upcoming visit reminder", body: `${a.pet}'s ${service} is within the next 24 hours.`, when: formatWhen(a.startsAt), tone: "info", section: "appointments" });
            }
        }
        if (a.status === "Rejected" && starts >= now) {
            list.push({ id: `appt-${a.id}-rejected`, title: "Appointment not approved", body: a.rejectionReason ? `${a.pet}'s ${service}: ${a.rejectionReason}` : `${a.pet}'s ${service} was not approved.`, when: formatWhen(a.startsAt), tone: "danger", section: "appointments" });
        }
    });
    return list.sort((x, y) => (x.tone === "info") - (y.tone === "info"));
}

/** Veterinarian: confirmed consultations scheduled for today. */
export function veterinarianNotifications(appointments = []) {
    const today = localDay();
    return appointments
        .filter((a) => localDay(new Date(a.startsAt)) === today)
        .map((a) => ({
            id: `appt-${a.id}-vet-today`,
            title: a.isEmergency ? `Emergency walk-in: ${a.pet}` : `Consultation today: ${a.pet}`,
            body: `${a.type} at ${a.time} · ${a.owner}`,
            when: formatWhen(a.startsAt),
            tone: a.isEmergency ? "danger" : "info",
            section: "appointments",
        }));
}

/** Admin: medical supplies at or below their reorder level. */
export function adminNotifications(lowStockSupplies = []) {
    return lowStockSupplies.map((s) => {
        const unit = s.unitOfMeasure ? ` ${unitLabel(s.unitOfMeasure, s.stockQuantity)}` : "";
        return {
            id: `supply-${s.id}-low-${s.stockQuantity}`,
            title: `Low stock: ${s.name}`,
            body: `${s.stockQuantity}${unit} left (reorder at ${s.reorderLevel}).`,
            tone: s.stockQuantity === 0 ? "danger" : "warning",
            section: "supplies",
        };
    });
}

/** Owner: pets with a visit at the clinic today. */
export function ownerNotifications(petRecords = []) {
    const today = localDay();
    return petRecords
        .filter((p) => p.status === "Ongoing")
        .map((p) => ({
            id: `pet-${p.id}-visit-${today}`,
            title: `${p.name} has a visit today`,
            body: p.owner?.name ? `Owner: ${p.owner.name}` : "",
            tone: "info",
            section: "records",
        }));
}
