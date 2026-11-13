import { useEffect, useState } from 'react';
import { PersonIcon } from './shared/dashboard/Icons';
import { router } from '@inertiajs/react';
import { AppointmentWizard } from './Customer/modules/MakeAppointment';
import LegacyManageUsers from './Admin/components/LegacyManageUsers';
import LegacySalesReports from './Admin/components/LegacySalesReports';
import LegacyAppointments from './Clerk/components/LegacyAppointments';
import ClerkDashboard from './Clerk/Dashboard';
import CustomerDashboardLayout from '../Layouts/CustomerDashboardLayout';
import StaffDashboardLayout from '../Layouts/StaffDashboardLayout';
import CustomerHomeSection from './Customer/components/CustomerHomeSection';
import CustomerAppointments from './Customer/modules/Appointments';
import LegacyAdminHomeSection from './Admin/components/LegacyAdminHomeSection';
import StaffHomeSection from './Clerk/components/StaffHomeSection';
import OwnerHomeSection from './Owner/components/OwnerHomeSection';
import DashboardPlaceholder, { ClerkPlaceholder } from './shared/dashboard/Placeholder';
import bigpawLogo from '../imports/Bigpaw_logoname-removebg-preview.png';
import haerinPhoto from '../imports/haerin.png';
import karinaPhoto from '../imports/karina.png';
import chaewonPhoto from '../imports/chaewon.png';
import asaPhoto from '../imports/asa.png';
import '../../css/Dashboard.css';
function CustomerDashboard({ username, onLogout, owner, pets, customerAppointments = [], incomingAppointment, upcomingAppointmentCount, flash }) {
    const [section, setSection] = useState("home");
    const [booking, setBooking] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const success = flash?.success
        ? `${flash.success}${flash.referenceNumber ? ` Reference number: ${flash.referenceNumber}.` : ''}`
        : '';
    const [dismissedSuccess, setDismissedSuccess] = useState(false);
    useEffect(() => {
        setDismissedSuccess(false);
        if (!success) return undefined;

        const timeout = window.setTimeout(() => setDismissedSuccess(true), 6000);
        return () => window.clearTimeout(timeout);
    }, [success]);
    const navItems = [
        {
            id: "home",
            label: "Home",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>),
        },
        {
            id: "records",
            label: "Pet Medical Records",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round"/>
        </svg>),
        },
        {
            id: "appointments",
            label: "Appointments",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
        </svg>),
        },
        {
            id: "settings",
            label: "User Settings",
            icon: <PersonIcon className="w-5 h-5" color="currentColor"/>,
        },
    ];
    return (<CustomerDashboardLayout username={username} onLogout={onLogout} logoSrc={bigpawLogo} avatarSrc={karinaPhoto} navItems={navItems} section={section} booking={booking} sidebarOpen={sidebarOpen} onNavigate={(nextSection) => { setSection(nextSection); setBooking(false); }} onToggleSidebar={() => setSidebarOpen((open) => !open)}>
        {booking ? (<AppointmentWizard owner={owner} pets={pets} onBack={() => setBooking(false)} onSuccess={() => setBooking(false)}/>) : (<>
              {success && !dismissedSuccess && <div className="paw-success-toast fixed left-4 right-4 top-4 z-[60] flex items-start gap-3 overflow-hidden rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl shadow-emerald-950/10 sm:left-auto sm:right-6 sm:top-6 sm:w-[min(24rem,calc(100vw-3rem))]" role="status" aria-live="polite">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="min-w-0 flex-1 pt-0.5">
                  <span className="block text-sm font-bold text-slate-900">Success</span>
                  <span className="mt-0.5 block text-sm leading-5 text-slate-600">{success}</span>
                </span>
                <button type="button" onClick={() => setDismissedSuccess(true)} aria-label="Dismiss success message" className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/>
                  </svg>
                </button>
                <span className="paw-toast-progress absolute inset-x-0 bottom-0 h-1 origin-left bg-emerald-500" aria-hidden="true" />
              </div>}
              {section === "home" && (<CustomerHomeSection username={username} pets={pets} incomingAppointment={incomingAppointment} upcomingAppointmentCount={upcomingAppointmentCount} onBookAppointment={() => setBooking(true)} onViewRecords={() => setSection("records")} onViewAppointments={() => setSection("appointments")}/>)}
              {section === "records" && (<DashboardPlaceholder title="Pet Medical Records"/>)}
              {section === "appointments" && <CustomerAppointments appointments={customerAppointments} onBookAppointment={() => setBooking(true)}/>}
              {section === "settings" && (<DashboardPlaceholder title="User Settings"/>)}
            </>)}
    </CustomerDashboardLayout>);
}
function AdminDashboard({ username, onLogout, }) {
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
    return (<StaffDashboardLayout username={username} onLogout={onLogout} roleLabel="Admin" dashboardClassName="paw-admin-dashboard" logoSrc={bigpawLogo} logoAlt="BigPaw" avatarSrc={chaewonPhoto} avatarAlt="" avatarClassName="w-9 h-9 rounded-full bg-rose-400 flex items-center justify-center overflow-hidden border-2 border-orange-400" navItems={navItems} section={section} onSectionChange={setSection} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)}>
    {section === "home" && <LegacyAdminHomeSection username={username}/>}
          {section === "services" && <DashboardPlaceholder title="Manage Services"/>}
          {section === "supplies" && <DashboardPlaceholder title="Manage Medical Supplies"/>}
          {section === "users" && <LegacyManageUsers />}
          {section === "settings" && <DashboardPlaceholder title="User Settings"/>}
    </StaffDashboardLayout>);
}
function VeterinarianDashboard({ username, onLogout, }) {
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
            id: "records",
            label: "Pet Medical Records",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round"/>
        </svg>),
        },
        {
            id: "appointments",
            label: "Appointments",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
        </svg>),
        },
        {
            id: "settings",
            label: "User Settings",
            icon: <PersonIcon className="w-5 h-5" color="currentColor"/>,
        },
    ];
    return (<StaffDashboardLayout username={username} onLogout={onLogout} roleLabel="Veterinarian" dashboardClassName="paw-vet-dashboard" logoSrc={bigpawLogo} logoAlt="BigPaw" avatarSrc={haerinPhoto} avatarAlt="Haerin" avatarClassName="w-9 h-9 rounded-full bg-violet-400 flex items-center justify-center overflow-hidden border-2 border-orange-400" navItems={navItems} section={section} onSectionChange={setSection} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)}>
        {section === "home" && (<StaffHomeSection username={username} role="Veterinarian"/>)}
          {section === "records" && (<ClerkPlaceholder title="Pet Medical Records"/>)}
          {section === "appointments" && <LegacyAppointments veterinarianView/>}
          {section === "settings" && <ClerkPlaceholder title="User Settings"/>}
    </StaffDashboardLayout>);
}
function OwnerDashboard({ username, onLogout, }) {
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
            id: "records",
            label: "Pet Medical Records",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2"/>
          <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round"/>
        </svg>),
        },
        {
            id: "sales",
            label: "Sales Reports",
            icon: (<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4" strokeLinecap="round"/>
          <path d="M6 10l3 3 3-3 4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>),
        },
        {
            id: "settings",
            label: "User Settings",
            icon: <PersonIcon className="w-5 h-5" color="currentColor"/>,
        },
    ];
    return (<StaffDashboardLayout username={username} onLogout={onLogout} roleLabel="Owner" dashboardClassName="paw-owner-dashboard" logoSrc={bigpawLogo} logoAlt="BigPaw" avatarSrc={asaPhoto} avatarAlt="Owner" avatarClassName="w-9 h-9 rounded-full bg-amber-300 flex items-center justify-center overflow-hidden border-2 border-orange-400" navItems={navItems} section={section} onSectionChange={setSection} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)}>
    {section === "home" && <OwnerHomeSection username={username}/>}
          {section === "records" && (<DashboardPlaceholder title="Pet Medical Records"/>)}
          {section === "sales" && <LegacySalesReports ownerView/>}
          {section === "settings" && <DashboardPlaceholder title="User Settings"/>}
    </StaffDashboardLayout>);
}
export default function Dashboard({ role = 'customer', username: authenticatedUsername, owner, pets = [], upcomingAppointments = [], customerAppointments = [], incomingAppointment = null, upcomingAppointmentCount = 0, flash }) {
    const profiles = {
        customer: 'Karina',
        clerk: 'Maloi',
        admin: 'Chaewon',
        veterinarian: 'Haerin',
        owner: 'Asa',
    };
    const username = authenticatedUsername || profiles[role] || profiles.customer;
    const logout = () => router.post('/logout');
    if (role === 'admin')
        return <AdminDashboard username={username} onLogout={logout}/>;
    if (role === 'clerk')
        return <ClerkDashboard username={username} onLogout={logout} upcomingAppointments={upcomingAppointments}/>;
    if (role === 'veterinarian')
        return <VeterinarianDashboard username={username} onLogout={logout}/>;
    if (role === 'owner')
        return <OwnerDashboard username={username} onLogout={logout}/>;
    return <DashboardHome username={username} onLogout={logout} owner={owner} pets={pets} customerAppointments={customerAppointments} incomingAppointment={incomingAppointment} upcomingAppointmentCount={upcomingAppointmentCount} flash={flash}/>;
}
function DashboardHome({ username, onLogout, owner, pets, customerAppointments, incomingAppointment, upcomingAppointmentCount, flash }) {
    return <CustomerDashboard username={username} onLogout={onLogout} owner={owner} pets={pets} customerAppointments={customerAppointments} incomingAppointment={incomingAppointment} upcomingAppointmentCount={upcomingAppointmentCount} flash={flash}/>;
}
