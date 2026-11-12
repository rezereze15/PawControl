import AddPetModal from "./AddPetModal";
import { useAppointmentPetSelection } from "../hooks/useAppointmentPetSelection";
import { leanPhoto } from "../../shared/dashboard/assets";
function AppointmentStep2({ onNext, onBack }) {
    const { selected, setSelected, showAddPet, setShowAddPet } = useAppointmentPetSelection();
    return (<div className="flex flex-col gap-5">
      {showAddPet && <AddPetModal onClose={() => setShowAddPet(false)}/>}
      <h3 className="text-xl font-extrabold text-[#1a0a3c]">Select pet(s)</h3>
      <div className="flex gap-4 flex-wrap">
        <button onClick={() => setSelected("Lean")} className={`border-2 rounded-xl p-4 flex items-center gap-3 w-56 transition-colors ${selected === "Lean"
            ? "border-[#3b0f8c] bg-purple-50"
            : "border-gray-200 hover:border-[#3b0f8c]"}`}>
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
            <img src={leanPhoto} alt="Lean" className="w-full h-full object-cover"/>
          </div>
          <div className="text-left">
            <p className="font-extrabold text-[#1a0a3c] text-sm">Lean</p>
            <p className="text-gray-500 text-xs">Aspin</p>
            <p className="text-gray-400 text-xs">3 years old</p>
            <span className="text-[#3b0f8c] text-xs font-medium">
              View Details
            </span>
          </div>
        </button>
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
        <button onClick={onNext} className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors">
          Next
        </button>
      </div>
    </div>);
}
export default AppointmentStep2;
