import type { ReactNode } from "react"

interface DataTableProps {
  children: ReactNode
  className?: string
}

export default function DataTable({ children, className = "" }: DataTableProps) {
  return <table className={className}>{children}</table>
}
