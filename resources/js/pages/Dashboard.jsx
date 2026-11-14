import { useState } from 'react';
import { PersonIcon } from './shared/dashboard/Icons';
import { router, usePage } from '@inertiajs/react';
import FlashToast from '@/Components/FlashToast';
import CompleteProfileModal from '@/Components/CompleteProfileModal';
import UserSettings from './Customer/modules/UserSettings';
import VeterinarianDashboard from './Veterinarian/Dashboard';
import { AppointmentWizard } from './Customer/modules/MakeAppointment';
import LegacyManageUsers from './Admin/components/LegacyManageUsers';
import LegacySalesReports from './Admin/components/LegacySalesReports';
import ClerkDashboard from './Clerk/Dashboard';
import PetMedicalRecords from './Owner/modules/PetMedicalRecords';
import CustomerDashboardLayout from '../Layouts/CustomerDashboardLayout';
import StaffDashboardLayout from '../Layouts/StaffDashboardLayout';
import CustomerHomeSection from './Customer/components/CustomerHomeSection';
import CustomerAppointments from './Customer/modules/Appointments';
import LegacyAdminHomeSection from './Admin/components/LegacyAdminHomeSection';
import StaffHomeSection from './Clerk/components/StaffHomeSection';
import OwnerHomeSection from './Owner/components/OwnerHomeSection';
import DashboardPlaceholder from './shared/dashboard/Placeholder';
import bigpawLogo from '../imports/Bigpaw_logoname-removebg-preview.png';
import karinaPhoto from '../imports/karina.png';
import chaewonPhoto from '../imports/chaewon.png';
import asaPhoto from '../imports/asa.png';
import '../../css/Dashboard.css';
function CustomerDashboard({ username, onLogout, owner, profile, pets, customerAppointments = [], incomingAppointment, upcomingAppointmentCount, flash }) {
    const [section, setSection] = useState("home");
    const [booking, setBooking] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const success = flash?.success
        ? `${flash.success}${flash.referenceNumber ? ` Reference number: ${flash.referenceNumber}.` : ''}`
        : '';
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
    return (<CustomerDashboardLayout username={username} onLogout={onLogout} logoSrc={bigpawLogo} avatarSrc={profile?.photoUrl || karinaPhoto} navItems={navItems} section={section} booking={booking} sidebarOpen={sidebarOpen} onNavigate={(nextSection) => { setSection(nextSection); setBooking(false); }} onToggleSidebar={() => setSidebarOpen((open) => !open)}>
        {booking ? (<AppointmentWizard owner={owner} pets={pets} onBack={() => setBooking(false)} onSuccess={() => setBooking(false)}/>) : (<>
              <FlashToast message={success}/>
              {section === "home" && (<CustomerHomeSection username={username} pets={pets} incomingAppointment={incomingAppointment} upcomingAppointmentCount={upcomingAppointmentCount} onBookAppointment={() => setBooking(true)} onViewRecords={() => setSection("records")} onViewAppointments={() => setSection("appointments")}/>)}
              {section === "records" && (<DashboardPlaceholder title="Pet Medical Records"/>)}
              {section === "appointments" && <CustomerAppointments appointments={customerAppointments} onBookAppointment={() => setBooking(true)}/>}
              {section === "settings" && <UserSettings profile={profile} fallbackAvatar={karinaPhoto}/>}
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
function OwnerDashboard({ username, onLogout, petRecords = [] }) {
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
          {section === "records" && <PetMedicalRecords records={petRecords}/>}
          {section === "sales" && <LegacySalesReports ownerView/>}
          {section === "settings" && <DashboardPlaceholder title="User Settings"/>}
    </StaffDashboardLayout>);
}
export default function Dashboard({ profileCompletion = null, ...props }) {
    const dashboard = <RoleDashboard {...props}/>;
    if (!profileCompletion)
        return dashboard;
    // Google sign-up with missing details: show the dashboard shell (the server sent no
    // data for it) made inert behind the blocking "complete your profile" modal.
    return (<>
      <div inert style={{ display: 'contents' }}>{dashboard}</div>
      <CompleteProfileModal email={profileCompletion.email} firstName={profileCompletion.first_name} middleName={profileCompletion.middle_name} lastName={profileCompletion.last_name} photoUrl={props.profile?.photoUrl}/>
    </>);
}
function RoleDashboard({ role = 'customer', username: authenticatedUsername, owner, profile, pets = [], upcomingAppointments = [], confirmedAppointments = [], patientRecords = [], petRecords = [], customerAppointments = [], incomingAppointment = null, upcomingAppointmentCount = 0, flash }) {
    const { errors = {} } = usePage().props;
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
        return <ClerkDashboard username={username} onLogout={logout} upcomingAppointments={upcomingAppointments} flash={flash} errors={errors}/>;
    if (role === 'veterinarian')
        return <VeterinarianDashboard username={username} onLogout={logout} confirmedAppointments={confirmedAppointments} patientRecords={patientRecords}/>;
    if (role === 'owner')
        return <OwnerDashboard username={username} onLogout={logout} petRecords={petRecords}/>;
    return <DashboardHome username={username} onLogout={logout} owner={owner} profile={profile} pets={pets} customerAppointments={customerAppointments} incomingAppointment={incomingAppointment} upcomingAppointmentCount={upcomingAppointmentCount} flash={flash}/>;
}
function DashboardHome({ username, onLogout, owner, profile, pets, customerAppointments, incomingAppointment, upcomingAppointmentCount, flash }) {
    return <CustomerDashboard username={username} onLogout={onLogout} owner={owner} profile={profile} pets={pets} customerAppointments={customerAppointments} incomingAppointment={incomingAppointment} upcomingAppointmentCount={upcomingAppointmentCount} flash={flash}/>;
}
