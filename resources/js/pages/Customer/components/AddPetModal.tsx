import { useState } from "react";

interface AddPetModalProps {
  onClose: () => void
}

function AddPetModal({ onClose }: AddPetModalProps) {
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    color: "",
    age: "",
    sex: "",
    dob: "",
    weight: "",
    temp: "",
  })
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const inp =
    "w-full border border-gray-300 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"

  return (
    <div className="paw-add-pet-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="paw-add-pet-card bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8">
        <h2 className="text-2xl font-extrabold text-[#1a0a3c] mb-0.5">
          Add New Pet
        </h2>
        <p className="text-sm text-gray-500 mb-6">Create New Pet</p>

        <div className="paw-add-pet-fields flex flex-col gap-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Patient/Pet Name
              </label>
              <input
                className={inp}
                placeholder="Pet Name"
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Species
              </label>
              <input
                className={inp}
                placeholder="Dog/Cat"
                value={form.species}
                onChange={set("species")}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Breed
              </label>
              <input
                className={inp}
                placeholder="Golden Retriever"
                value={form.breed}
                onChange={set("breed")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Color/Markings
              </label>
              <input
                className={inp}
                placeholder="Black & White"
                value={form.color}
                onChange={set("color")}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Age
              </label>
              <input
                className={inp}
                placeholder="5"
                type="number"
                min="0"
                value={form.age}
                onChange={set("age")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Sex
              </label>
              <input
                className={inp}
                placeholder="Male/Female"
                value={form.sex}
                onChange={set("sex")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Date of Birth
              </label>
              <input
                className={inp}
                placeholder="MM/DD/YYYY"
                value={form.dob}
                onChange={set("dob")}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Weight
              </label>
              <input
                className={inp}
                placeholder="Kg"
                value={form.weight}
                onChange={set("weight")}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
                Temperature
              </label>
              <input
                className={inp}
                placeholder="°C (optional)"
                value={form.temp}
                onChange={set("temp")}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={onClose}
            className="border border-[#3b0f8c] text-[#3b0f8c] px-6 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="bg-[#1a0a3c] text-white px-8 py-2 rounded-lg text-sm font-bold hover:bg-[#2d0a6e] transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Appointment Wizard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default AddPetModal
