import { useForm } from '@inertiajs/react';
import LoginForm from '@/Components/LoginForm';
import dog_image from "../../imports/logindog.png";
import logoName from "../../imports/Bigpaw_logoname-removebg-preview.png";
import logoBadge from "../../imports/BIGPAW_LOGO-removebg-preview.png";
import "../../../css/login.css";
export default function Login() {
    const form = useForm({ username: '', password: '' });
    function handleSubmit(event) {
        event.preventDefault();
        form.post('/login');
    }
    return (<div className="login-page login-screen">
      <header className="login-header">
        <a href="/" className="login-logo">
          <img src={logoName} alt="PawControl" className="login-logo-img"/>
        </a>
        <nav className="login-nav">
          <a href="#">Home</a>
          <a href="#">About Us</a>
          <a href="#">Services</a>
          <a href="#">How it works</a>
        </nav>
      </header>

      <div className="login-accent-bar"/>

      <main className="login-main">
        <div className="login-photo-wrap">
          <img src={dog_image} alt="Puppies at a veterinary clinic" className="login-photo"/>
        </div>

        <div className="login-card-outer">
          <div className="login-badge">
            <img src={logoBadge} alt="Big Paws Animal Clinic" className="login-badge-img"/>
          </div>

          <div className="login-card-inner">
            <h1 className="login-title">Login</h1>
            <div className="login-divider"/>

            <LoginForm username={form.data.username} password={form.data.password} error={form.errors.username ?? form.errors.password ?? ''} onUsernameChange={(username) => form.setData('username', username)} onPasswordChange={(password) => form.setData('password', password)} onClearError={() => form.clearErrors()} onSubmit={handleSubmit}/>
          </div>
        </div>
      </main>
    </div>);
}
