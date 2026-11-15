import { useState } from "react";
/** `initialStep` lets a restored booking draft resume where it left off. */
export function useAppointmentWizard(initialStep = 0) {
    const [step, setStep] = useState(() => Math.max(0, Math.min(initialStep, 4)));
    const next = () => setStep((current) => Math.min(current + 1, 4));
    const back = () => setStep((current) => Math.max(current - 1, 0));
    const goTo = (target) => setStep(Math.max(0, Math.min(target, 4)));
    return { step, next, back, goTo };
}
