import { useState, type ReactNode } from 'react';
import StaffDashboardLayout from '@/Layouts/StaffDashboardLayout';
import StaffHomeSection from './components/StaffHomeSection';
import { CalendarIcon, PersonIcon } from '../shared/dashboard/Icons';
import { bigpawLogo, maloiPhoto } from '../shared/dashboard/assets';
import { ClerkPlaceholder } from '../shared/dashboard/Placeholder';
import { ClerkAppointments } from './modules/Appointments';
type ClerkSection = "home" | "records" | "appointments" | "billings" | "settings"



export default function ClerkDashboard({
  username,
  onLogout,
}: {
  username: string
  onLogout: () => void
}) {
  const [section, setSection] = useState<ClerkSection>("home")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems: { id: ClerkSection; label: string; icon: ReactNode }[] = [
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
      id: "appointments",
      label: "Appointments",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "billings",
      label: "Billings",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
          <path
            d="M16 16l2 2 4-4"
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
    <StaffDashboardLayout username={username} roleLabel="Clerk" dashboardClassName="paw-clerk-dashboard" logoSrc={bigpawLogo} logoAlt="BigPaw" avatarSrc={maloiPhoto} avatarAlt="" avatarClassName="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center overflow-hidden border-2 border-orange-400" navItems={navItems} section={section} onSectionChange={setSection} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} onLogout={onLogout}>
{section === "home" && (
            <StaffHomeSection username={username} role="Clerk" />
          )}
          {section === "records" && (
            <ClerkPlaceholder title="Pet Medical Records" />
          )}
          {section === "appointments" && <ClerkAppointments />}
          {section === "billings" && <ClerkPlaceholder title="Billings" />}
          {section === "settings" && <ClerkPlaceholder title="User Settings" />}
    </StaffDashboardLayout>
  )
}

