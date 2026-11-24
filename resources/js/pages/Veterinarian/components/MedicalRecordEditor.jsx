import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router, useForm } from "@inertiajs/react";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
import { RecordStatusBadge } from "../../shared/dashboard/recordStatus";
import { RecordFiles, formatDate, formatTime } from "./PatientRecordModal";
import ConfirmDialog from "./ConfirmDialog";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]";
const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
const ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";

const TEXT_FIELDS = [
    { key: "diagnosis", label: "Diagnosis", placeholder: "Findings and diagnosis" },
    { key: "treatment", label: "Treatment", placeholder: "Medication, dosage, procedures done" },
    { key: "suggestions", label: "Clinical suggestions", placeholder: "Home care, diet, follow-up schedule" },
    { key: "lab_results", label: "Lab results", placeholder: "CBC, urinalysis, X-ray findings…" },
    { key: "vet_notes", label: "Vet notes", placeholder: "Internal notes" },
];

function Section({ title, hint, children }) {
    return (<section className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div>
        <h3 className="text-base font-extrabold text-[#1a0a3c]">{title}</h3>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
      {children}
    </section>);
}

// Instant checks; the server (UpdateMedicalRecordRequest + stock lock) checks everything again.
function validate(data, available) {
    const errors = {};
    if (data.status === "Completed" && !data.diagnosis.trim()) errors.diagnosis = "Enter a diagnosis before marking the record as completed.";
    data.supplies.forEach((row, i) => {
        const quantity = Number(row.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) errors[`supplies.${i}.quantity`] = "Enter a whole number of at least 1.";
        else if (available(row.id) !== null && quantity > available(row.id)) errors[`supplies.${i}.quantity`] = `Only ${available(row.id)} available.`;
    });
    return errors;
}

/**
 * Veterinarian's diagnosis form for one medical record ("Select" opens it): findings,
 * services given, supplies used (deducted from stock on save) and attached files.
 */
