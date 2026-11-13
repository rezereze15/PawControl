import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { leanPhoto } from "../../shared/dashboard/assets";

function PetDetailsModal({ pet, onClose }) {
    const form = useForm({ photo: null });
    const [photoPreview, setPhotoPreview] = useState(null);

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
        if (!form.data.photo) return;

        form.post(`/pets/${pet.id}/photo`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    const details = [
        ["Species", pet.species],
        ["Breed", pet.breed],
        ["Age", pet.age == null ? "Not provided" : `${pet.age} ${pet.age === 1 ? "year" : "years"}`],
        ["Sex", pet.sex || "Not provided"],
        ["Date of birth", pet.dateOfBirth || "Not provided"],
        ["Weight", pet.weight == null ? "Not provided" : `${pet.weight} kg`],
    ];

    return (
        <div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !form.processing) onClose();
        }}>
            <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="pet-details-title" className="paw-pet-modal paw-pet-details-modal">
                <header className="paw-pet-modal-header">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[.16em] text-violet-700">Pet profile</p>
                        <h2 id="pet-details-title" className="mt-1 text-2xl font-extrabold tracking-tight text-[#1a0a3c]">{pet.name}</h2>
                    </div>
                    <button type="button" onClick={onClose} disabled={form.processing} aria-label="Close pet details" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
                    </button>
                </header>

                <div className="paw-pet-modal-body">
                    {form.hasErrors && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">{form.errors.photo || "The photo could not be updated. Please try again."}</div>}

                    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-800 p-5 text-white sm:p-6">
                        <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border-[24px] border-white/5" aria-hidden="true" />
                        <div className="relative flex flex-col items-center gap-4 sm:flex-row">
                            <div className="relative flex-shrink-0">
                                <img src={photoPreview || pet.photoUrl || leanPhoto} alt={`${pet.name} profile`} className="h-28 w-28 rounded-full border-4 border-white/90 bg-white object-cover shadow-xl" />
                                {photoPreview && <span className="absolute -bottom-1 -right-1 rounded-full bg-emerald-400 p-1.5 text-white ring-2 ring-white" aria-label="New photo preview">
                                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </span>}
                            </div>
                            <div className="min-w-0 flex-1 text-center sm:text-left">
                                <p className="text-lg font-bold">{pet.name}</p>
                                <p className="mt-1 text-sm text-violet-100">{[pet.species, pet.breed].filter(Boolean).join(" · ")}</p>
                                <label htmlFor="pet-profile-photo" className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/20 focus-within:ring-2 focus-within:ring-white">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h3l1.5-2h7L17 7h3v12H4z" strokeLinejoin="round"/><circle cx="12" cy="13" r="3.5"/></svg>
                                    {photoPreview ? "Choose another" : "Change photo"}
                                </label>
                                <input id="pet-profile-photo" className="sr-only" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    form.setData("photo", file);
                                    form.clearErrors("photo");
                                    setPhotoPreview(file ? URL.createObjectURL(file) : null);
                                }} />
                                <p className="mt-2 text-xs text-violet-200">JPG, PNG or WebP · max 5 MB</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6" aria-labelledby="pet-details-section-title">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 id="pet-details-section-title" className="text-sm font-bold text-slate-800">Pet details</h3>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">View only</span>
                        </div>
                        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {details.map(([label, value]) => (
                                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                                    <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
                                    <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                </div>

                <footer className="paw-pet-modal-footer">
                    <p className="mr-auto hidden text-xs text-slate-400 sm:block">Only the profile photo can be changed.</p>
                    <button type="button" onClick={onClose} disabled={form.processing} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50">Close</button>
                    <button type="submit" disabled={!form.data.photo || form.processing} className="inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-[#3b0f8c] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/15 transition hover:bg-[#2d0a6e] focus:outline-none focus:ring-4 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-50">
                        {form.processing ? "Saving…" : "Save photo"}
                    </button>
                </footer>
            </form>
        </div>
    );
}

export default PetDetailsModal;
