import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AuthLayout from '@/Components/AuthLayout';
import registerCatImage from '../imports/registerCat.png';
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

    return (<AuthLayout title="Check your email" image={registerCatImage} imageAlt="Cat at a veterinary clinic" caption="One quick step and your account is ready." kicker="Almost there" heading="Check your email" subtitle={<>We sent a 6-digit verification code to <strong className="verify-email">{maskedEmail}</strong>. It expires in 10 minutes.</>}>
      <form className="signin-form" onSubmit={submit}>
        {flash?.success && <p className="verify-success" role="status">{flash.success}</p>}

        <div className="signin-field">
          <span id="code-label" className="signin-label">Verification code</span>
          <div className="verify-code-boxes" role="group" aria-labelledby="code-label">
            {digits.map((digit, index) => (<input key={index} ref={(el) => { inputs.current[index] = el; }} className="verify-code-box" data-filled={digit !== ''} aria-invalid={Boolean(form.errors.code)} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete={index === 0 ? 'one-time-code' : 'off'} autoFocus={index === 0} maxLength={codeLength} aria-label={`Digit ${index + 1}`} value={digit} onChange={(event) => handleChange(index, event)} onKeyDown={(event) => handleKeyDown(index, event)} onPaste={(event) => handlePaste(index, event)} onFocus={(event) => event.target.select()}/>))}
          </div>
        </div>

        {form.errors.code && (<p className="signin-error" role="alert">
            <svg viewBox="0 0 20 20" aria-hidden="true" className="signin-error-icon">
              <path fill="currentColor" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a1 1 0 0 1 1 1v3.5a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8.75a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"/>
            </svg>
            <span>{form.errors.code}</span>
          </p>)}

        <button type="submit" className="signin-submit" disabled={form.processing || !complete} aria-busy={form.processing}>
          {form.processing && <span className="signin-spinner" aria-hidden="true"/>}
          <span>{form.processing ? 'Verifying…' : 'Verify'}</span>
        </button>

        <div className="verify-resend">
          <span>Didn&apos;t get the code?</span>{' '}
          <button type="button" className="verify-link-btn" onClick={resend} disabled={cooldown > 0 || resending}>
            {resending ? 'Sending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
          {resendError && <p className="signin-field-error" role="alert">{resendError}</p>}
        </div>

        <div className="verify-back">
          <Link href="/register/cancel" method="post" as="button" className="verify-link-btn verify-link-btn--muted">
            ← Back / use a different email
          </Link>
        </div>
      </form>
    </AuthLayout>);
}
