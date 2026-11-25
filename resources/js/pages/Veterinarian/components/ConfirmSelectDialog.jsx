import ConfirmDialog from "./ConfirmDialog";
import { formatDate, formatTime } from "./PatientRecordModal";

/**
 * "Select this record?" before a vet takes an Upcoming record. Two ways to say yes: select
 * and start the diagnosis now (opens the form), or just select it for later (it waits
 * in My Selected Records on the vet home).
 */
export default function ConfirmSelectDialog({ patient, record, busy, startingNow, onStart, onSelectOnly, onCancel }) {
    return (<ConfirmDialog title="Select this record?" icon="stethoscope" confirmLabel="Select & start diagnosis" secondaryLabel="Just select for later" busy={busy} busyAction={startingNow ? "confirm" : "secondary"} busyLabel={startingNow ? "Starting…" : "Selecting…"} onConfirm={onStart} onSecondary={onSelectOnly} onCancel={onCancel}>
      <p>It will be assigned to you. Other vets will see it as yours and can only view it.</p>
      <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
        <span className="font-semibold text-[#1a0a3c]">{patient?.name}</span>
        {record?.recordNumber ? ` · ${record.recordNumber}` : ""}
        <br/>
        {record?.type}{record?.startsAt ? ` · ${formatDate(record.startsAt, { month: "short", day: "numeric", year: "numeric" })}, ${formatTime(record.startsAt)}` : ""}
      </p>
    </ConfirmDialog>);
}
