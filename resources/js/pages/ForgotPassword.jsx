import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Components/AuthLayout';
import { Field, SubmitButton } from '@/Components/AuthUi';
import { inputClass, ui } from '@/Components/authStyles';
import dogImage from '../imports/logindog.png';

/** Forgot password step 1: ask for the account email. */
export default function ForgotPassword() {
    const form = useForm({ email: '' });

    function submit(event) {
        event.preventDefault();
        form.post('/forgot-password');
    }

    return (<AuthLayout title="Forgot password" image={dogImage} imageAlt="Puppies at a veterinary clinic" caption="Locked out? We'll get you back in a minute." kicker="Forgot password" heading="Reset your password" subtitle="Enter the email address on your account and we'll send you a 6-digit code.">
      <form className={ui.form} onSubmit={submit}>
        <Field id="email" label="Email address" required error={form.errors.email}>
          <input id="email" type="email" className={inputClass(Boolean(form.errors.email))} autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={form.data.email} onChange={(event) => {
            form.setData('email', event.target.value);
            if (form.errors.email) form.clearErrors('email');
        }} aria-invalid={Boolean(form.errors.email)} aria-describedby={form.errors.email ? 'email-error' : undefined} autoFocus required/>
        </Field>

        <SubmitButton processing={form.processing} busyLabel="Sending code…">Send code</SubmitButton>

        <p className={ui.footnote}>
          Remembered it? <Link href="/login" className={ui.link}>Back to login</Link>
        </p>
      </form>
    </AuthLayout>);
}
