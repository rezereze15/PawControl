import { useState, type ReactNode } from 'react';
import { AppointmentWizard } from './modules/MakeAppointment';
import CustomerDashboardLayout from '@/Layouts/CustomerDashboardLayout';
import DashboardPlaceholder from '../shared/dashboard/Placeholder';
import CustomerHomeSection from './components/CustomerHomeSection';
import { PersonIcon } from '../shared/dashboard/Icons';
import { bigpawLogo, karinaPhoto } from '../shared/dashboard/assets';
type DashSection = "home" | "records" | "appointments" | "settings"

export default function CustomerDashboard({
  username,
  onLogout,
}: {
  username: string
  onLogout: () => void
}) {
  const [section, setSection] = useState<DashSection>("home")
  const [booking, setBooking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems: { id: DashSection; label: string; icon: ReactNode }[] = [
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
      id: "settings",
      label: "User Settings",
      icon: <PersonIcon className="w-5 h-5" color="currentColor" />,
    },
  ]

  return (
    <CustomerDashboardLayout username={username} onLogout={onLogout} logoSrc={bigpawLogo} avatarSrc={karinaPhoto} navItems={navItems} section={section} booking={booking} sidebarOpen={sidebarOpen} onNavigate={(nextSection) => { setSection(nextSection); setBooking(false) }} onToggleSidebar={() => setSidebarOpen((open) => !open)}>
{booking ? (
            <AppointmentWizard onBack={() => setBooking(false)} />
          ) : (
            <>
              {section === "home" && (
                <CustomerHomeSection
                  username={username}
                  onBookAppointment={() => setBooking(true)}
                  onViewRecords={() => setSection("records")}
                  onViewAppointments={() => setSection("appointments")}
                />
              )}
              {section === "records" && (
                <DashboardPlaceholder title="Pet Medical Records" />
              )}
              {section === "appointments" && (
                <DashboardPlaceholder title="Appointments" />
              )}
              {section === "settings" && (
                <DashboardPlaceholder title="User Settings" />
              )}
            </>
          )}
    </CustomerDashboardLayout>
  )
}

