import { useEffect } from "react";
import { useForm } from "@inertiajs/react";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]";

// Same sanity limit as the server (ManagedSupplyRequest).
const MAX_COUNT = 1000000;

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
// The server (ManagedSupplyRequest) still checks everything, because the browser can be bypassed.
function validate(data, otherNames) {
    const errors = {};
    const name = data.name.trim();
    const price = String(data.unit_price).trim();

    if (!name) errors.name = "The supply name is required.";
    else if (otherNames.includes(name.toLowerCase())) errors.name = "A supply with this name already exists.";

    if (!data.category) errors.category = "Please choose a category.";
    if (!data.unit_of_measure) errors.unit_of_measure = "Please choose a unit.";

    // Stock and reorder level are counts: whole numbers only (no "2.5 boxes").
    for (const [field, label] of [["stock_quantity", "stock quantity"], ["reorder_level", "reorder level"]]) {
        const value = String(data[field]).trim();
        if (!value) errors[field] = `The ${label} is required.`;
        else if (!/^\d+$/.test(value)) errors[field] = "Enter a whole number (0 or more).";
        else if (Number(value) > MAX_COUNT) errors[field] = "That number is too high.";
    }

    if (!price) errors.unit_price = "The unit price is required.";
    else if (!/^\d+(\.\d{1,2})?$/.test(price)) errors.unit_price = "Enter a valid amount with up to 2 decimals (e.g. 250 or 250.50).";
    else if (Number(price) > 99999999.99) errors.unit_price = "The price is too high.";

    return errors;
}

/** Add (supply = null) or edit a medical supply, including its stock. New supplies start as Active. */
export default function SupplyFormModal({ supply, supplies = [], options = {}, onClose }) {
    const editing = Boolean(supply);
    const form = useForm({
        name: supply?.name ?? "",
        category: supply?.category ?? "",
        unit_of_measure: supply?.unitOfMeasure ?? "",
        description: supply?.description ?? "",
        stock_quantity: supply?.stockQuantity ?? "",
        reorder_level: supply?.reorderLevel ?? 10, // same default as the database
        unit_price: supply?.unitPrice ?? "",
    });
    // Names already used by OTHER supplies (lower-case), for the instant duplicate check.
    const otherNames = supplies.filter((s) => s.id !== supply?.id).map((s) => s.name.toLowerCase());

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
        const requestOptions = { preserveScroll: true, onSuccess: onClose };
        if (editing) form.put(`/admin/supplies/${supply.id}`, requestOptions);
        else form.post("/admin/supplies", requestOptions);
    }

    const set = (field) => (event) => form.setData(field, event.target.value);

    return (<div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !form.processing) onClose();
        }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="supply-form-title" className="paw-pet-modal" style={{ width: "min(100%, 560px)" }} noValidate>
        <header className="paw-pet-modal-header">
          <div>
            <h2 id="supply-form-title" className="text-xl font-extrabold text-[#1a0a3c]">{editing ? "Edit Supply" : "Add New Supply"}</h2>
            <p className="text-xs text-gray-500">{editing ? `Update ${supply.name}'s details and stock.` : "New supplies start as Active."}</p>
          </div>
          <button type="button" onClick={onClose} disabled={form.processing} aria-label="Close" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
          </button>
        </header>

        <div className="paw-pet-modal-body flex flex-col gap-4">
          <Field id="supply-name" label="Supply Name" required error={form.errors.name}>
            <input id="supply-name" className={input} value={form.data.name} onChange={set("name")} maxLength={100} autoComplete="off" required/>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="supply-category" label="Category" required error={form.errors.category}>
              <select id="supply-category" className={input} value={form.data.category} onChange={set("category")} required>
                <option value="" disabled>Choose a category</option>
                {(options.categories ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field id="supply-unit" label="Unit" required error={form.errors.unit_of_measure}>
              <select id="supply-unit" className={input} value={form.data.unit_of_measure} onChange={set("unit_of_measure")} required>
                <option value="" disabled>Choose a unit</option>
                {(options.units ?? []).map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
          </div>
          <Field id="supply-description" label="Description" error={form.errors.description} hint="Optional. Up to 255 characters.">
            <textarea id="supply-description" rows={2} className={input} value={form.data.description} onChange={set("description")} maxLength={255}/>
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="supply-stock" label="Stock Quantity" required error={form.errors.stock_quantity} hint={editing ? "Update this when new stock arrives or items are used up." : null}>
              <input id="supply-stock" type="number" inputMode="numeric" min="0" step="1" className={input} value={form.data.stock_quantity} onChange={set("stock_quantity")} placeholder="0" required/>
            </Field>
            <Field id="supply-reorder" label="Reorder Level" required error={form.errors.reorder_level} hint="Low stock alert at or below this number.">
              <input id="supply-reorder" type="number" inputMode="numeric" min="0" step="1" className={input} value={form.data.reorder_level} onChange={set("reorder_level")} required/>
            </Field>
          </div>
          <Field id="supply-price" label="Unit Price (₱)" required error={form.errors.unit_price}>
            <input id="supply-price" type="number" inputMode="decimal" min="0" step="0.01" className={input} value={form.data.unit_price} onChange={set("unit_price")} placeholder="0.00" required/>
          </Field>
        </div>

        <footer className="paw-pet-modal-footer">
          <button type="button" onClick={onClose} disabled={form.processing} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={form.processing} className="rounded-lg bg-[#3b0f8c] px-6 py-2 text-sm font-bold text-white hover:bg-[#2d0a6e] disabled:opacity-60">
            {form.processing ? "Saving…" : editing ? "Save Changes" : "Add Supply"}
          </button>
        </footer>
      </form>
    </div>);
}
