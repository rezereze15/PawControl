import { useState } from 'react';
import { router } from '@inertiajs/react';
import StaffDashboardLayout from '@/Layouts/StaffDashboardLayout';
import VetHomeSection from './components/VetHomeSection';
import { PersonIcon } from '../shared/dashboard/Icons';
import { bigpawLogo } from '../shared/dashboard/assets';
import FlashToast from '@/Components/FlashToast';
import { veterinarianNotifications } from '../shared/dashboard/notifications';
import UserSettings from '../Customer/modules/UserSettings';
import VetAppointments from './modules/VetAppointments';
import PatientRecords from './modules/PatientRecords';
import MedicalRecordEditor from './components/MedicalRecordEditor';
import ConfirmSelectDialog from './components/ConfirmSelectDialog';
import { isLocked } from '../shared/dashboard/recordStatus';
export default function VeterinarianDashboard({ username, onLogout, profile, flash, confirmedAppointments = [], patientRecords = [], recordOptions = {}, vetHome = {} }) {
    const [section, setSection] = useState("home");
    const [editingId, setEditingId] = useState(null);
    const [selectingId, setSelectingId] = useState(null);
    // Looked up on every render so the editor shows fresh data after each save / upload.
    const editingPatient = editingId ? patientRecords.find((p) => p.visits.some((v) => v.id === editingId)) : null;
    // Never shows a Completed (locked) record, e.g. one completed in another tab.
    const editingRecord = editingPatient?.visits.find((v) => v.id === editingId && !isLocked(v.recordStatus)) ?? null;

    const [confirmingId, setConfirmingId] = useState(null);
    const confirmingPatient = confirmingId ? patientRecords.find((p) => p.visits.some((v) => v.id === confirmingId)) : null;
    const confirmingRecord = confirmingPatient?.visits.find((v) => v.id === confirmingId) ?? null;

    /**
     * The vet's action on a record, opened from the pet record modal:
     * Upcoming → "Select" (after an "Are you sure?" prompt) → Selected;
     * Selected → "Start Diagnosis" → Ongoing, opened in edit mode;
     * Ongoing → opened in edit mode. Completed records are locked: nothing happens.
     */
    function selectRecord(record) {
        if (isLocked(record.recordStatus)) return;
        if (record.recordStatus === "Upcoming") {
            setConfirmingId(record.id);
            return;
        }
        if (record.recordStatus !== "Selected") {
            setEditingId(record.id);
            return;
        }
        setSelectingId(record.id);
        router.post(`/medical-records/${record.id}/start`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setEditingId(record.id),
            onFinish: () => setSelectingId(null),
        });
    }

    function confirmSelect() {
        const id = confirmingId;
        setSelectingId(id);
        router.post(`/medical-records/${id}/select`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setConfirmingId(null),
            onFinish: () => setSelectingId(null),
        });
    }
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
    return (<StaffDashboardLayout username={username} roleLabel="Veterinarian" dashboardClassName="paw-vet-dashboard" logoSrc={bigpawLogo} logoAlt="BigPaw" avatarSrc={profile?.photoUrl} navItems={navItems} section={section} onSectionChange={setSection} sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((open) => !open)} onLogout={onLogout} notifications={veterinarianNotifications(confirmedAppointments)} notificationKey={`paw-notifications-read:${profile?.id ?? username}`}>
        <FlashToast message={flash?.success}/>
        {section === "home" && <VetHomeSection username={username} stats={vetHome} appointments={confirmedAppointments} patients={patientRecords} onNavigate={setSection} onSelectRecord={selectRecord} selectingId={selectingId}/>}
          {section === "records" && <PatientRecords patients={patientRecords} onSelectRecord={selectRecord} selectingId={selectingId}/>}
          {section === "appointments" && <VetAppointments appointments={confirmedAppointments} patients={patientRecords}/>}
          {confirmingRecord && <ConfirmSelectDialog patient={confirmingPatient} record={confirmingRecord} busy={selectingId === confirmingRecord.id} onConfirm={confirmSelect} onCancel={() => setConfirmingId(null)}/>}
          {editingRecord && <MedicalRecordEditor key={editingRecord.id} patient={editingPatient} record={editingRecord} options={recordOptions} onClose={() => setEditingId(null)}/>}
          {section === "settings" && <UserSettings profile={profile}/>}
    </StaffDashboardLayout>);
}
