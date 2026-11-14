import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import CodeInput from '@/Components/CodeInput';

/**
 * The "enter the 6-digit code" step shared by registration (VerifyCode) and
 * forgot password (ForgotPasswordCode): code boxes, Verify, Resend with a cooldown
 * timer, and a back link supplied by the page.
 */
export default function CodeVerificationForm({ verifyUrl, resendUrl, resendAvailableIn, codeLength = 6, backLink }) {
    const { flash } = usePage().props;
    const [cooldown, setCooldown] = useState(resendAvailableIn);
    const [resending, setResending] = useState(false);
    const [resendError, setResendError] = useState(null);
    const codeInput = useRef(null);
    const form = useForm({ code: '' });

    // Resend cooldown countdown (the server enforces the same 60s window).
    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const timer = setTimeout(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    function handleCodeChange(code) {
        form.setData('code', code);
        if (form.errors.code) form.clearErrors('code');
    }

    function submit(event) {
        event.preventDefault();
        form.post(verifyUrl, {
            preserveScroll: true,
            onError: () => codeInput.current?.clear(),
        });
    }

    function resend() {
        if (cooldown > 0 || resending) return;
        setResendError(null);
        router.post(resendUrl, {}, {
            preserveScroll: true,
            onStart: () => setResending(true),
            onFinish: () => setResending(false),
            onSuccess: (page) => {
                setCooldown(page.props.resendAvailableIn ?? 60);
                form.clearErrors();
                codeInput.current?.clear();
            },
            onError: (errors) => setResendError(errors.resend ?? 'Could not resend the code.'),
        });
    }

    const complete = form.data.code.length === codeLength;

    return (<form className="signin-form" onSubmit={submit}>
      {flash?.success && <p className="verify-success" role="status">{flash.success}</p>}

      <div className="signin-field">
        <span id="code-label" className="signin-label">Verification code</span>
        <CodeInput ref={codeInput} length={codeLength} invalid={Boolean(form.errors.code)} labelledBy="code-label" onChange={handleCodeChange}/>
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

      {backLink && <div className="verify-back">{backLink}</div>}
    </form>);
}
