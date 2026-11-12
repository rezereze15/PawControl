import { useState } from "react";
import AddPetModal from "./AddPetModal";
function AppointmentStep2({ pets = [], selectedPetId, onSelectPet, onNext, onBack }) {
    const [showAddPet, setShowAddPet] = useState(false);
    return (<div className="flex flex-col gap-5">
      {showAddPet && <AddPetModal onClose={() => setShowAddPet(false)}/>}
      <h3 className="text-xl font-extrabold text-[#1a0a3c]">Select pet(s)</h3>
      <div className="flex gap-4 flex-wrap">
        {pets.map((pet) => (<button key={pet.id} onClick={() => onSelectPet(String(pet.id))} className={`border-2 rounded-xl p-4 flex items-center gap-3 w-56 transition-colors ${String(selectedPetId) === String(pet.id)
            ? "border-[#3b0f8c] bg-purple-50"
            : "border-gray-200 hover:border-[#3b0f8c]"}`}>
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-[#3b0f8c] font-bold">
            {pet.name?.[0] ?? "?"}
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[#1a0a3c] text-sm">{pet.name}</p>
            <p className="text-gray-500 text-xs">{pet.breed || pet.species || "Pet"}</p>
            <p className="text-gray-400 text-xs">{pet.age ? `${pet.age} years old` : ""}</p>
            <span className="text-[#3b0f8c] text-xs font-medium">View Details</span>
          </div>
        </button>))}
        {pets.length === 0 && <p className="text-sm text-gray-500">No pets are registered to this account yet.</p>}
        <button onClick={() => setShowAddPet(true)} className="border-2 border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 w-40 hover:border-[#3b0f8c] transition-colors">
          <div className="w-12 h-12 rounded-full border-2 border-[#3b0f8c] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#3b0f8c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-[#3b0f8c] font-bold text-xs">Add new pet</span>
        </button>
      </div>
      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={onNext} disabled={!selectedPetId} className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors disabled:opacity-50">
          Next
        </button>
      </div>
    </div>);
}
export default AppointmentStep2;
