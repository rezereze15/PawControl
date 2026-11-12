import AppointmentStepIndicator from "./AppointmentStepIndicator";
import AppointmentStep1 from "./AppointmentStep1";
import AppointmentStep2 from "./AppointmentStep2";
import AppointmentStep3 from "./AppointmentStep3";
import AppointmentStep4 from "./AppointmentStep4";
import AppointmentStep5 from "./AppointmentStep5";
import { useAppointmentWizard } from "../hooks/useAppointmentWizard";
function AppointmentWizard({ onBack }) {
    const { step, next, back } = useAppointmentWizard();
    return (<div className="paw-appointment-flow flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={onBack} className="text-[#3b0f8c] font-medium hover:underline flex items-center gap-1">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round"/>
          </svg>
          Dashboard
        </button>
        <span className="text-gray-400">â€º</span>
        <span className="text-gray-600 font-medium">Appointment</span>
      </div>

      {/* Card */}
      <div className="paw-appointment-card bg-white rounded-2xl border border-purple-200 p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-[#1a0a3c] mb-1">
          Make an Appointment
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Book a visit for your pet in simple steps.
        </p>
        <div className="border-t border-gray-100 pt-6">
          <AppointmentStepIndicator current={step}/>
          <div className="border-t border-gray-100 pt-6">
            {step === 0 && <AppointmentStep1 onNext={next} onCancel={onBack}/>}
            {step === 1 && <AppointmentStep2 onNext={next} onBack={back}/>}
            {step === 2 && <AppointmentStep3 onNext={next} onBack={back}/>}
            {step === 3 && <AppointmentStep4 onNext={next} onBack={back}/>}
            {step === 4 && <AppointmentStep5 onBack={back} onDone={onBack}/>}
          </div>
        </div>
      </div>
    </div>);
}
export default AppointmentWizard;
