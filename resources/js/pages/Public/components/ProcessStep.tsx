import type { ReactNode } from "react"

interface ProcessStepProps {
  n: number
  icon: ReactNode
  bg: string
  label: string
  desc: string
}

function ProcessStep({ n, icon, bg, label, desc }: ProcessStepProps) {
  return (
    <div className="paw-step">
      <div className="paw-step-icon" style={{ background: bg }}>{icon}</div>
      <div className="paw-step-num">{n}</div>
      <strong>{label}</strong>
      <p>{desc}</p>
    </div>
  );
}

export default ProcessStep
