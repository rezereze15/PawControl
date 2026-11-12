import CustomerDashboard from '../Customer/Dashboard';
import AdminDashboard from '../Admin/Dashboard';
import ClerkDashboard from '../Clerk/Dashboard';
import VeterinarianDashboard from '../Veterinarian/Dashboard';
import OwnerDashboard from '../Owner/Dashboard';
import '../../../css/Dashboard.css';
export default function Dashboard({ role = 'customer' }) {
    const profiles = {
        customer: 'Karina',
        clerk: 'Maloi',
        admin: 'Chaewon',
        veterinarian: 'Haerin',
        owner: 'Asa',
    };
    const username = profiles[role] ?? profiles.customer;
    const logout = () => window.location.assign('/');
    if (role === 'admin')
        return <AdminDashboard username={username} onLogout={logout}/>;
    if (role === 'clerk')
        return <ClerkDashboard username={username} onLogout={logout}/>;
    if (role === 'veterinarian')
        return <VeterinarianDashboard username={username} onLogout={logout}/>;
    if (role === 'owner')
        return <OwnerDashboard username={username} onLogout={logout}/>;
    return <CustomerDashboard username={username} onLogout={logout}/>;
}
