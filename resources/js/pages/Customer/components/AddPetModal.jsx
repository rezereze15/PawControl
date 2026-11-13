import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";

const fields = [
    { name: "petName", label: "Pet name", placeholder: "e.g. Milo", required: true, autoComplete: "off" },
    { name: "species", label: "Species", placeholder: "Select species", options: ["Dog", "Cat"], required: true },
    { name: "breed", label: "Breed", placeholder: "e.g. Aspin", required: true },
    { name: "dateOfBirth", label: "Date of birth", type: "date" },
    { name: "age", label: "Age", placeholder: "Calculated from date of birth", readOnly: true },
    { name: "sex", label: "Sex", placeholder: "Select sex", options: ["Male", "Female"] },
    { name: "weight", label: "Weight", placeholder: "kg", type: "number", min: "0", step: "0.01", suffix: "kg" },
];

function AddPetModal({ onClose }) {
    const form = useForm({
        petName: "",
        species: "",
        breed: "",
        age: "",
        sex: "",
        dateOfBirth: "",
        weight: "",
        photo: null,
    });
    const [photoPreview, setPhotoPreview] = useState(null);

    function calculatedAge(dateOfBirth) {
        if (!dateOfBirth) return "";
        const birth = new Date(`${dateOfBirth}T00:00:00`);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
        return String(age);
    }

    function todayDate() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    }

    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && !form.processing && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [form.processing, onClose]);

    useEffect(() => () => {
        if (photoPreview) URL.revokeObjectURL(photoPreview);
    }, [photoPreview]);

    function submit(event) {
        event.preventDefault();
        form.post("/pets", {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    function choosePhoto(event) {
        const file = event.target.files?.[0] ?? null;
        form.setData("photo", file);
        form.clearErrors("photo");
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    }

    function removePhoto() {
        form.setData("photo", null);
        setPhotoPreview(null);
        const input = document.getElementById("new-pet-photo");
        if (input) input.value = "";
    }

    const fieldClass = (name) => `w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 ${form.errors[name] ? "border-red-400" : "border-slate-200 hover:border-slate-300"}`;

    return (
        <div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !form.processing) onClose();
        }}>
            <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="add-pet-title" className="paw-pet-modal paw-add-pet-modal">
                <header className="paw-pet-modal-header">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-800">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path d="M12 20.5s-7.5-4.4-7.5-10a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6c0 5.6-7.5 10-7.5 10Z" strokeLinejoin="round" />
                                <circle cx="9" cy="11" r=".7" fill="currentColor"/><circle cx="15" cy="11" r=".7" fill="currentColor"/>
                                <path d="M10 14c.6.7 1.1 1 2 1s1.4-.3 2-1" strokeLinecap="round" />
                            </svg>
                        </span>
                        <div>
                            <h2 id="add-pet-title" className="text-xl font-extrabold tracking-tight text-[#1a0a3c] sm:text-2xl">Add a pet</h2>
                            <p className="mt-1 text-sm text-slate-500">Create a profile for your companion.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} disabled={form.processing} aria-label="Close add pet form" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
                    </button>
                </header>

                <div className="paw-pet-modal-body">
                    {form.hasErrors && (
                        <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
                            <svg className="mt-0.5 h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01" strokeLinecap="round"/></svg>
                            <div><p className="font-bold">Please check the form</p><p className="mt-0.5 text-red-700">Fix the highlighted fields and try again.</p></div>
                        </div>
                    )}

                    <section aria-labelledby="pet-basics-title">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="h-5 w-1 rounded-full bg-orange-400" />
                            <h3 id="pet-basics-title" className="text-sm font-bold text-slate-800">Basic information</h3>
                            <span className="text-xs text-slate-400">* required</span>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
                            {fields.map((field, index) => (
                                <div key={field.name} className={index < 4 ? "sm:col-span-3" : "sm:col-span-2"}>
                                    <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor={`new-pet-${field.name}`}>
                                        {field.label}{field.required && <span className="ml-1 text-red-500">*</span>}
                                    </label>
                                    <div className="relative">
                                        {field.options ? <select
                                            id={`new-pet-${field.name}`}
                                            className={fieldClass(field.name)}
                                            value={form.data[field.name]}
                                            onChange={(event) => { form.setData(field.name, event.target.value); form.clearErrors(field.name); }}
                                            required={field.required}
                                            aria-invalid={Boolean(form.errors[field.name])}
                                            aria-describedby={form.errors[field.name] ? `new-pet-${field.name}-error` : undefined}
                                        >
                                            <option value="">{field.placeholder}</option>
                                            {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                                        </select> : <input
                                            id={`new-pet-${field.name}`}
                                            className={`${fieldClass(field.name)} ${field.suffix ? "pr-12" : ""}`}
                                            type={field.type || "text"}
                                            placeholder={field.placeholder}
                                            value={form.data[field.name]}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                if (field.name === "dateOfBirth") form.setData((data) => ({ ...data, dateOfBirth: value, age: calculatedAge(value) }));
                                                else form.setData(field.name, value);
                                                form.clearErrors(field.name);
                                            }}
                                            maxLength={field.type === "text" || !field.type ? 50 : undefined}
                                            min={field.min}
                                            step={field.step}
                                            readOnly={field.readOnly}
                                            max={field.type === "date" ? todayDate() : undefined}
                                            required={field.required}
                                            aria-invalid={Boolean(form.errors[field.name])}
                                            aria-describedby={form.errors[field.name] ? `new-pet-${field.name}-error` : undefined}
                                        />}
                                        {field.suffix && <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-400">{field.suffix}</span>}
                                    </div>
                                    {form.errors[field.name] && <p id={`new-pet-${field.name}-error`} className="mt-1.5 text-xs font-medium text-red-600">{form.errors[field.name]}</p>}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-7" aria-labelledby="pet-photo-title">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <h3 id="pet-photo-title" className="text-sm font-bold text-slate-800">Profile photo <span className="font-normal text-slate-400">(optional)</span></h3>
                                <p className="mt-1 text-xs text-slate-500">Add a photo so this profile is easy to recognize.</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-4 sm:flex-row sm:p-5">
                            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white text-violet-500 shadow-sm">
                                {photoPreview ? <img src={photoPreview} alt="Preview of selected pet profile" className="h-full w-full object-cover" /> : (
                                    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0" strokeLinecap="round"/></svg>
                                )}
                            </div>
                            <div className="min-w-0 flex-1 text-center sm:text-left">
                                <p className="text-sm font-semibold text-slate-800">{form.data.photo?.name || "Choose a photo from your device"}</p>
                                <p className="mt-1 text-xs text-slate-500">JPG, PNG or WebP · up to 5 MB</p>
                                <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                                    <label htmlFor="new-pet-photo" className="cursor-pointer rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-violet-800 shadow-sm ring-1 ring-violet-200 transition hover:bg-violet-100 focus-within:ring-2 focus-within:ring-violet-500">{photoPreview ? "Replace photo" : "Browse photos"}</label>
                                    {photoPreview && <button type="button" onClick={removePhoto} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800">Remove</button>}
                                </div>
                                <input id="new-pet-photo" className="sr-only" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={choosePhoto} aria-describedby={form.errors.photo ? "new-pet-photo-error" : undefined} />
                                {form.errors.photo && <p id="new-pet-photo-error" className="mt-2 text-xs font-medium text-red-600" role="alert">{form.errors.photo}</p>}
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="paw-pet-modal-footer">
                    <button type="button" onClick={onClose} disabled={form.processing} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                    <button type="submit" disabled={form.processing} className="inline-flex min-w-36 items-center justify-center gap-2 rounded-xl bg-[#3b0f8c] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/15 transition hover:-translate-y-0.5 hover:bg-[#2d0a6e] hover:shadow-violet-900/25 focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70">
                        {form.processing && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>}
                        {form.processing ? "Saving pet…" : "Add pet"}
                    </button>
                </footer>
            </form>
        </div>
    );
}

export default AddPetModal;
