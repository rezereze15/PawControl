import { useState, type ReactNode } from 'react';
import StaffDashboardLayout from '@/Layouts/StaffDashboardLayout';
import { CalendarIcon, PersonIcon } from '../shared/dashboard/Icons';
import { bigpawLogo, asaPhoto } from '../shared/dashboard/assets';
import { AdminPlaceholder } from '../Admin/Dashboard';
import { AdminSalesReports } from '../shared/dashboard/SalesReports';
import OwnerHomeSection from './components/OwnerHomeSection';
type OwnerSection = "home" | "records" | "sales" | "settings"

export default function OwnerDashboard({
  username,
  onLogout,
}: {
  username: string
  onLogout: () => void
}) {
  const [section, setSection] = useState<OwnerSection>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems: { id: OwnerSection; label: string; icon: ReactNode }[] = [
    {
      id: "home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
    },
    {
      id: "records",
      label: "Pet Medical Records",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "sales",
      label: "Sales Reports",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" strokeLinecap="round" />
          <path
            d="M6 10l3 3 3-3 4 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "User Settings",
      icon: <PersonIcon className="w-5 h-5" color="currentColor" />,
    },
  ]

  return (
    <StaffDashboardLayout username={username} roleLabel="Owner" dashboardClassName="paw-owner-dashboard" logoSrc={bigpawLogo} logoAlt="BigPaw" avatarSrc={asaPhoto} avatarAlt="Asa" avatarClassName="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center overflow-hidden border-2 border-orange-400" navItems={navItems} section={section} onSectionChange={setSection} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} onLogout={onLogout}>
{section === "home" && <OwnerHomeSection username={username} />}
          {section === "records" && (
            <AdminPlaceholder title="Pet Medical Records" />
          )}
          {section === "sales" && <AdminSalesReports ownerView />}
          {section === "settings" && <AdminPlaceholder title="User Settings" />}
    </StaffDashboardLayout>
  )
}

// â”€â”€â”€ App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
