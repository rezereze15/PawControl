import { Head } from '@inertiajs/react';
import PawBackdrop from './PawBackdrop';
import { cx, ui } from '@/Components/authStyles';
import logoName from '../imports/Bigpaw_logoname-removebg-preview.png';
import logoBadge from '../imports/BIGPAW_LOGO-removebg-preview.png';
import '../../css/login.css';

/**
 * Shared shell for Login / Register / VerifyCode / Forgot & Reset password:
 * site header + gold accent bar (login.css), and the split card (photo panel + content
 * panel) styled with Tailwind classes from authStyles.js.
 */
export default function AuthLayout({ title, image, imageAlt, eyebrow = 'Big Paws Animal Clinic', caption, kicker, heading, subtitle, wide = false, children }) {
    return (<div className="login-page">
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

      <main className={ui.main}>
        <PawBackdrop />
        <section className={cx(ui.card, wide ? ui.cardWide : ui.cardNormal)} aria-labelledby="signin-title">
          <aside className={ui.visual}>
            <img src={image} alt={imageAlt} className={ui.visualImg}/>
            <div className={ui.visualOverlay}/>
            <div className={ui.visualContent}>
              <img src={logoBadge} alt="Big Paws Animal Clinic" className={ui.badge}/>
              <div className={ui.visualCopy}>
                <p className={ui.eyebrow}>{eyebrow}</p>
                <p className={ui.visualTitle}>{caption}</p>
              </div>
            </div>
          </aside>

          <div className={ui.panel}>
            <header className={ui.panelHead}>
              <p className={ui.kicker}>{kicker}</p>
              <h1 id="signin-title" className={ui.title}>{heading}</h1>
              {subtitle && <p className={ui.subtitle}>{subtitle}</p>}
            </header>

            {children}
          </div>
        </section>
      </main>
    </div>);
}
