import { useState } from "react";
export function useAppointmentWizard() {
    const [step, setStep] = useState(0);
    const next = () => setStep((current) => Math.min(current + 1, 4));
    const back = () => setStep((current) => Math.max(current - 1, 0));
    const goTo = (target) => setStep(Math.max(0, Math.min(target, 4)));
    return { step, next, back, goTo };
}
