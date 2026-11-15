import { Head, router } from '@inertiajs/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import AuthCard from '@/Components/AuthCard';
import CodeVerificationForm from '@/Components/CodeVerificationForm';
import ForgotPasswordForm from '@/Components/ForgotPasswordForm';
import LoginPanel from '@/Components/LoginPanel';
import RegisterForm from '@/Components/RegisterForm';
import ResetPasswordForm from '@/Components/ResetPasswordForm';
import { ui } from '@/Components/authStyles';
import dogImage from '../imports/logindog.png';
import registerCatImage from '../imports/registerCat.png';

/** Every view the auth modal can show (also the values of the server's `authModal` prop). */
export const AUTH_VIEWS = ['login', 'register', 'verify', 'forgot', 'forgot-code', 'reset'];

const DOG = { image: dogImage, imageAlt: 'Puppies at a veterinary clinic' };
const CAT = { image: registerCatImage, imageAlt: 'Cat at a veterinary clinic' };
const LOCKED_OUT = "Locked out? We'll get you back in a minute.";

const masked = (email) => <strong className={ui.codeEmail}>{email}</strong>;

/** Card copy for each view: tab title, photo, caption, kicker, heading, subtitle. */
function viewConfig(mode, step) {
    switch (mode) {
        case 'register':
            return { ...CAT, title: 'Create account', caption: "Book visits and track your pet's health with ease.", kicker: 'Join Big Paws', heading: 'Create your account', subtitle: "Set up your account to book visits and keep your pet's health records in one place.", wide: true };
        case 'verify':
            return { ...CAT, title: 'Verify your email', caption: 'One quick step and your account is ready.', kicker: 'Almost there', heading: 'Enter verification code', subtitle: <>We sent a 6-digit code to {masked(step.maskedEmail)}. It expires in 10 minutes.</> };
        case 'forgot':
            return { ...DOG, title: 'Reset password', caption: LOCKED_OUT, kicker: 'Forgot password', heading: 'Reset your password', subtitle: "Enter the email address on your account and we'll send you a 6-digit code." };
        case 'forgot-code':
            return { ...DOG, title: 'Reset password', caption: LOCKED_OUT, kicker: 'Forgot password', heading: 'Enter verification code', subtitle: <>If an account exists, we sent a code to {masked(step.maskedEmail)}. It expires in 10 minutes.</> };
        case 'reset':
            return { ...DOG, title: 'Reset password', caption: LOCKED_OUT, kicker: 'Code verified', heading: 'Choose a new password', subtitle: "Use at least 8 characters. You'll be asked to log in again afterwards." };
        default:
            return { ...DOG, title: 'Log in', caption: 'Every visit, every record, all in one place.', kicker: 'Welcome back', heading: 'Log in to your account', subtitle: "Manage appointments and keep your pet's records up to date." };
    }
}

/**
 * The auth modal over the landing page: one card whose content swaps between views.
 *
 *   login ⇄ register → verify            (registration)
 *   login → forgot → forgot-code → reset → login   (forgot password)
 *
 * `onModeChange(view)` swaps views on the client (switch links, Back buttons).
 * Steps that need the server (send code, verify, reset) submit as before; the server's
 * redirect tells the landing page which view comes next (see landingpage.jsx).
 * `step` carries the server props for code views: maskedEmail, resendAvailableIn, codeLength.
 * Closes on overlay click, Esc, or the ✕ button; page scroll is locked while open.
 */
