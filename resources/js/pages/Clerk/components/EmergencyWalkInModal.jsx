import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]";
const PHONE = /^\+?[0-9][0-9\s\-()]{6,28}$/;

function Field({ id, label, required, error, hint, children, className = "" }) {
    return (<div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-[#1a0a3c]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>);
}

// Instant checks so the clerk sees mistakes before sending.
// The server (StoreEmergencyWalkInRequest) checks everything again.
function validate(data, selectedOwner) {
    const errors = {};
    if (!data.petName.trim()) errors.petName = "The pet's name is required.";
    if (!data.species) errors.species = "Select the species.";
    if (!data.breed.trim()) errors.breed = "The breed is required (use \"Unknown\" or \"Mixed\" if unsure).";
    if (data.age !== "" && !(Number.isInteger(Number(data.age)) && Number(data.age) >= 0 && Number(data.age) <= 40)) errors.age = "Enter the age in whole years (0–40).";
    if (data.weight !== "" && !(Number(data.weight) >= 0)) errors.weight = "Enter a valid weight in kg.";
    if (!data.notes.trim()) errors.notes = "Describe the emergency or symptoms so the veterinarian can prepare.";

    if (data.owner_type === "existing" && !selectedOwner) {
        errors.owner_id = "Search for and select the pet owner, or choose \"No account\".";
    }
    if (data.owner_type === "walk_in") {
        if (!data.walk_in_owner_name.trim()) errors.walk_in_owner_name = "The owner's name is required.";
        if (!data.walk_in_owner_phone.trim()) errors.walk_in_owner_phone = "The owner's contact number is required.";
        else if (!PHONE.test(data.walk_in_owner_phone.trim())) errors.walk_in_owner_phone = "Enter a valid contact number (digits, spaces, + - and brackets only).";
    }
    return errors;
}

/** Search registered pet owner accounts (GET /clerk/emergency/owners). */
function OwnerSearch({ selected, onSelect, error }) {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [status, setStatus] = useState("idle"); // idle | loading | done | error
    const requestId = useRef(0);

    useEffect(() => {
        const term = search.trim();
        if (term.length < 2) {
            setResults([]);
            setStatus("idle");
            return undefined;
        }
        const id = ++requestId.current;
        setStatus("loading");
        const timer = setTimeout(async () => {
            try {
                const response = await fetch(`/clerk/emergency/owners?search=${encodeURIComponent(term)}`, {
                    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
                    credentials: "same-origin",
                });
                if (!response.ok) throw new Error(String(response.status));
                const body = await response.json();
                if (id === requestId.current) {
                    setResults(body.owners ?? []);
                    setStatus("done");
                }
            } catch {
                if (id === requestId.current) setStatus("error");
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [search]);

    if (selected) {
        return (<div className="flex items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#1a0a3c]">{selected.name}</p>
            <p className="truncate text-xs text-gray-500">{[selected.phone, selected.email].filter(Boolean).join(" · ")}</p>
          </div>
          <button type="button" onClick={() => onSelect(null)} className="flex-shrink-0 text-xs font-semibold text-paw-blue hover:underline">Change</button>
        </div>);
    }

    return (<div>
      <input id="emergency-owner-search" type="search" className={input} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, username or phone…" autoComplete="off" aria-describedby="emergency-owner-results"/>
      <div id="emergency-owner-results" aria-live="polite" className="mt-2">
        {status === "loading" && <p className="text-xs text-gray-400">Searching…</p>}
        {status === "error" && <p className="text-xs text-red-600">Could not search pet owners. Try again.</p>}
        {status === "done" && results.length === 0 && <p className="text-xs text-gray-500">No pet owner account matches “{search.trim()}”. Use “No account” instead.</p>}
        {results.length > 0 && (<ul className="max-h-48 divide-y divide-gray-100 overflow-y-auto rounded-xl border border-gray-200">
            {results.map((owner) => (<li key={owner.id}>
                <button type="button" onClick={() => onSelect(owner)} className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-violet-50 focus:bg-violet-50 focus:outline-none">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[#1a0a3c]">{owner.name}</span>
                    <span className="block truncate text-xs text-gray-500">{[owner.phone, owner.email].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="flex-shrink-0 text-[11px] text-gray-400">{owner.petCount} {owner.petCount === 1 ? "pet" : "pets"}</span>
                </button>
              </li>))}
          </ul>)}
      </div>
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>);
}

/**
 * Clerk-only: register an emergency walk-in. Creates the pet profile and a Confirmed
 * emergency visit that goes straight to the veterinarians' queue.
 */
export default function EmergencyWalkInModal({ onClose }) {
    const [selectedOwner, setSelectedOwner] = useState(null);
    const form = useForm({
        petName: "",
        species: "",
        breed: "",
        sex: "",
        age: "",
        weight: "",
        notes: "",
        owner_type: "walk_in",
        owner_id: "",
        walk_in_owner_name: "",
        walk_in_owner_phone: "",
    });

    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && !form.processing && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [form.processing, onClose]);

    const set = (field) => (event) => {
        form.setData(field, event.target.value);
        form.clearErrors(field);
    };

    function chooseOwnerType(type) {
        form.setData("owner_type", type);
        form.clearErrors("owner_id", "walk_in_owner_name", "walk_in_owner_phone");
    }

    function selectOwner(owner) {
        setSelectedOwner(owner);
        form.setData("owner_id", owner?.id ?? "");
        form.clearErrors("owner_id");
    }

    function submit(event) {
        event.preventDefault();
        const errors = validate(form.data, selectedOwner);
        form.clearErrors();
        if (Object.keys(errors).length > 0) {
            form.setError(errors);
            return;
        }
        form.transform((data) => {
            const payload = { ...data };
            // Send only the fields for the chosen owner option.
            if (data.owner_type === "existing") {
                delete payload.walk_in_owner_name;
                delete payload.walk_in_owner_phone;
            } else {
                delete payload.owner_id;
            }
            return payload;
        });
        form.post("/clerk/emergency", { preserveScroll: true, onSuccess: onClose });
    }

    const isExisting = form.data.owner_type === "existing";

    return (<div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !form.processing) onClose();
        }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="emergency-title" className="paw-pet-modal" style={{ width: "min(100%, 680px)" }} noValidate>
        <header className="paw-pet-modal-header">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600" aria-hidden="true">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
            </span>
            <div>
              <h2 id="emergency-title" className="text-xl font-extrabold text-[#1a0a3c]">Emergency Walk-In</h2>
              <p className="text-xs text-gray-500">Goes straight to the veterinarians&apos; queue — no online booking or payment needed.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={form.processing} aria-label="Close" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
          </button>
        </header>

        <div className="paw-pet-modal-body flex flex-col gap-6">
          <section aria-labelledby="emergency-pet-heading" className="flex flex-col gap-4">
            <h3 id="emergency-pet-heading" className="text-sm font-extrabold uppercase tracking-wide text-[#3b0f8c]">Pet details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="emergency-pet-name" label="Pet Name" required error={form.errors.petName}>
                <input id="emergency-pet-name" className={input} value={form.data.petName} onChange={set("petName")} maxLength={50} autoComplete="off" autoFocus/>
              </Field>
              <Field id="emergency-species" label="Species" required error={form.errors.species}>
                <select id="emergency-species" className={input} value={form.data.species} onChange={set("species")}>
                  <option value="">Select…</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                </select>
              </Field>
              <Field id="emergency-breed" label="Breed" required error={form.errors.breed}>
                <input id="emergency-breed" className={input} value={form.data.breed} onChange={set("breed")} maxLength={50} placeholder="e.g. Aspin, Mixed, Unknown"/>
              </Field>
              <Field id="emergency-sex" label="Sex" error={form.errors.sex}>
                <select id="emergency-sex" className={input} value={form.data.sex} onChange={set("sex")}>
                  <option value="">Unknown</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </Field>
              <Field id="emergency-age" label="Age (years)" error={form.errors.age} hint="Optional — an estimate is fine.">
                <input id="emergency-age" type="number" inputMode="numeric" min="0" max="40" step="1" className={input} value={form.data.age} onChange={set("age")}/>
              </Field>
              <Field id="emergency-weight" label="Weight (kg)" error={form.errors.weight} hint="Optional.">
                <input id="emergency-weight" type="number" inputMode="decimal" min="0" step="0.01" className={input} value={form.data.weight} onChange={set("weight")}/>
              </Field>
            </div>
            <Field id="emergency-notes" label="Emergency notes / symptoms" required error={form.errors.notes}>
              <textarea id="emergency-notes" rows={3} className={input} value={form.data.notes} onChange={set("notes")} maxLength={1000} placeholder="What happened, symptoms, when they started…"/>
            </Field>
          </section>

          <section aria-labelledby="emergency-owner-heading" className="flex flex-col gap-4">
            <h3 id="emergency-owner-heading" className="text-sm font-extrabold uppercase tracking-wide text-[#3b0f8c]">Owner</h3>
            <div role="radiogroup" aria-labelledby="emergency-owner-heading" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
            { value: "walk_in", title: "No account (walk-in)", body: "Enter the owner's name and contact number." },
            { value: "existing", title: "Existing pet owner", body: "Attach the pet to a registered account." },
        ].map((option) => {
            const active = form.data.owner_type === option.value;
            return (<button key={option.value} type="button" role="radio" aria-checked={active} onClick={() => chooseOwnerType(option.value)} className={`rounded-xl border-2 px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-violet-300 ${active ? "border-[#3b0f8c] bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <span className="block text-sm font-bold text-[#1a0a3c]">{option.title}</span>
                    <span className="block text-xs text-gray-500">{option.body}</span>
                  </button>);
        })}
            </div>

            {isExisting ? (<Field id="emergency-owner-search" label="Pet owner account" required>
                <OwnerSearch selected={selectedOwner} onSelect={selectOwner} error={form.errors.owner_id}/>
              </Field>) : (<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="emergency-owner-name" label="Owner Name" required error={form.errors.walk_in_owner_name}>
                  <input id="emergency-owner-name" className={input} value={form.data.walk_in_owner_name} onChange={set("walk_in_owner_name")} maxLength={100} autoComplete="off"/>
                </Field>
                <Field id="emergency-owner-phone" label="Contact Number" required error={form.errors.walk_in_owner_phone}>
                  <input id="emergency-owner-phone" type="tel" inputMode="tel" className={input} value={form.data.walk_in_owner_phone} onChange={set("walk_in_owner_phone")} maxLength={30} placeholder="09XX XXX XXXX" autoComplete="off"/>
                </Field>
                <p className="text-[11px] text-gray-400 sm:col-span-2">Saved with a walk-in tag so the record can be linked to the owner&apos;s account later.</p>
              </div>)}
          </section>
        </div>

        <footer className="paw-pet-modal-footer">
          <button type="button" onClick={onClose} disabled={form.processing} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={form.processing} className="rounded-lg bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
            {form.processing ? "Saving…" : "Save & Send to Vet Queue"}
          </button>
        </footer>
      </form>
    </div>);
}
