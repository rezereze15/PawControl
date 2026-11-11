import FeatureItem from '@/pages/Public/components/FeatureItem';
import ProcessStep from '@/pages/Public/components/ProcessStep';
import SocialIcon from '@/pages/Public/components/SocialIcon';
import petImage from '../imports/landingpagepet.png';
import logoName from '../imports/Bigpaw_logoname-removebg-preview.png';
import pawLogo from '../imports/pawlogo.png';

export default function App() {
  return (
    <div className="paw-app">
      {/* NAV */}
      <nav className="paw-nav">
        <div className="paw-nav-inner">
          <a href="/" className="paw-logo">
            <img src={logoName} alt="PawControl" className="paw-logo-img" />
          </a>
          <ul className="paw-nav-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Services</a></li>
            <li><a href="#">How it works</a></li>
          </ul>
          <a href="/login" className="paw-login-btn">Login</a>
        </div>
        <div className="paw-nav-border" />
      </nav>

      {/* HERO */}
      <section className="paw-hero">
        <div className="paw-hero-text">
          <h1>
            Easy Appointments,<br />
            <span className="paw-purple">Healthy Pets,</span><br />
            <span className="paw-orange">Big Paws</span>
          </h1>
          <p>
            Because your pets deserve the best care—PawControl helps you stay
            connected to their health anytime, anywhere.
          </p>
          <div className="paw-hero-btns">
            <button className="paw-btn-primary">Book an Appointment</button>
            <button className="paw-btn-outline">Learn More</button>
          </div>
        </div>
        <div className="paw-hero-img-wrap">
          <img src={petImage} alt="A cat and dog sitting together" className="paw-pet-img" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="paw-features">
        <div className="paw-features-card">
          <FeatureItem
            icon={<CalendarIcon color="#4C2F97" />}
            bg="#EDE9F8"
            title="Easy Booking"
            desc="Book appointment in just a few clicks"
          />
          <FeatureItem
            icon={<img src={pawLogo} alt="" />}
            bg="#FEF3C7"
            title="Pet Management"
            desc="Keep all your pet's information organized"
          />
          <FeatureItem
            icon={<BellIcon color="#4C2F97" />}
            bg="#EDE9F8"
            title="Reminders"
            desc="Get notified so you never miss an appointment"
          />
          <FeatureItem
            icon={<ShieldIcon color="#F59E0B" />}
            bg="#FEF3C7"
            title="Secure & Reliable"
            desc="Your data is safe with us"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="paw-how">
        <p className="paw-section-label">How it Works</p>
        <h2>Simple steps for the Appointment</h2>
        <div className="paw-steps">
          <ProcessStep n={1} icon={<PersonIcon />} bg="#EDE9F8" label="Owner Details" desc="Enter the owner details" />
          <Dash />
          <ProcessStep n={2} icon={<img src={pawLogo} alt="" />} bg="#FEF3C7" label="Pet Information" desc="Enter pet information such as species, breed, etc." />
          <Dash />
          <ProcessStep n={3} icon={<CalendarIcon color="#4C2F97" size={36} />} bg="#EDE9F8" label="Select The Date & Service" desc="Select the time & date and the service for your appointment" />
          <Dash />
          <ProcessStep n={4} icon={<CardIcon />} bg="#FEF3C7" label="Down Payment" desc="Pay the downpayment to ensure appointment" />
          <Dash />
          <ProcessStep n={5} icon={<HeartIcon />} bg="#EDE9F8" label="Wait for Approval" desc="Wait for the approval of your appointment in your email" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="paw-footer">
        <div className="paw-footer-inner">
          <div className="paw-footer-brand">
            <a href="/" className="paw-logo paw-logo-white">
              <img src={logoName} alt="PawControl" className="paw-footer-logo-img" />
            </a>
            <p>Better care, Happier pets</p>
            <p>©2026 PawControl All rights reserved.</p>
          </div>
          <div className="paw-footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">How it Works</a></li>
              <li><a href="#">Contacts</a></li>
            </ul>
          </div>
          <div className="paw-footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="#">24/7 Emergency response</a></li>
              <li><a href="#">Advance Diagnosis</a></li>
              <li><a href="#">Critical Care</a></li>
              <li><a href="#">ICU</a></li>
              <li><a href="#">Blood Transfusion</a></li>
              <li><a href="#">Surgery & Intensive Monitoring</a></li>
            </ul>
          </div>
          <div className="paw-footer-col">
            <h4>Stay Connected</h4>
            <p className="paw-footer-sub">Follow us for updates and pet care</p>
            <div className="paw-socials">
              <a href="#" aria-label="Facebook"><SocialIcon type="fb" /></a>
              <a href="#" aria-label="Instagram"><SocialIcon type="ig" /></a>
              <a href="#" aria-label="X"><SocialIcon type="x" /></a>
              <a href="#" aria-label="Email"><SocialIcon type="email" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Dash() {
  return (
    <div className="paw-dash">
      <span>- - - - -→</span>
    </div>
  );
}

function CalendarIcon({ color = "#4C2F97", size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="6" width="26" height="22" rx="3" stroke={color} strokeWidth="2" />
      <line x1="3" y1="13" x2="29" y2="13" stroke={color} strokeWidth="2" />
      <line x1="10" y1="3" x2="10" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="3" x2="22" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <rect x="8" y="17" width="4" height="4" rx="1" fill={color} />
      <rect x="14" y="17" width="4" height="4" rx="1" fill={color} />
      <rect x="20" y="17" width="4" height="4" rx="1" fill={color} />
    </svg>
  );
}

function PawIcon({ color = "#F59E0B", size = 32 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <ellipse cx="8" cy="8" rx="3" ry="4" fill={color} />
      <ellipse cx="24" cy="8" rx="3" ry="4" fill={color} />
      <ellipse cx="4" cy="16" rx="2.5" ry="3.5" fill={color} />
      <ellipse cx="28" cy="16" rx="2.5" ry="3.5" fill={color} />
      <path d="M16 11c-5.5 0-8.5 3.5-7 8 1 3.5 4 5.5 7 5.5s6-2 7-5.5c1.5-4.5-1.5-8-7-8z" fill={color} />
      <line x1="12" y1="3" x2="12" y2="7" stroke="#1a0a5e" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="7" stroke="#1a0a5e" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="3" x2="20" y2="7" stroke="#1a0a5e" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon({ color = "#4C2F97" }: { color?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4a8 8 0 0 0-8 8v6l-2 3h20l-2-3v-6a8 8 0 0 0-8-8z" stroke={color} strokeWidth="2" fill="none" />
      <path d="M13 25a3 3 0 0 0 6 0" stroke={color} strokeWidth="2" fill="none" />
      <line x1="16" y1="4" x2="16" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ color = "#F59E0B" }: { color?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3L5 8v8c0 6 4.5 11 11 13 6.5-2 11-7 11-13V8L16 3z" stroke={color} strokeWidth="2" fill="none" />
      <polyline points="11,16 14,19 21,12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="12" r="6" stroke="#4C2F97" strokeWidth="2" />
      <path d="M6 30c0-6 5.4-10 12-10s12 4 12 10" stroke="#4C2F97" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="9" width="28" height="18" rx="3" stroke="#F59E0B" strokeWidth="2" />
      <line x1="4" y1="16" x2="32" y2="16" stroke="#F59E0B" strokeWidth="2" />
      <rect x="8" y="20" width="6" height="3" rx="1" fill="#F59E0B" />
      <rect x="16" y="20" width="4" height="3" rx="1" fill="#F59E0B" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 30S5 21 5 12a7 7 0 0 1 13-3.5A7 7 0 0 1 31 12c0 9-13 18-13 18z" stroke="#4C2F97" strokeWidth="2" fill="none" />
    </svg>
  );
}

