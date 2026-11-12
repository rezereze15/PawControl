import { useForm } from "@inertiajs/react";

function AddPetModal({ onClose }) {
    const form = useForm({
        petName: "",
        species: "",
        breed: "",
        age: "",
        sex: "",
        dateOfBirth: "",
        weight: "",
    });
    const set = (field) => (event) => form.setData(field, event.target.value);
    const inputClass = "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]";
    const labelClass = "block text-sm font-bold text-[#1a0a3c] mb-2";
    const error = (field) => form.errors[field] && (
        <p className="mt-1 text-xs text-red-600">{form.errors[field]}</p>
    );

    function submit(event) {
        event.preventDefault();
        form.post("/pets", {
            preserveScroll: true,
            onSuccess: onClose,
        });
    }

    return (
        <div className="paw-add-pet-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <form onSubmit={submit} className="paw-add-pet-card bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8">
                <h2 className="text-2xl font-extrabold text-[#1a0a3c] mb-0.5">Add New Pet</h2>
                <p className="text-sm text-gray-500 mb-6">Create New Pet</p>

                <div className="paw-add-pet-fields flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} htmlFor="petName">Patient/Pet Name</label>
                            <input id="petName" className={inputClass} placeholder="Pet Name" value={form.data.petName} onChange={set("petName")} maxLength={50} required />
                            {error("petName")}
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="species">Species</label>
                            <input id="species" className={inputClass} placeholder="Dog/Cat" value={form.data.species} onChange={set("species")} maxLength={50} required />
                            {error("species")}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass} htmlFor="breed">Breed</label>
                            <input id="breed" className={inputClass} placeholder="Golden Retriever" value={form.data.breed} onChange={set("breed")} maxLength={50} required />
                            {error("breed")}
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="age">Age</label>
                            <input id="age" className={inputClass} placeholder="5" type="number" min="0" step="1" value={form.data.age} onChange={set("age")} />
                            {error("age")}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass} htmlFor="sex">Sex</label>
                            <input id="sex" className={inputClass} placeholder="Male/Female" value={form.data.sex} onChange={set("sex")} maxLength={50} />
                            {error("sex")}
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="dateOfBirth">Date of Birth</label>
                            <input id="dateOfBirth" className={inputClass} type="date" value={form.data.dateOfBirth} onChange={set("dateOfBirth")} />
                            {error("dateOfBirth")}
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="weight">Weight (kg)</label>
                            <input id="weight" className={inputClass} type="number" min="0" step="0.01" placeholder="Kg" value={form.data.weight} onChange={set("weight")} />
                            {error("weight")}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-8">
                    <button type="button" onClick={onClose} className="border border-[#3b0f8c] text-[#3b0f8c] px-6 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={form.processing} className="bg-[#1a0a3c] text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-[#2d0a6e] transition-colors disabled:opacity-50">
                        {form.processing ? "Saving..." : "Add"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddPetModal;
