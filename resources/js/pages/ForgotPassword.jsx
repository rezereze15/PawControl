import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '@/Components/AuthLayout';
import dogImage from '../imports/logindog.png';

/** Forgot password step 1: ask for the account email. */
export default function ForgotPassword() {
    const form = useForm({ email: '' });

    function submit(event) {
        event.preventDefault();
        form.post('/forgot-password');
    }

    return (<AuthLayout title="Forgot password" image={dogImage} imageAlt="Puppies at a veterinary clinic" caption="Locked out? We'll get you back in a minute." kicker="Forgot password" heading="Reset your password" subtitle="Enter the email address on your account and we'll send you a 6-digit code.">
      <form className="signin-form" onSubmit={submit}>
        <div className="signin-field">
          <label htmlFor="email" className="signin-label">
            Email address<span className="signin-required" aria-hidden="true">*</span>
          </label>
          <input id="email" type="email" className="signin-input" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" value={form.data.email} onChange={(event) => {
            form.setData('email', event.target.value);
            if (form.errors.email) form.clearErrors('email');
        }} aria-invalid={Boolean(form.errors.email)} aria-describedby={form.errors.email ? 'email-error' : undefined} autoFocus required/>
          {form.errors.email && <p id="email-error" className="signin-field-error" role="alert">{form.errors.email}</p>}
        </div>

        <button type="submit" className="signin-submit" disabled={form.processing} aria-busy={form.processing}>
          {form.processing && <span className="signin-spinner" aria-hidden="true"/>}
          <span>{form.processing ? 'Sending code…' : 'Send code'}</span>
        </button>

        <p className="signin-footnote">
          Remembered it? <Link href="/login" className="signin-link">Back to login</Link>
        </p>
      </form>
    </AuthLayout>);
}
