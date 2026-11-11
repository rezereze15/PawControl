import type { ReactNode } from "react"

interface StatusBadgeProps {
  children: ReactNode
  className: string
}

export default function StatusBadge({ children, className }: StatusBadgeProps) {
  return <span className={className}>{children}</span>
}
