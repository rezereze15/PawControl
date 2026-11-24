import ConfirmDialog from "./ConfirmDialog";
import { formatDate, formatTime } from "./PatientRecordModal";

/** "Are you sure?" prompt before a vet selects a medical record (Upcoming → Selected). */
export default function ConfirmSelectDialog({ patient, record, busy, onConfirm, onCancel }) {
    return (<ConfirmDialog confirmLabel="Yes, select" busyLabel="Selecting…" busy={busy} onConfirm={onConfirm} onCancel={onCancel}>
      <p>Select this medical record? It will be marked as <strong className="text-sky-700">Selected</strong> and assigned to you.</p>
      <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <span className="font-semibold text-[#1a0a3c]">{patient?.name}</span>
        {record?.recordNumber ? ` · ${record.recordNumber}` : ""}
        <br/>
        {record?.type}{record?.startsAt ? ` · ${formatDate(record.startsAt, { month: "short", day: "numeric", year: "numeric" })}, ${formatTime(record.startsAt)}` : ""}
      </p>
    </ConfirmDialog>);
}
