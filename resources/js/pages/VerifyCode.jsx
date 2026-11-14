import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import registerCatImage from '../imports/registerCat.png';
import logoName from '../imports/Bigpaw_logoname-removebg-preview.png';
import logoBadge from '../imports/BIGPAW_LOGO-removebg-preview.png';
import '../../css/Register.css';

export default function VerifyCode({ maskedEmail, resendAvailableIn, codeLength = 6 }) {
    const { flash } = usePage().props;
    const emptyDigits = () => Array(codeLength).fill('');
    const [digits, setDigits] = useState(emptyDigits);
    const [cooldown, setCooldown] = useState(resendAvailableIn);
    const [resending, setResending] = useState(false);
    const [resendError, setResendError] = useState(null);
    const inputs = useRef([]);
    const form = useForm({ code: '' });

    // Resend cooldown countdown (server enforces the same 60s window).
    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const timer = setTimeout(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    function focusBox(index) {
        const box = inputs.current[Math.max(0, Math.min(codeLength - 1, index))];
        box?.focus();
        box?.select();
    }

    function updateDigits(next) {
        setDigits(next);
        form.setData('code', next.join(''));
        if (form.errors.code) form.clearErrors('code');
    }

    function fillFrom(index, value) {
        const chars = value.replace(/\D/g, '').slice(0, codeLength - index).split('');
        if (chars.length === 0) return;
        const next = [...digits];
        chars.forEach((char, offset) => {
            next[index + offset] = char;
        });
        updateDigits(next);
        focusBox(index + chars.length);
    }

    function handleChange(index, event) {
        const value = event.target.value;
        if (value === '') {
            const next = [...digits];
            next[index] = '';
            updateDigits(next);
            return;
        }
        // Typing next to an existing digit yields 2 chars: keep the new one.
        // Longer values (OTP autofill) are spread across the boxes.
        const incoming = value.length === 2 && digits[index]
            ? value.replace(digits[index], '') || digits[index]
            : value;
        fillFrom(index, incoming);
    }

    function handleKeyDown(index, event) {
        if (event.key === 'Backspace' && !digits[index] && index > 0) {
            event.preventDefault();
            const next = [...digits];
            next[index - 1] = '';
            updateDigits(next);
            focusBox(index - 1);
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focusBox(index - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            focusBox(index + 1);
        }
    }

    function handlePaste(index, event) {
        event.preventDefault();
        fillFrom(index, event.clipboardData.getData('text'));
    }

    function submit(event) {
        event.preventDefault();
        form.post('/register/verify', {
            preserveScroll: true,
            onError: () => {
                updateDigits(emptyDigits());
                focusBox(0);
            },
        });
    }

    function resend() {
        if (cooldown > 0 || resending) return;
        setResendError(null);
        router.post('/register/resend', {}, {
            preserveScroll: true,
            onStart: () => setResending(true),
            onFinish: () => setResending(false),
            onSuccess: (page) => {
                setCooldown(page.props.resendAvailableIn ?? 60);
                updateDigits(emptyDigits());
                form.clearErrors();
                focusBox(0);
            },
            onError: (errors) => setResendError(errors.resend ?? 'Could not resend the code.'),
        });
    }

    const complete = digits.every((digit) => digit !== '');

    return (<div className="login-page">
      <Head title="Check your email"/>
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
            <h1 className="login-title">Check your email</h1>
            <div className="login-divider"/>

            <form className="login-form" onSubmit={submit}>
              <p className="verify-intro">
                We sent a verification code to <strong>{maskedEmail}</strong>. Enter it below to finish creating your account.
              </p>

              {flash?.success && <p className="verify-success" role="status">{flash.success}</p>}

              <div className="verify-code-boxes" role="group" aria-label="Verification code">
                {digits.map((digit, index) => (<input key={index} ref={(el) => { inputs.current[index] = el; }} className={`verify-code-box${form.errors.code ? ' has-error' : ''}`} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete={index === 0 ? 'one-time-code' : 'off'} autoFocus={index === 0} maxLength={codeLength} aria-label={`Digit ${index + 1}`} value={digit} onChange={(event) => handleChange(index, event)} onKeyDown={(event) => handleKeyDown(index, event)} onPaste={(event) => handlePaste(index, event)} onFocus={(event) => event.target.select()}/>))}
              </div>

              {form.errors.code && <p className="login-error verify-center" role="alert">{form.errors.code}</p>}

              <button type="submit" className="login-btn verify-submit" disabled={form.processing || !complete}>
                {form.processing ? 'Verifying...' : 'Verify'}
              </button>

              <div className="verify-resend">
                <span>Didn&apos;t get the code?</span>{' '}
                <button type="button" className="verify-link-btn" onClick={resend} disabled={cooldown > 0 || resending}>
                  {resending ? 'Sending...' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </button>
                {resendError && <p className="login-error" role="alert">{resendError}</p>}
              </div>

              <p className="login-signup-text">
                <Link href="/register/cancel" method="post" as="button" className="verify-link-btn">
                  ← Back / use a different email
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>);
}
