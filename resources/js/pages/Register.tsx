import registerCatImage from '../imports/registerCat.png';
import logoName from '../imports/Bigpaw_logoname-removebg-preview.png';
import logoBadge from '../imports/BIGPAW_LOGO-removebg-preview.png';
import '../../css/Register.css';

export default function Register() {
  return (
    <div className="login-page">
      <header className="login-header">
        <a href="/" className="login-logo">
          <img src={logoName} alt="PawControl" className="login-logo-img" />
        </a>
        <nav className="login-nav">
          <a href="/">Home</a>
          <a href="#">About Us</a>
          <a href="#">Services</a>
          <a href="#">How it works</a>
        </nav>
      </header>

      <div className="login-accent-bar" />

      <main className="login-main register-main">
        <div className="login-photo-wrap">
          <img src={registerCatImage} alt="Cat at a veterinary clinic" className="login-photo" />
        </div>

        <div className="login-card-outer register-card-outer">
          <div className="login-badge">
            <img src={logoBadge} alt="Big Paws Animal Clinic" className="login-badge-img" />
          </div>

          <div className="login-card-inner">
            <h1 className="login-title">Create Account</h1>
            <div className="login-divider" />

            <form className="login-form" onSubmit={(event) => event.preventDefault()}>
              <div className="register-name-fields">
                <div className="login-field">
                  <label htmlFor="first-name">First Name<span className="login-required">*</span></label>
                  <input id="first-name" type="text" placeholder="Enter your first name" />
                </div>

                <div className="login-field">
                  <label htmlFor="middle-name">Middle Name</label>
                  <input id="middle-name" type="text" placeholder="Enter your middle name" />
                </div>

                <div className="login-field">
                  <label htmlFor="last-name">Last Name<span className="login-required">*</span></label>
                  <input id="last-name" type="text" placeholder="Enter your last name" />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="username">Username<span className="login-required">*</span></label>
                <input id="username" type="text" placeholder="Choose a username" />
              </div>

              <div className="login-field">
                <label htmlFor="address">Address<span className="login-required">*</span></label>
                <input id="address" type="text" placeholder="Enter your address" />
              </div>

              <div className="login-field">
                <label htmlFor="email">Email Address<span className="login-required">*</span></label>
                <input id="email" type="email" placeholder="Enter your email address" />
              </div>

              <div className="login-field">
                <label htmlFor="contact-number">Contact Number<span className="login-required">*</span></label>
                <input id="contact-number" type="tel" placeholder="Enter your contact number" />
              </div>

              <div className="login-field">
                <label htmlFor="password">Password<span className="login-required">*</span></label>
                <input id="password" type="password" placeholder="Create a password" />
              </div>

              <div className="login-field">
                <label htmlFor="password-confirmation">Confirm Password<span className="login-required">*</span></label>
                <input id="password-confirmation" type="password" placeholder="Confirm your password" />
              </div>

              <button type="submit" className="login-btn">Create Account</button>

              <p className="login-signup-text">
                Already have an account? <a href="/login" className="login-signup-link">Log in</a>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
