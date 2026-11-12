import { useState } from 'react';
import StaffDashboardLayout from '@/Layouts/StaffDashboardLayout';
import { PersonIcon } from '../shared/dashboard/Icons';
import { bigpawLogo, chaewonPhoto } from '../shared/dashboard/assets';
import AdminHomeSection from './components/AdminHomeSection';
import AdminManageUsers from './modules/ManageUsers';
import DashboardPlaceholder from '../shared/dashboard/Placeholder';
export { DashboardPlaceholder as AdminPlaceholder };
export default function AdminDashboard({ username, onLogout, }) {
    const [section, setSection] = useState("home");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navItems = [
        {
            id: "home",
            label: "Home",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>),
        },
        {
            id: "services",
            label: "Manage Services",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round"/>
        </svg>),
        },
        {
            id: "supplies",
            label: "Manage Medical Supplies",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 3h6v4l3 3v10H6V10l3-3V3Z" strokeLinejoin="round"/>
          <path d="M9 7h6M12 11v6M9 14h6" strokeLinecap="round"/>
        </svg>),
        },
        {
            id: "users",
            label: "Manage Users",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="7" r="4"/>
          <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round"/>
          <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round"/>
          <path d="M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round"/>
        </svg>),
        },
        {
            id: "settings",
            label: "User Settings",
            icon: <PersonIcon className="w-5 h-5" color="currentColor"/>,
        },
    ];
    return (<StaffDashboardLayout username={username} roleLabel="Admin" dashboardClassName="paw-admin-dashboard" logoSrc={bigpawLogo} logoAlt="BigPaw" avatarSrc={chaewonPhoto} avatarAlt="" avatarClassName="w-9 h-9 rounded-full bg-rose-400 flex items-center justify-center overflow-hidden border-2 border-orange-400" navItems={navItems} section={section} onSectionChange={setSection} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} onLogout={onLogout}>
    {section === "home" && <AdminHomeSection username={username}/>}
          {section === "services" && <DashboardPlaceholder title="Manage Services"/>}
          {section === "supplies" && <DashboardPlaceholder title="Manage Medical Supplies"/>}
          {section === "users" && <AdminManageUsers />}
          {section === "settings" && <DashboardPlaceholder title="User Settings"/>}
    </StaffDashboardLayout>);
}
// â”€â”€â”€ Clerk Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
