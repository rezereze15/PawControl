import type { ReactNode } from "react"

interface FeatureItemProps {
  icon: ReactNode
  bg: string
  title: string
  desc: string
}

function FeatureItem({ icon, bg, title, desc }: FeatureItemProps) {
  return (
    <div className="paw-feature-item">
      <div className="paw-feature-icon" style={{ background: bg }}>{icon}</div>
      <strong>{title}</strong>
      <p>{desc}</p>
    </div>
  );
}

export default FeatureItem
