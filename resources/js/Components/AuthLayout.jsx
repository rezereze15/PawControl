import { Head } from '@inertiajs/react';
import PawBackdrop from './PawBackdrop';
import logoName from '../imports/Bigpaw_logoname-removebg-preview.png';
import logoBadge from '../imports/BIGPAW_LOGO-removebg-preview.png';
import '../../css/login.css';
import '../../css/AuthPage.css';

/**
 * Shared shell for Login / Register / VerifyCode: site header, gold accent bar,
 * and the split card (photo panel + content panel).
 */
export default function AuthLayout({ title, image, imageAlt, eyebrow = 'Big Paws Animal Clinic', caption, kicker, heading, subtitle, wide = false, children }) {
    return (<div className="login-page signin-page">
      <Head title={title}/>
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

      <main className="signin-main">
        <PawBackdrop />
        <section className={`signin-card${wide ? ' signin-card--wide' : ''}`} aria-labelledby="signin-title">
          <aside className="signin-visual">
            <img src={image} alt={imageAlt} className="signin-visual-img"/>
            <div className="signin-visual-overlay"/>
            <div className="signin-visual-content">
              <img src={logoBadge} alt="Big Paws Animal Clinic" className="signin-badge"/>
              <div className="signin-visual-copy">
                <p className="signin-eyebrow">{eyebrow}</p>
                <p className="signin-visual-title">{caption}</p>
              </div>
            </div>
          </aside>

          <div className="signin-panel">
            <header className="signin-panel-head">
              <p className="signin-kicker">{kicker}</p>
              <h1 id="signin-title" className="signin-title">{heading}</h1>
              {subtitle && <p className="signin-subtitle">{subtitle}</p>}
            </header>

            {children}
          </div>
        </section>
      </main>
    </div>);
}
