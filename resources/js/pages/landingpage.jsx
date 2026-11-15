import FeatureItem from '@/pages/Public/components/FeatureItem';
import ProcessStep from '@/pages/Public/components/ProcessStep';
import SocialIcon from '@/pages/Public/components/SocialIcon';
import ServicesMenu from '@/pages/Public/components/ServicesMenu';
import { Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import AuthModal, { AUTH_VIEWS } from '@/Components/AuthModal';
import PawBackdrop from '@/Components/PawBackdrop';
import petImage from '../imports/landingpagepet.png';
import logoName from '../imports/Bigpaw_logoname-removebg-preview.png';
import pawLogo from '../imports/pawlogo.png';

/*
 * Landing page, styled with Tailwind classes.
 * Palette: navy #19043f · purple #45199a · orange #f28b37 · gold #ffbb50 · text #111827
 * Breakpoints match the original CSS: max-[900px] (tablet), max-[640px] / max-[480px] (phone).
 */

// Gold stripe under the header and above the footer: same colour (#ffbb50) and thickness (6px).
const STRIPE_BAR = 'h-[6px] bg-[#ffbb50]';
const STRIPE_TOP_BORDER = 'border-t-[6px] border-t-[#ffbb50]';

// Header links (Plus Jakarta Sans, loaded via bunny() in vite.config).
const NAV_LINK = '[font-family:var(--font-plus-jakarta-sans),system-ui,sans-serif] text-[25px] font-medium tracking-[-0.01em] text-white no-underline transition-colors duration-150 hover:text-[#F5A623] max-[900px]:text-[17px]';

// Header "Book now" pill.
const BOOK_NOW = 'ml-auto inline-flex h-9 min-w-[76px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-white bg-transparent px-[18px] text-[14px] font-bold whitespace-nowrap text-white no-underline shadow-none transition-[background-color,color,box-shadow,translate] duration-[180ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:-translate-y-0.5 hover:bg-[#f3ecff] hover:text-[#19043f] hover:shadow-[0_6px_16px_rgb(0_0_0/22%)] active:translate-y-0 active:shadow-[0_2px_5px_rgb(0_0_0/16%)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#ffbb50] max-[640px]:min-w-auto max-[640px]:py-2 max-[640px]:text-[16px]';

// Hero CTAs: colours ease over 180ms; the press uses a strong ease-out (160ms) so it feels instant.
const HERO_BTN = 'group inline-flex min-h-14 cursor-pointer items-center justify-center gap-2.5 rounded-full px-7 text-[17px] leading-none font-bold tracking-[0.01em] no-underline select-none [-webkit-tap-highlight-color:transparent] [transition:background-color_180ms_ease,border-color_180ms_ease,box-shadow_180ms_ease,scale_160ms_cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#ffbb50] motion-reduce:active:scale-100 max-[480px]:w-full';
const HERO_BTN_PRIMARY = 'border-0 bg-[#19043f] text-white shadow-[0_10px_24px_-10px_rgb(25_4_63/0.6)] hover:bg-[#2a0c63] hover:shadow-[0_14px_28px_-12px_rgb(25_4_63/0.65)]';
const HERO_BTN_OUTLINE = 'border-[1.5px] border-[rgb(25_4_63/0.18)] bg-white/70 text-[#19043f] shadow-[0_1px_2px_rgb(25_4_63/0.06)] backdrop-blur-[6px] hover:border-[rgb(25_4_63/0.35)] hover:bg-white';
const BTN_ICON = 'flex-none transition-[translate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none';

const FOOTER_LINK = 'text-[0.875rem] leading-normal text-white/75 no-underline transition-colors duration-200 hover:text-[#f28b37]';

// Views that can be opened straight from a link (?auth=login|register|forgot).
const QUERY_VIEWS = ['login', 'register', 'forgot'];
// Views that depend on server session state: ?auth=… for these goes through their real route
// (the server checks the session and redirects back here with the right view open).
const SERVER_STEP_URLS = { verify: '/register/verify', 'forgot-code': '/forgot-password/verify', reset: '/reset-password' };
// Routes that render this page with a modal view open; closing the modal tidies them back to "/".
const AUTH_PATHS = ['/login', '/register', '/register/verify', '/forgot-password', '/forgot-password/verify', '/reset-password'];

const queryView = () => (typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('auth'));

/** Which auth view to open on load: from the server (authModal prop) or ?auth=login|register|forgot. */
function initialAuthMode(authModal) {
    if (AUTH_VIEWS.includes(authModal)) return authModal;
    return QUERY_VIEWS.includes(queryView()) ? queryView() : null;
}

export default function App({ authModal = null, maskedEmail, resendAvailableIn, codeLength }) {
    const { auth } = usePage().props;
    const isGuest = !auth?.user;
    // Auth modal view (null = closed). See AuthModal for the views.
    const [authMode, setAuthMode] = useState(() => (isGuest ? initialAuthMode(authModal) : null));
    // Show the server's flash message ("Password updated…", "A new code…") only in the view
    // the server opened, not after the user switches views on the client.
    const [showFlash, setShowFlash] = useState(true);

    const switchView = useCallback((mode) => {
        setAuthMode(mode);
        setShowFlash(false);
    }, []);

    // Guests get the modal; logged-in users follow the link (server sends them to the dashboard).
    const openAuth = (mode) => (event) => {
        if (!isGuest) return;
        event.preventDefault();
        switchView(mode);
    };

    // ?auth=verify|forgot-code|reset: let the server decide (it needs the session).
    useEffect(() => {
        const url = SERVER_STEP_URLS[queryView()];
        if (url && !authModal) router.visit(url, { replace: true });
    }, []);

    // Server-driven steps: a form posts (send code, verify, reset…) and the server redirects
    // to a route that renders this page with the next view in `authModal`. Inertia keeps this
    // component mounted, so follow that prop here. On a successful visit always follow it; on a
    // validation error only when the redirect went to a different URL (e.g. "email taken" sends
    // you from /register/verify back to /register). A plain failed submit returns to the same URL
    // and stays on the current view with its error message.
    useEffect(() => {
        let startPath = window.location.pathname;
        const follow = (page) => {
            if (page?.component !== 'landingpage') return;
            const next = page.props?.authModal;
            if (AUTH_VIEWS.includes(next)) {
                setAuthMode(next);
                setShowFlash(true);
            }
        };
        const offStart = router.on('start', () => {
            startPath = window.location.pathname;
        });
        const offSuccess = router.on('success', (event) => follow(event.detail.page));
        const offError = router.on('error', (event) => {
            const page = event.detail.page;
            if (page && new URL(page.url, window.location.origin).pathname !== startPath) follow(page);
        });
        return () => {
            offStart();
            offSuccess();
            offError();
        };
    }, []);

    const closeAuth = useCallback(() => {
        setAuthMode(null);
        // Opened via an auth route or ?auth=…: tidy the address bar back to "/"
        // without a page visit, so a refresh doesn't pop the modal open again.
        const { pathname, search } = window.location;
        if (AUTH_PATHS.includes(pathname) || new URLSearchParams(search).has('auth')) {
            window.history.replaceState(window.history.state, '', '/');
        }
    }, []);

    // Logged-in users go straight to their dashboard to book; visitors create an account first.
    const bookHref = isGuest ? '/register' : '/dashboard';
    return (<>
    <div className="flex min-h-full flex-col" inert={authMode !== null}>
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#19043f]">
        <div className="relative flex h-[84px] items-center pr-[34px] pl-5 max-[900px]:h-[70px] max-[900px]:px-5">
          <a href="/" className="flex shrink-0 items-center gap-2 text-[1.15rem] text-white no-underline">
            <img src={logoName} alt="PawControl" className="h-12 w-auto object-contain max-[900px]:h-[42px]"/>
          </a>
          <ul className="absolute left-1/2 flex -translate-x-1/2 list-none gap-[34px] max-[640px]:hidden">
            <li><a href="#" className={NAV_LINK}>Home</a></li>
            <li><a href="#" className={NAV_LINK}>About Us</a></li>
            <ServicesMenu />
            <li><a href="#how-it-works" className={NAV_LINK}>How it works</a></li>
          </ul>
          <a href="/login" className={BOOK_NOW} onClick={openAuth('login')}>Book now</a>
        </div>
        <div className={STRIPE_BAR}/>
      </nav>

      {/* Hero + features share one decorated surface (soft wash, glows, paw prints). */}
      <div className="relative isolate overflow-clip bg-[linear-gradient(180deg,#fbfaff_0%,#fdfcff_55%,#fff_100%)]">
        <PawBackdrop />

      {/* HERO */}
      <section className="relative z-[1] mx-auto flex min-h-[815px] max-w-[1590px] items-center gap-[70px] px-[82px] pt-[66px] pb-[58px] max-[900px]:min-h-auto max-[900px]:flex-col max-[900px]:gap-[25px] max-[900px]:px-[30px] max-[900px]:pt-[54px] max-[900px]:pb-[42px] max-[900px]:text-center max-[640px]:px-[22px] max-[640px]:pt-[42px] max-[640px]:pb-[28px]">
        <div className="min-w-0 flex-[0_1_48%]">
          <h1 className="mb-[22px] text-[clamp(3.3rem,4.1vw,4.5rem)] leading-[1.3] font-black tracking-[-1.8px] text-[#111827] max-[900px]:text-[clamp(2.7rem,7vw,3.7rem)] max-[640px]:text-[clamp(2.45rem,11vw,3.2rem)] max-[640px]:tracking-[-1px]">
            Easy Appointments,<br />
            <span className="text-[#19043f]">Healthy Pets,</span><br />
            <span className="text-[#f28b37]">Big Paws</span>
          </h1>
          <p className="mb-7 max-w-[600px] text-justify text-[clamp(1.25rem,2vw,1.65rem)] leading-[1.65] text-[#090909] max-[900px]:max-w-full max-[900px]:text-center max-[640px]:text-left max-[640px]:text-[1.12rem]">
            Because your pets deserve the best care—PawControl helps you stay
            connected to their health anytime, anywhere.
          </p>
          <div className="flex flex-wrap gap-[14px] max-[900px]:justify-center max-[480px]:flex-col max-[480px]:items-stretch">
            <Link href={bookHref} className={`${HERO_BTN} ${HERO_BTN_PRIMARY}`} onClick={openAuth('register')}>
              <span>Book an Appointment</span>
              <ArrowRightIcon />
            </Link>
            <a href="#how-it-works" className={`${HERO_BTN} ${HERO_BTN_OUTLINE}`}>
              <span>Learn More</span>
              <ArrowDownIcon />
            </a>
          </div>
        </div>
        {/* Soft white spotlight behind the pets (::before) so the orange blob sits in light. */}
        <div className="relative flex min-h-[600px] flex-[1_1_52%] items-center justify-center before:absolute before:inset-x-[4%] before:inset-y-[6%] before:z-0 before:rounded-full before:bg-[radial-gradient(closest-side,rgb(255_255_255/0.95),rgb(255_255_255/0.55)_55%,transparent)] max-[900px]:min-h-[350px] max-[640px]:min-h-[250px]">
          <img src={petImage} alt="A cat and dog sitting together" className="relative z-[1] h-auto w-full max-w-[630px] object-contain max-[900px]:max-w-[480px] max-[640px]:max-w-[360px]"/>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-[1] px-[4.4%] pb-6 max-[640px]:px-[18px] max-[640px]:pb-5">
        <div className="mx-auto grid min-h-[320px] max-w-[1700px] grid-cols-[repeat(4,1fr)] rounded-[32px] border border-[rgb(25_4_63/0.06)] bg-white/92 px-12 py-[52px] shadow-[0_1px_2px_rgb(25_4_63/0.05),0_24px_60px_-18px_rgb(25_4_63/0.22)] backdrop-blur-[6px] max-[900px]:grid-cols-[repeat(2,1fr)] max-[640px]:grid-cols-[1fr] max-[640px]:rounded-[22px] max-[640px]:px-4 max-[640px]:py-[22px]">
          <FeatureItem icon={<CalendarIcon color="#4C2F97"/>} bg="#EDE9F8" title="Easy Booking" desc="Book appointment in just a few clicks"/>
          <FeatureItem icon={<img src={pawLogo} alt=""/>} bg="#FEF3C7" title="Pet Management" desc="Keep all your pet's information organized"/>
          <FeatureItem icon={<BellIcon color="#4C2F97"/>} bg="#EDE9F8" title="Reminders" desc="Get notified so you never miss an appointment"/>
          <FeatureItem icon={<ShieldIcon color="#F59E0B"/>} bg="#FEF3C7" title="Secure & Reliable" desc="Your data is safe with us"/>
        </div>
      </section>

      </div>

      {/* HOW IT WORKS: light lavender band with a faint dot pattern (::before) */}
      <div className="relative [background-image:radial-gradient(900px_360px_at_50%_0%,rgb(69_25_154/0.07),transparent_70%),linear-gradient(180deg,#fff_0%,#f7f5fc_18%,#f7f5fc_100%)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(rgb(25_4_63/0.12)_1px,transparent_1.2px)] before:bg-size-[24px_24px] before:opacity-35 before:[mask-image:linear-gradient(180deg,transparent_0%,#000_30%,#000_70%,transparent_100%)]">
      {/* scroll-mt: land below the sticky header (84px + 6px stripe; 70px + 6px on tablet) */}
      <section className="relative mx-auto max-w-[1600px] scroll-mt-[98px] px-[38px] pt-10 pb-20 text-center max-[900px]:scroll-mt-[84px] max-[640px]:px-5 max-[640px]:pt-9 max-[640px]:pb-[54px]" id="how-it-works">
        <p className="mb-3.5 text-[26px] font-bold tracking-[0.02em] text-[#45199a]">How it Works</p>
        <h2 className="mb-[46px] text-[38px] font-extrabold text-[#111827] max-[640px]:mb-[30px] max-[640px]:text-[29px]">Simple steps for the Appointment</h2>
        <div className="flex flex-wrap items-start justify-between max-[640px]:flex-col max-[640px]:items-center max-[640px]:gap-3">
          <ProcessStep n={1} icon={<PersonIcon />} bg="#EDE9F8" label="Owner Details" desc="Enter the owner details"/>
          <Dash />
          <ProcessStep n={2} icon={<img src={pawLogo} alt=""/>} bg="#FEF3C7" label="Pet Information" desc="Enter pet information such as species, breed, etc."/>
          <Dash />
          <ProcessStep n={3} icon={<CalendarIcon color="#4C2F97" size={36}/>} bg="#EDE9F8" label="Select The Date & Service" desc="Select the time & date and the service for your appointment"/>
          <Dash />
          <ProcessStep n={4} icon={<CardIcon />} bg="#FEF3C7" label="Down Payment" desc="Pay the downpayment to ensure appointment"/>
          <Dash />
          <ProcessStep n={5} icon={<HeartIcon />} bg="#EDE9F8" label="Wait for Approval" desc="Wait for the approval of your appointment in your email"/>
        </div>
      </section>
      </div>

      {/* FOOTER */}
      <footer className={`mt-auto ${STRIPE_TOP_BORDER} bg-[#19043f] px-8 pt-12 pb-8 text-white`}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-[2fr_1fr_1.5fr_1.5fr] gap-8 max-[900px]:grid-cols-[1fr_1fr] max-[640px]:grid-cols-[1fr]">
          <div>
            <a href="/" className="mb-2 flex shrink-0 items-center gap-2 text-[1.15rem] text-white no-underline">
              <img src={logoName} alt="PawControl" className="h-8 w-auto object-contain"/>
            </a>
            <p className="mt-2 text-[0.85rem] leading-[1.6] opacity-75">Better care, Happier pets</p>
            <p className="mt-2 text-[0.85rem] leading-[1.6] opacity-75">©2026 PawControl All rights reserved.</p>
          </div>
          <div>
            <h4 className="mb-4 text-[1rem] font-bold">Quick Links</h4>
            <ul className="flex list-none flex-col gap-2">
              <li><a href="#" className={FOOTER_LINK}>Home</a></li>
              <li><a href="#" className={FOOTER_LINK}>About Us</a></li>
              <li><a href="#" className={FOOTER_LINK}>Services</a></li>
              <li><a href="#how-it-works" className={FOOTER_LINK}>How it Works</a></li>
              <li><a href="#" className={FOOTER_LINK}>Contacts</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[1rem] font-bold">Services</h4>
            <ul className="flex list-none flex-col gap-2">
              <li><a href="#" className={FOOTER_LINK}>24/7 Emergency response</a></li>
              <li><a href="#" className={FOOTER_LINK}>Advance Diagnosis</a></li>
              <li><a href="#" className={FOOTER_LINK}>Critical Care</a></li>
              <li><a href="#" className={FOOTER_LINK}>ICU</a></li>
              <li><a href="#" className={FOOTER_LINK}>Blood Transfusion</a></li>
              <li><a href="#" className={FOOTER_LINK}>Surgery & Intensive Monitoring</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-[1rem] font-bold">Stay Connected</h4>
            <p className="mb-4 block text-[0.875rem] leading-normal text-white/75">Follow us for updates and pet care</p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="flex overflow-hidden rounded-full transition-opacity duration-200 hover:opacity-85"><SocialIcon type="fb"/></a>
              <a href="#" aria-label="Instagram" className="flex overflow-hidden rounded-full transition-opacity duration-200 hover:opacity-85"><SocialIcon type="ig"/></a>
              <a href="#" aria-label="X" className="flex overflow-hidden rounded-full transition-opacity duration-200 hover:opacity-85"><SocialIcon type="x"/></a>
              <a href="#" aria-label="Email" className="flex overflow-hidden rounded-full transition-opacity duration-200 hover:opacity-85"><SocialIcon type="email"/></a>
            </div>
          </div>
        </div>
      </footer>
    </div>

    {authMode && <AuthModal mode={authMode} step={{ maskedEmail, resendAvailableIn, codeLength }} showFlash={showFlash} onModeChange={switchView} onClose={closeAuth}/>}
    </>);
}
// Arrows hint at what happens next; they nudge on hover (mouse only), not with reduced motion.
function ArrowRightIcon() {
    return (<svg className={`${BTN_ICON} group-hover:translate-x-[3px] motion-reduce:group-hover:translate-x-0`} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
}
function ArrowDownIcon() {
    return (<svg className={`${BTN_ICON} group-hover:translate-y-0.5 motion-reduce:group-hover:translate-y-0`} width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v11m-4.5-4.5L10 15l4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
}
function Dash() {
    return (<div className="shrink-0 self-start pt-[47px] text-[21px] tracking-[-1px] text-[#111] max-[900px]:text-[13px] max-[640px]:rotate-90 max-[640px]:pt-0">
      <span>- - - - -→</span>
    </div>);
}
function CalendarIcon({ color = "#4C2F97", size = 32 }) {
    return (<svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="3" y="6" width="26" height="22" rx="3" stroke={color} strokeWidth="2"/>
      <line x1="3" y1="13" x2="29" y2="13" stroke={color} strokeWidth="2"/>
      <line x1="10" y1="3" x2="10" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <line x1="22" y1="3" x2="22" y2="9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <rect x="8" y="17" width="4" height="4" rx="1" fill={color}/>
      <rect x="14" y="17" width="4" height="4" rx="1" fill={color}/>
      <rect x="20" y="17" width="4" height="4" rx="1" fill={color}/>
    </svg>);
}
function BellIcon({ color = "#4C2F97" }) {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 4a8 8 0 0 0-8 8v6l-2 3h20l-2-3v-6a8 8 0 0 0-8-8z" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M13 25a3 3 0 0 0 6 0" stroke={color} strokeWidth="2" fill="none"/>
      <line x1="16" y1="4" x2="16" y2="2" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>);
}
function ShieldIcon({ color = "#F59E0B" }) {
    return (<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 3L5 8v8c0 6 4.5 11 11 13 6.5-2 11-7 11-13V8L16 3z" stroke={color} strokeWidth="2" fill="none"/>
      <polyline points="11,16 14,19 21,12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
}
function PersonIcon() {
    return (<svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="12" r="6" stroke="#4C2F97" strokeWidth="2"/>
      <path d="M6 30c0-6 5.4-10 12-10s12 4 12 10" stroke="#4C2F97" strokeWidth="2" strokeLinecap="round"/>
    </svg>);
}
function CardIcon() {
    return (<svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <rect x="4" y="9" width="28" height="18" rx="3" stroke="#F59E0B" strokeWidth="2"/>
      <line x1="4" y1="16" x2="32" y2="16" stroke="#F59E0B" strokeWidth="2"/>
      <rect x="8" y="20" width="6" height="3" rx="1" fill="#F59E0B"/>
      <rect x="16" y="20" width="4" height="3" rx="1" fill="#F59E0B"/>
    </svg>);
}
function HeartIcon() {
    return (<svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <path d="M18 30S5 21 5 12a7 7 0 0 1 13-3.5A7 7 0 0 1 31 12c0 9-13 18-13 18z" stroke="#4C2F97" strokeWidth="2" fill="none"/>
    </svg>);
}
