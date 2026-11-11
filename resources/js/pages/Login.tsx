import { useState, type FormEvent } from 'react';
import LoginForm from '@/Components/LoginForm';
import dog_image from "../imports/logindog.png";
import logoName from "../imports/Bigpaw_logoname-removebg-preview.png";
import logoBadge from "../imports/BIGPAW_LOGO-removebg-preview.png";
import "../../css/login.css";

const USERS = [
  { username: 'customer', password: 'customer123', name: 'Karina', role: 'customer' },
  { username: 'clerk', password: 'clerk123', name: 'Maloi', role: 'clerk' },
  { username: 'admin', password: 'admin123', name: 'Chaewon', role: 'admin' },
  { username: 'veterinarian', password: 'veterinarian123', name: 'Haerin', role: 'veterinarian' },
  { username: 'owner', password: 'owner123', name: 'Asa', role: 'owner' },
] as const;

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = USERS.find(
      (candidate) => candidate.username === username && candidate.password === password,
    );

    if (user) {
      window.location.assign(user.role === 'customer' ? '/customers' : `/dashboard/${user.role}`);
      return;
    }

    setError('Incorrect username or password.');
  }

  return (
    <div className="login-page login-screen">
      <header className="login-header">
        <a href="/" className="login-logo">
          <img src={logoName} alt="PawControl" className="login-logo-img" />
        </a>
        <nav className="login-nav">
          <a href="#">Home</a>
          <a href="#">About Us</a>
          <a href="#">Services</a>
          <a href="#">How it works</a>
        </nav>
      </header>

      <div className="login-accent-bar" />

      <main className="login-main">
        <div className="login-photo-wrap">
          <img src={dog_image} alt="Puppies at a veterinary clinic" className="login-photo" />
        </div>

        <div className="login-card-outer">
          <div className="login-badge">
            <img src={logoBadge} alt="Big Paws Animal Clinic" className="login-badge-img" />
          </div>

          <div className="login-card-inner">
            <h1 className="login-title">Login</h1>
            <div className="login-divider" />

            <LoginForm
              username={username}
              password={password}
              error={error}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onClearError={() => setError("")}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
