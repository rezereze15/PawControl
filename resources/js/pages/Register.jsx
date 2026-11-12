import RegisterForm from '@/Components/RegisterForm';
import registerCatImage from '../imports/registerCat.png';
import logoName from '../imports/Bigpaw_logoname-removebg-preview.png';
import logoBadge from '../imports/BIGPAW_LOGO-removebg-preview.png';
import '../../css/Register.css';
export default function Register() {
    return (<div className="login-page">
      <header className="login-header">
        <a href="/" className="login-logo">
          <img src={logoName} alt="PawControl" className="login-logo-img"/>
        </a>
        <nav className="login-nav">
          <a href="/">Home</a>
          <a href="#">About Us</a>
          <a href="#">Services</a>
          <a href="#">How it works</a>
        </nav>
      </header>

      <div className="login-accent-bar"/>

      <main className="login-main register-main">
        <div className="login-photo-wrap">
          <img src={registerCatImage} alt="Cat at a veterinary clinic" className="login-photo"/>
        </div>

        <div className="login-card-outer register-card-outer">
          <div className="login-badge">
            <img src={logoBadge} alt="Big Paws Animal Clinic" className="login-badge-img"/>
          </div>

          <div className="login-card-inner">
            <h1 className="login-title">Create Account</h1>
            <div className="login-divider"/>

            <RegisterForm />
          </div>
        </div>
      </main>
    </div>);
}