export default function MedicalRecordEditor({ patient, record, options = {}, onClose }) {
    const services = options.services ?? [];
    const supplyOptions = options.supplies ?? [];
    // Only Ongoing records open here; Completed ones are locked (the server refuses changes too).
    const form = useForm({
        diagnosis: record.diagnosis ?? "",
        treatment: record.treatment ?? "",
        suggestions: record.suggestions ?? "",
        lab_results: record.labResults ?? "",
        vet_notes: record.vetNotes ?? "",
        services: (record.services ?? []).map((s) => s.id),
        supplies: (record.supplies ?? []).map((s) => ({ id: s.id, quantity: s.quantity })),
        status: "Ongoing",
    });
    const upload = useForm({ file: null });
    const fileInput = useRef(null);
    const [addSupplyId, setAddSupplyId] = useState("");
    const [removingFileId, setRemovingFileId] = useState(null);
    const [savingAs, setSavingAs] = useState(null);
    const [confirmingComplete, setConfirmingComplete] = useState(false);
    const closeConfirm = useCallback(() => setConfirmingComplete(false), []);
    const busy = form.processing || upload.processing;

    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && !busy && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [busy, onClose]);

    // Names / units for every supply that can appear: active ones, plus ones already on the record.
    const supplyInfo = useMemo(() => {
        const info = new Map(supplyOptions.map((s) => [s.id, s]));
        (record.supplies ?? []).forEach((s) => info.has(s.id) || info.set(s.id, { ...s, stock: 0, inactive: true }));
        return info;
    }, [supplyOptions, record.supplies]);
    const savedQuantity = useMemo(() => new Map((record.supplies ?? []).map((s) => [s.id, s.quantity])), [record.supplies]);
    // What this record can use: what's in stock plus what it already took when last saved.
    const available = (id) => {
        const info = supplyInfo.get(id);
        return info ? (info.stock ?? 0) + (savedQuantity.get(id) ?? 0) : null;
    };
    const serviceInfo = useMemo(() => {
        const info = new Map(services.map((s) => [s.id, s]));
        (record.services ?? []).forEach((s) => info.has(s.id) || info.set(s.id, { ...s, supplies: [], inactive: true }));
        return info;
    }, [services, record.services]);

    const setText = (field) => (event) => {
        form.setData(field, event.target.value);
        form.clearErrors(field);
    };

    /**
     * Ticking a service adds the supplies it normally uses. A supply that's already listed
     * (e.g. two services both use gauze) gets the amounts added together.
     * Unticking takes that service's amounts back off; a supply that reaches 0 is removed.
     */
    function toggleService(service) {
        const removing = form.data.services.includes(service.id);
        // This service's supplies and amounts (skipping inactive ones not on this record).
        const amounts = new Map((service.supplies ?? []).filter((s) => supplyInfo.has(s.id)).map((s) => [s.id, s.quantity]));
        const supplies = form.data.supplies
            .map((row) => amounts.has(row.id)
                ? { ...row, quantity: (Number(row.quantity) || 0) + (removing ? -amounts.get(row.id) : amounts.get(row.id)) }
                : row)
            .filter((row) => !(removing && amounts.has(row.id) && row.quantity <= 0));
        if (!removing) {
            amounts.forEach((quantity, id) => supplies.some((row) => row.id === id) || supplies.push({ id, quantity }));
        }
        form.setData((data) => ({
            ...data,
            services: removing ? data.services.filter((id) => id !== service.id) : [...data.services, service.id],
            supplies,
        }));
        // Rows can move or disappear, so old "row 2" errors may now point at the wrong row.
        form.clearErrors();
    }

    function addSupply() {
        const id = Number(addSupplyId);
        if (!id || form.data.supplies.some((row) => row.id === id)) return;
        form.setData("supplies", [...form.data.supplies, { id, quantity: 1 }]);
        setAddSupplyId("");
    }

    function setQuantity(index, value) {
        form.setData("supplies", form.data.supplies.map((row, i) => (i === index ? { ...row, quantity: value } : row)));
        form.clearErrors(`supplies.${index}.quantity`);
    }

    function removeSupply(index) {
        form.setData("supplies", form.data.supplies.filter((_, i) => i !== index));
        form.clearErrors();
    }

    /** Checks the form; completing asks for confirmation first, since it locks the record. */
    function save(status) {
        const data = { ...form.data, status };
        const errors = validate(data, available);
        form.clearErrors();
        if (Object.keys(errors).length > 0) {
            form.setError(errors);
            return;
        }
        if (status === "Completed") {
            setConfirmingComplete(true);
            return;
        }
        submit(status);
    }

    function submit(status) {
        const data = { ...form.data, status };
        form.transform(() => ({ ...data, supplies: data.supplies.map((row) => ({ id: row.id, quantity: Number(row.quantity) })) }));
        setSavingAs(status);
        form.put(`/medical-records/${record.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: onClose,
            // Server-side errors (e.g. stock ran out meanwhile) show in the form, so close the prompt.
            onError: () => setConfirmingComplete(false),
            onFinish: () => setSavingAs(null),
        });
    }

    function uploadFile(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (options.maxFileKb && file.size > options.maxFileKb * 1024) {
            upload.setError("file", `Files can be up to ${Math.round(options.maxFileKb / 1024)} MB.`);
            return;
        }
        upload.clearErrors();
        upload.transform(() => ({ file }));
        upload.post(`/medical-records/${record.id}/files`, { forceFormData: true, preserveScroll: true, preserveState: true });
    }

    function removeFile(file) {
        setRemovingFileId(file.id);
        router.delete(`/medical-records/${record.id}/files/${file.id}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setRemovingFileId(null),
        });
    }

    const addable = supplyOptions.filter((s) => !form.data.supplies.some((row) => row.id === s.id));
    const listErrors = Object.entries(form.errors).filter(([key]) => key.startsWith("services") || key === "status");

    return (<div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) onClose();
        }}>
      <section role="dialog" aria-modal="true" aria-labelledby="record-editor-title" className="paw-pet-modal" style={{ width: "min(100%, 860px)" }}>
        <header className="paw-pet-modal-header">
          <div className="flex min-w-0 items-center gap-3">
            <PetAvatar name={patient.name} photo={patient.photo} size="md"/>
            <div className="min-w-0">
              <h2 id="record-editor-title" className="flex flex-wrap items-center gap-2 text-xl font-extrabold text-[#1a0a3c]">
                <span className="truncate">{patient.name}</span>
                <RecordStatusBadge status={record.recordStatus}/>
              </h2>
              <p className="truncate text-xs text-gray-500">
                {record.recordNumber} · {record.type} · {formatDate(record.startsAt, { month: "short", day: "numeric", year: "numeric" })} {formatTime(record.startsAt)}
                {" · "}{[patient.species, patient.breed].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
          </button>
        </header>

        <div className="paw-pet-modal-body flex flex-col gap-5">
          {record.notes && (<p className={`rounded-xl px-4 py-3 text-sm ${record.isEmergency ? "bg-red-50 text-red-800" : "bg-violet-50 text-[#3b0f8c]"}`}>
              <span className="font-bold">{record.isEmergency ? "Emergency symptoms: " : "Owner's concern: "}</span>{record.notes}
            </p>)}

          <Section title="Medical Record Encoding">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {TEXT_FIELDS.map((field) => (<div key={field.key} className={field.key === "diagnosis" ? "md:col-span-2" : ""}>
                  <label htmlFor={`record-${field.key}`} className="mb-1 block text-xs font-bold text-[#1a0a3c]">{field.label}</label>
                  <textarea id={`record-${field.key}`} rows={field.key === "diagnosis" ? 4 : 3} maxLength={5000} className={input} value={form.data[field.key]} onChange={setText(field.key)} placeholder={field.placeholder}/>
                  {form.errors[field.key] && <p className="mt-1 text-xs text-red-600" role="alert">{form.errors[field.key]}</p>}
                </div>))}
            </div>
          </Section>

          <Section title="Services Given" hint="Ticking a service adds the supplies it normally uses below. Shared supplies add up; unticking takes them back off.">
            {serviceInfo.size === 0 ? <p className="text-sm text-gray-400">No active services. The admin can add them in Manage Services.</p> : (<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[...serviceInfo.values()].map((service) => {
                    const checked = form.data.services.includes(service.id);
                    return (<label key={service.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${checked ? "border-[#3b0f8c] bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <span className="flex min-w-0 items-center gap-2">
                        <input type="checkbox" checked={checked} onChange={() => toggleService(service)} className="h-4 w-4 accent-[#3b0f8c]"/>
                        <span className="truncate font-semibold text-[#1a0a3c]">{service.name}</span>
                        {service.inactive && <span className="text-[10px] text-gray-400">(inactive)</span>}
                      </span>
                      <span className="flex-shrink-0 text-xs text-gray-500">{peso.format(Number(service.price))}</span>
                    </label>);
                })}
              </div>)}
            {listErrors.map(([key, message]) => <p key={key} className="text-xs text-red-600" role="alert">{message}</p>)}
          </Section>

          <Section title="Medical Supplies Used" hint="Saving takes these amounts out of stock. Lowering or removing one puts it back.">
            {form.data.supplies.length > 0 && (<ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                {form.data.supplies.map((row, index) => {
                    const info = supplyInfo.get(row.id) ?? { name: `Supply #${row.id}` };
                    const error = form.errors[`supplies.${index}.quantity`] || form.errors[`supplies.${index}.id`];
                    return (<li key={row.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#1a0a3c]">{info.name}</p>
                        <p className="text-[11px] text-gray-400">{info.inactive ? "No longer active" : `${available(row.id)} ${info.unit ?? ""} available`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" min="1" step="1" inputMode="numeric" aria-label={`Quantity of ${info.name}`} className={`${input} w-24`} value={row.quantity} onChange={(event) => setQuantity(index, event.target.value)}/>
                        <span className="w-12 text-xs text-gray-500">{info.unit}</span>
                        <button type="button" onClick={() => removeSupply(index)} aria-label={`Remove ${info.name}`} className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                      {error && <p className="w-full text-xs text-red-600" role="alert">{error}</p>}
                    </li>);
                })}
              </ul>)}
            <div className="flex flex-wrap gap-2">
              <select value={addSupplyId} onChange={(event) => setAddSupplyId(event.target.value)} aria-label="Supply to add" className={`${input} min-w-0 flex-1`}>
                <option value="">{addable.length ? "Select a supply…" : "All active supplies added"}</option>
                {addable.map((s) => <option key={s.id} value={s.id} disabled={s.stock <= 0}>{s.name} — {s.stock} {s.unit} in stock{s.stock <= 0 ? " (out)" : ""}</option>)}
              </select>
              <button type="button" onClick={addSupply} disabled={!addSupplyId} className="rounded-lg border border-[#3b0f8c] px-4 py-2 text-sm font-semibold text-[#3b0f8c] hover:bg-violet-50 disabled:opacity-50">Add supply</button>
            </div>
          </Section>

          <Section title="Medical Images & Files" hint={`X-rays, ultrasound images, lab reports. JPG, PNG, WEBP or PDF, up to ${Math.round((options.maxFileKb ?? 10240) / 1024)} MB each. Files are saved right away.`}>
            <RecordFiles files={record.files ?? []} onRemove={removeFile} removingId={removingFileId}/>
            <div>
              <input ref={fileInput} type="file" accept={ACCEPT} onChange={uploadFile} className="sr-only" id="record-file-input"/>
              <button type="button" onClick={() => fileInput.current?.click()} disabled={upload.processing} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-400 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-[#3b0f8c] hover:text-[#3b0f8c] disabled:opacity-60">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {upload.processing ? `Uploading${upload.progress ? ` ${upload.progress.percentage}%` : "…"}` : "Upload file"}
              </button>
              {upload.errors.file && <p className="mt-1 text-xs text-red-600" role="alert">{upload.errors.file}</p>}
            </div>
          </Section>
        </div>

        <footer className="paw-pet-modal-footer">
          <button type="button" onClick={onClose} disabled={busy} className="mr-auto rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={() => save("Ongoing")} disabled={busy} className="rounded-lg border-2 border-[#3b0f8c] px-5 py-2 text-sm font-semibold text-[#3b0f8c] hover:bg-violet-50 disabled:opacity-60">
            {savingAs === "Ongoing" ? "Saving…" : "Save Progress"}
          </button>
          <button type="button" onClick={() => save("Completed")} disabled={busy} className="rounded-lg bg-green-700 px-6 py-2 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-60">
            {savingAs === "Completed" ? "Saving…" : "Save & Mark Completed"}
          </button>
        </footer>
      </section>

      {confirmingComplete && (<ConfirmDialog title="Mark this record as completed?" tone="green" icon="lock" confirmLabel="Yes, mark completed" busyLabel="Saving…" busy={savingAs === "Completed"} onConfirm={() => submit("Completed")} onCancel={closeConfirm}>
          <p>
            <strong className="text-[#1a0a3c]">{record.recordNumber}</strong> for <strong className="text-[#1a0a3c]">{patient.name}</strong> will be saved and <strong className="text-violet-700">locked</strong>.
          </p>
          <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg bg-gray-50 px-3 py-2.5 text-xs">
            <dt className="font-semibold text-[#1a0a3c]">Diagnosis</dt>
            <dd className="line-clamp-2 whitespace-pre-line text-gray-600">{form.data.diagnosis.trim()}</dd>
            <dt className="font-semibold text-[#1a0a3c]">Services</dt>
            <dd className="text-gray-600">{form.data.services.length || "None"}</dd>
            <dt className="font-semibold text-[#1a0a3c]">Supplies</dt>
            <dd className="text-gray-600">{form.data.supplies.length ? `${form.data.supplies.length} (taken from stock)` : "None"}</dd>
            <dt className="font-semibold text-[#1a0a3c]">Files</dt>
            <dd className="text-gray-600">{(record.files ?? []).length || "None"}</dd>
          </dl>
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 9v4M12 17v.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
            This can't be undone. After this, the record can only be viewed — no one can edit the diagnosis, services, supplies or files.
          </p>
        </ConfirmDialog>)}
    </div>);
}
