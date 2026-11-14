import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import CodeInput from '@/Components/CodeInput';
import { ErrorMessage, SubmitButton, SuccessMessage } from '@/Components/AuthUi';
import { ui } from '@/Components/authStyles';

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

    return (<form className={ui.form} onSubmit={submit}>
      {flash?.success && <SuccessMessage>{flash.success}</SuccessMessage>}

      <div className={ui.field}>
        <span id="code-label" className={ui.label}>Verification code</span>
        <CodeInput ref={codeInput} length={codeLength} invalid={Boolean(form.errors.code)} labelledBy="code-label" onChange={handleCodeChange}/>
      </div>

      {form.errors.code && <ErrorMessage>{form.errors.code}</ErrorMessage>}

      <SubmitButton processing={form.processing} disabled={!complete} busyLabel="Verifying…">Verify</SubmitButton>

      <div className={ui.resend}>
        <span>Didn&apos;t get the code?</span>{' '}
        <button type="button" className={ui.linkButton} onClick={resend} disabled={cooldown > 0 || resending}>
          {resending ? 'Sending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
        {resendError && <p className={ui.fieldError} role="alert">{resendError}</p>}
      </div>

      {backLink && <div className={ui.center}>{backLink}</div>}
    </form>);
}
