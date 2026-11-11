interface DashboardPlaceholderProps {
  title: string
}

function DashboardPlaceholder({ title }: DashboardPlaceholderProps) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">{title}</h1>
      <div className="bg-white rounded-2xl p-12 shadow-sm flex items-center justify-center text-gray-400 text-sm">
        {title} content coming soon.
      </div>
    </div>
  )
}

export const ClerkPlaceholder = DashboardPlaceholder

export default DashboardPlaceholder

// â”€â”€â”€ Owner Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
