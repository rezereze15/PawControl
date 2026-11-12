import CustomerDashboard from './Dashboard';
import '../../../css/Dashboard.css';
export default function Customers() {
    return (<CustomerDashboard username="Karina" onLogout={() => window.location.assign('/')}/>);
}
