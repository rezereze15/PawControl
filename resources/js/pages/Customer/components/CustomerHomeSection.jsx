import { useState } from "react";
import { CalendarIcon } from "../../shared/dashboard/Icons";
import { leanPhoto, pawLogo } from "../../shared/dashboard/assets";
import AddPetModal from "./AddPetModal";
import { formatPetAge } from "../../shared/dashboard/petAge";
import PetDetailsModal from "./PetDetailsModal";
import AppointmentDetailsModal, { formatAppointmentDate, formatAppointmentTime } from "./AppointmentDetailsModal";
import { useAddPetModal } from "../hooks/useAddPetModal";
function CustomerHomeSection({ username, pets = [], incomingAppointment, upcomingAppointmentCount = 0, onBookAppointment, onViewRecords, onViewAppointments }) {
    const { showAddPet, setShowAddPet } = useAddPetModal();
    const [selectedPet, setSelectedPet] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    return (<div className="flex flex-col gap-6">
      {showAddPet && <AddPetModal onClose={() => setShowAddPet(false)}/>}
      {selectedPet && <PetDetailsModal pet={selectedPet} onClose={() => setSelectedPet(null)}/>}
      {selectedAppointment && <AppointmentDetailsModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)}/>}
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
            <p className="text-4xl font-extrabold text-[#1a0a3c]">{upcomingAppointmentCount}</p>
            <button onClick={onViewAppointments} className="text-paw-blue text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <img src={pawLogo} alt="Paw" className="w-12 h-12 object-contain"/>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pet's Records</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">{pets.length}</p>
            <button onClick={onViewRecords} className="text-paw-blue text-xs font-medium mt-1 hover:underline">View Details</button>
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
            <button onClick={onViewAppointments} className="text-paw-blue text-xs font-medium mt-1 hover:underline">
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
            {pets.map((pet) => (
              <div key={pet.id} className="group flex w-56 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md">
                <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-amber-100 ring-2 ring-white shadow-sm">
                  <img src={pet.photoUrl || leanPhoto} alt={`${pet.name} profile`} className="w-full h-full object-cover"/>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-[#1a0a3c] text-sm">{pet.name}</p>
                  <p className="truncate text-gray-500 text-xs">{pet.breed || pet.species}</p>
                  <p className="text-gray-400 text-xs">{formatPetAge(pet) ?? "Age unknown"}</p>
                  <button type="button" onClick={() => setSelectedPet(pet)} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-paw-blue hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-violet-400">
                    View profile <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setShowAddPet(true)} className="group flex min-h-[112px] w-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300 bg-violet-50/40 p-4 transition hover:border-violet-500 hover:bg-violet-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#3b0f8c] shadow-sm ring-1 ring-violet-200 transition group-hover:scale-105">
                <svg className="w-6 h-6 text-[#3b0f8c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-center"><span className="block text-xs font-bold text-[#3b0f8c]">Add a pet</span><span className="mt-0.5 block text-[10px] text-slate-500">Create a profile</span></span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6" color="#3b0f8c"/>
            <span className="text-[#3b0f8c] font-bold text-sm">
              Incoming Appointment
            </span>
          </div>
          {incomingAppointment ? <>
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-amber-100 ring-2 ring-white shadow-sm">
                <img src={incomingAppointment.photoUrl || leanPhoto} alt={`${incomingAppointment.pet} profile`} className="h-full w-full object-cover"/>
              </div>
              <div className="min-w-0">
                <p className="truncate font-extrabold text-[#1a0a3c] text-base">{incomingAppointment.pet}</p>
                <p className="truncate text-gray-500 text-xs">{incomingAppointment.breed || incomingAppointment.species || "Pet"}</p>
                <p className="mt-1 text-xs font-semibold text-violet-700">{incomingAppointment.serviceType || "Clinic visit"}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" color="#94a3b8"/>
                {formatAppointmentDate(incomingAppointment.startsAt)}
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
                {formatAppointmentTime(incomingAppointment.startsAt)}
              </div>
            </div>
            <button type="button" onClick={() => setSelectedAppointment(incomingAppointment)} className="w-full rounded-xl bg-paw-blue py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-paw-blue-dark focus:outline-none focus:ring-4 focus:ring-violet-100">
              View appointment details
            </button>
          </> : <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-slate-50 px-4 py-7 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-violet-700 shadow-sm"><CalendarIcon className="h-5 w-5" color="#3b0f8c"/></span>
            <p className="mt-3 text-sm font-bold text-slate-800">No upcoming appointment</p>
            <p className="mt-1 text-xs text-slate-500">Your next visit will appear here.</p>
            <button type="button" onClick={onViewAppointments} className="mt-3 text-xs font-bold text-paw-blue hover:underline">View appointment history</button>
          </div>}
          {/* Primary action: solid blue like every other button, white text, white "+" badge. */}
          <button type="button" onClick={onBookAppointment} className="group inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border-0 bg-paw-blue px-4 py-3 text-sm font-extrabold tracking-[0.01em] text-white shadow-[0_8px_18px_-8px_rgb(25_4_63/0.75),inset_0_1px_0_rgb(255_255_255/0.25)] transition-[background-color,box-shadow,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-[0_12px_24px_-10px_rgb(25_4_63/0.85),inset_0_1px_0_rgb(255_255_255/0.25)] hover:bg-paw-blue-dark active:scale-[0.97] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#19043f] motion-reduce:active:scale-100">
            <span className="grid size-6 flex-none place-items-center rounded-full bg-white text-paw-blue transition-[rotate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-90 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"/>
              </svg>
            </span>
            Book New Appointment
          </button>
        </div>
      </div>
    </div>);
}
export default CustomerHomeSection;
