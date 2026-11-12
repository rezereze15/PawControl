import { useForm } from "@inertiajs/react";
import AppointmentStepIndicator from "./AppointmentStepIndicator";
import AppointmentStep1 from "./AppointmentStep1";
import AppointmentStep2 from "./AppointmentStep2";
import AppointmentStep3 from "./AppointmentStep3";
import AppointmentStep4 from "./AppointmentStep4";
import AppointmentStep5 from "./AppointmentStep5";
import { useAppointmentWizard } from "../hooks/useAppointmentWizard";
function AppointmentWizard({ owner, pets, onBack, onSuccess }) {
    const { step, next, back, goTo } = useAppointmentWizard();
    const form = useForm({
        ar_first_name: "",
        ar_last_name: "",
        pet_id: "",
        notes: "",
        selected_date: "",
        selected_time: "",
        proof_of_down_payment: null,
    });
    const setData = (field, value) => {
        form.setData(field, value);
        form.clearErrors(field, "app_date_time");
    };
    const submit = () => {
        if (!form.data.selected_date || !form.data.selected_time) {
            form.setError("app_date_time", "Please select an appointment date and time.");
            goTo(2);
            return;
        }

        form.transform((data) => ({
            ...data,
            app_date_time: `${data.selected_date}T${data.selected_time}`,
        })).post("/appointments", {
            forceFormData: true,
            onSuccess,
            onError: (errors) => {
                if (errors.ar_first_name || errors.ar_last_name) goTo(0);
                else if (errors.pet_id) goTo(1);
                else if (errors.app_date_time || errors.notes) goTo(2);
                else if (errors.proof_of_down_payment) goTo(3);
            },
        });
    };

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
            {step === 0 && <AppointmentStep1 owner={owner} data={form.data} setData={setData} errors={form.errors} onNext={next} onCancel={onBack}/>}
            {step === 1 && <AppointmentStep2 pets={pets} selectedPetId={form.data.pet_id} onSelectPet={(id) => setData("pet_id", id)} onNext={next} onBack={back}/>}
            {step === 2 && <AppointmentStep3 data={form.data} setData={setData} errors={form.errors} onNext={next} onBack={back}/>}
            {step === 3 && <AppointmentStep4 data={form.data} setData={setData} errors={form.errors} onNext={next} onBack={back}/>}
            {step === 4 && <AppointmentStep5 owner={owner} pets={pets} data={form.data} processing={form.processing} onBack={back} onDone={submit}/>}
          </div>
        </div>
      </div>
    </div>);
}
export default AppointmentWizard;