export default function AuthModal({ mode, step = {}, showFlash = true, onModeChange, onClose }) {
    const view = viewConfig(mode, step);
    const dialog = useRef(null);
    const card = useRef(null);
    // Email typed in the forgot view, so "Back" from the code step can pre-fill it.
    const [forgotEmail, setForgotEmail] = useState('');
    // Latest onClose without re-running the open/close setup effect on every render.
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });
    const pressStartedOutside = useRef(false);

    // Lock page scroll (compensating for the scrollbar so the page doesn't shift),
    // close on Esc, and restore focus to whatever opened the modal.
    useEffect(() => {
        const opener = document.activeElement;
        const { overflow, paddingRight } = document.body.style;
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current();
            }
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = overflow;
            document.body.style.paddingRight = paddingRight;
            document.removeEventListener('keydown', onKeyDown);
            if (opener instanceof HTMLElement) opener.focus();
        };
    }, []);

    // Move focus into the card's first field whenever the view opens or switches.
    useEffect(() => {
        dialog.current?.querySelector('input:not([type="hidden"])')?.focus({ preventScroll: true });
    }, [mode]);

    // Close on a click anywhere outside the card. The press must also *start* outside,
    // so selecting text in a field and releasing past the card edge doesn't close it.
    const isOutsideCard = (event) => !card.current?.contains(event.target);
    const onOverlayPointerDown = (event) => {
        pressStartedOutside.current = isOutsideCard(event);
    };
    const onOverlayClick = (event) => {
        if (pressStartedOutside.current && isOutsideCard(event)) onClose();
    };

    const toLogin = () => onModeChange('login');
    const toForgot = () => onModeChange('forgot');

    // Back button per view. Registration "Back" reuses the existing cancel route
    // (drops the pending sign-up; the server then returns the register view).
    const onBack = {
        verify: () => router.post('/register/cancel', {}, { preserveScroll: true }),
        forgot: toLogin,
        'forgot-code': toForgot,
        reset: toForgot,
    }[mode];

    // Each view is its own component instance (keyed by mode), so fields and errors
    // start fresh whenever the view changes.
    const content = {
        login: <LoginPanel showFlash={showFlash} onSwitchToRegister={() => onModeChange('register')} onForgotPassword={() => {
                setForgotEmail('');
                toForgot();
            }}/>,
        register: <RegisterForm onSwitchToLogin={toLogin}/>,
        verify: <CodeVerificationForm verifyUrl="/register/verify" resendUrl="/register/resend" resendAvailableIn={step.resendAvailableIn ?? 0} codeLength={step.codeLength ?? 6} showFlash={showFlash}/>,
        forgot: <ForgotPasswordForm initialEmail={forgotEmail} onEmailSubmitted={setForgotEmail} onBackToLogin={toLogin}/>,
        'forgot-code': <CodeVerificationForm verifyUrl="/forgot-password/verify" resendUrl="/forgot-password/resend" resendAvailableIn={step.resendAvailableIn ?? 0} codeLength={step.codeLength ?? 6} showFlash={showFlash}/>,
        reset: <ResetPasswordForm onBackToLogin={toLogin}/>,
    }[mode] ?? null;

    return (<div className="fixed inset-0 z-[1000]">
      <Head title={view.title}/>

      {/* Dark translucent overlay with the same 6px blur the features card uses. */}
      <div className="fixed inset-0 bg-[rgb(25_4_63/0.5)] backdrop-blur-[6px] transition-opacity duration-200 ease-out starting:opacity-0" aria-hidden="true"/>

      {/* Scroll container: centres the card, scrolls when it's taller than the screen. */}
      <div className="fixed inset-0 overflow-y-auto overscroll-contain" onPointerDown={onOverlayPointerDown} onClick={onOverlayClick}>
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-10">
          <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="signin-title" className="flex w-full justify-center">
            <AuthCard ref={card} {...view} onClose={onClose} onBack={onBack} className="origin-center transition-[opacity,scale,translate] duration-[260ms] ease-[cubic-bezier(0.23,1,0.32,1)] starting:translate-y-2 starting:scale-[0.96] starting:opacity-0 motion-reduce:starting:translate-y-0 motion-reduce:starting:scale-100">
              <Fragment key={mode}>{content}</Fragment>
            </AuthCard>
          </div>
        </div>
      </div>
    </div>);
}
