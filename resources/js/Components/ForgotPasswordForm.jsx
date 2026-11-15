import { Link, useForm } from '@inertiajs/react';
import { Field, SubmitButton } from '@/Components/AuthUi';
import { inputClass, ui } from '@/Components/authStyles';

/**
 * Forgot password, step 1: ask for the account email and send a 6-digit code.
 * (Moved unchanged from the old pages/ForgotPassword.jsx; shown in the auth modal.)
 *
 * `initialEmail` pre-fills the field when coming Back from a later step.
 * `onEmailSubmitted` lets the modal remember the email for that Back.
 * `onBackToLogin` swaps to the login view instead of following the link.
 */
export default function ForgotPasswordForm({ initialEmail = '', onEmailSubmitted, onBackToLogin }) {
    const form = useForm({ email: initialEmail });

    function submit(event) {
        event.preventDefault();
        onEmailSubmitted?.(form.data.email);
        form.post('/forgot-password');
    }

    return (<form className={ui.form} onSubmit={submit}>
      <Field id="email" label="Email address" required error={form.errors.email}>
        <input id="email" type="email" className={inputClass(Boolean(form.errors.email))} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={form.data.email} onChange={(event) => {
            form.setData('email', event.target.value);
            if (form.errors.email) form.clearErrors('email');
        }} aria-invalid={Boolean(form.errors.email)} aria-describedby={form.errors.email ? 'email-error' : undefined} autoFocus required/>
      </Field>

      <SubmitButton processing={form.processing} busyLabel="Sending code…">Send code</SubmitButton>

      <p className={ui.footnote}>
        Remembered it?{' '}
        <Link href="/login" className={ui.link} onClick={onBackToLogin ? (event) => {
            event.preventDefault();
            onBackToLogin();
        } : undefined}>Back to login</Link>
      </p>
    </form>);
}
