import { useEffect } from "react";
import { useForm } from "@inertiajs/react";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]";

function Field({ id, label, required, error, hint, children }) {
    return (<div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-[#1a0a3c]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>);
}

// Instant checks in the browser, so the admin sees mistakes before anything is sent.
// The server (ManagedServiceRequest) still checks everything, because the browser can be bypassed.
function validate(data, otherNames) {
    const errors = {};
    const name = data.name.trim();
    const price = String(data.price).trim();

    if (!name) errors.name = "The service name is required.";
    else if (otherNames.includes(name.toLowerCase())) errors.name = "A service with this name already exists.";

    if (!price) errors.price = "The price is required.";
    else if (!/^\d+(\.\d{1,2})?$/.test(price)) errors.price = "Enter a valid amount with up to 2 decimals (e.g. 1500 or 1500.50).";
    else if (Number(price) > 99999999.99) errors.price = "The price is too high.";

    return errors;
}

/** Add (service = null) or edit a service. New services start as Active. */
export default function ServiceFormModal({ service, services = [], onClose }) {
    const editing = Boolean(service);
    const form = useForm({
        name: service?.name ?? "",
        description: service?.description ?? "",
        price: service?.price ?? "",
        // The supplies this service uses. Picking them comes in Step 11e; for now they are sent back unchanged.
        supplies: (service?.supplies ?? []).map(({ id, quantity }) => ({ id, quantity })),
    });
    // Names already used by OTHER services (lower-case), for the instant duplicate check.
    const otherNames = services.filter((s) => s.id !== service?.id).map((s) => s.name.toLowerCase());

    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && !form.processing && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [form.processing, onClose]);

    function submit(event) {
        event.preventDefault();
        const errors = validate(form.data, otherNames);
        form.clearErrors();
        if (Object.keys(errors).length > 0) {
            form.setError(errors);
            return; // Stop here: nothing is sent to the server.
        }
        const options = { preserveScroll: true, onSuccess: onClose };
        if (editing) form.put(`/admin/services/${service.id}`, options);
        else form.post("/admin/services", options);
    }

    const set = (field) => (event) => form.setData(field, event.target.value);

    return (<div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !form.processing) onClose();
        }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="service-form-title" className="paw-pet-modal" style={{ width: "min(100%, 520px)" }} noValidate>
        <header className="paw-pet-modal-header">
          <div>
            <h2 id="service-form-title" className="text-xl font-extrabold text-[#1a0a3c]">{editing ? "Edit Service" : "Add New Service"}</h2>
            <p className="text-xs text-gray-500">{editing ? `Update ${service.name}'s details and price.` : "New services start as Active."}</p>
          </div>
          <button type="button" onClick={onClose} disabled={form.processing} aria-label="Close" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
          </button>
        </header>

        <div className="paw-pet-modal-body flex flex-col gap-4">
          <Field id="service-name" label="Service Name" required error={form.errors.name} hint={editing ? "Past appointments keep the name they were booked with." : null}>
            <input id="service-name" className={input} value={form.data.name} onChange={set("name")} maxLength={50} autoComplete="off" required/>
          </Field>
          <Field id="service-description" label="Description" error={form.errors.description} hint="Optional. Up to 255 characters.">
            <textarea id="service-description" rows={3} className={input} value={form.data.description} onChange={set("description")} maxLength={255}/>
          </Field>
          <Field id="service-price" label="Price (₱)" required error={form.errors.price}>
            <input id="service-price" type="number" inputMode="decimal" min="0" step="0.01" className={input} value={form.data.price} onChange={set("price")} placeholder="0.00" required/>
          </Field>
        </div>

        <footer className="paw-pet-modal-footer">
          <button type="button" onClick={onClose} disabled={form.processing} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={form.processing} className="rounded-lg bg-[#3b0f8c] px-6 py-2 text-sm font-bold text-white hover:bg-[#2d0a6e] disabled:opacity-60">
            {form.processing ? "Saving…" : editing ? "Save Changes" : "Add Service"}
          </button>
        </footer>
      </form>
    </div>);
}
