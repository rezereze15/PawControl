import { useState, type FormEvent } from 'react';
import dog_image from "../imports/logindog.png";
import logoName from "../imports/Bigpaw_logoname-removebg-preview.png";
import logoBadge from "../imports/BIGPAW_LOGO-removebg-preview.png";
import "../../css/login.css";

const demoCustomer = {
  username: 'customer',
  password: 'customer123',
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username === demoCustomer.username && password === demoCustomer.password) {
      window.location.assign('/customers');
      return;
    }

    setError('Incorrect username or password.');
  }

  return (
    <div className="login-page">
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

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="username">
                  Username<span className="login-required">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError('');
                  }}
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">
                  Password<span className="login-required">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <p className="login-error" role="alert">{error}</p>}

              <button type="submit" className="login-btn">Login</button>

              <p className="login-signup-text">
                Don't have an account yet?{" "}
                <a href="/register" className="login-signup-link">Sign up</a>{" "}
                to book your pet's visit
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
