import { CalendarIcon } from "../../shared/dashboard/Icons";
import { leanPhoto, pawLogo } from "../../shared/dashboard/assets";
import AddPetModal from "./AddPetModal";
import { useAddPetModal } from "../hooks/useAddPetModal";
function CustomerHomeSection({ username, onBookAppointment, onViewRecords, onViewAppointments }) {
    const { showAddPet, setShowAddPet } = useAddPetModal();
    return (<div className="flex flex-col gap-6">
      {showAddPet && <AddPetModal onClose={() => setShowAddPet(false)}/>}
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
        Hi, {username}!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <CalendarIcon color="#5b21b6"/>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Upcoming Appointments
            </p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">1</p>
            <button onClick={onViewAppointments} className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <img src={pawLogo} alt="Paw" className="w-12 h-12 object-contain"/>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pet's Records</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">1</p>
            <button onClick={onViewRecords} className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">View Details</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <svg className="w-12 h-12 flex-shrink-0" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="6" width="32" height="38" rx="3" stroke="#9ca3af" strokeWidth="2.5" fill="none"/>
            <path d="M16 16h16M16 22h16M16 28h10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
            <rect x="22" y="30" width="12" height="10" rx="1" stroke="#9ca3af" strokeWidth="2" fill="none"/>
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Appointment History
            </p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">1</p>
            <button onClick={onViewAppointments} className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#e87c1e] font-bold text-lg mb-4">
            My Pets Record
          </h2>
          <div className="flex gap-4 flex-wrap">
            <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3 w-56">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-amber-200 flex-shrink-0">
                <img src={leanPhoto} alt="Lean" className="w-full h-full object-cover"/>
              </div>
              <div>
                <p className="font-extrabold text-[#1a0a3c] text-sm">Lean</p>
                <p className="text-gray-500 text-xs">Aspin</p>
                <p className="text-gray-400 text-xs">3 years old</p>
                <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
                  View Details
                </button>
              </div>
            </div>
            <button onClick={() => setShowAddPet(true)} className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 w-40 hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 rounded-full border-2 border-[#3b0f8c] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#3b0f8c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-[#3b0f8c] font-bold text-xs">
                Add New Pet
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" color="#3b0f8c"/>
            <span className="text-[#3b0f8c] font-bold text-sm">
              Next Appointment
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-amber-200 flex-shrink-0">
              <img src={leanPhoto} alt="Lean" className="w-full h-full object-cover"/>
            </div>
            <div>
              <p className="font-extrabold text-[#1a0a3c] text-base">Lean</p>
              <p className="text-gray-500 text-xs">Aspin</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              May 15, 2026 (Friday)
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2" strokeLinecap="round"/>
              </svg>
              11:00 PM
            </div>
          </div>
          <button onClick={onViewAppointments} className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
            View Appointment Details
          </button>
          <button onClick={onBookAppointment} className="w-full border border-orange-400 text-orange-500 hover:bg-orange-50 font-bold py-2.5 rounded-lg text-sm transition-colors">
            + Book New Appointment
          </button>
        </div>
      </div>
    </div>);
}
export default CustomerHomeSection;
