import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthLayout from '@/Components/AuthLayout';
import { Field } from '@/Components/RegisterForm';
import dogImage from '../imports/logindog.png';

/** Forgot password step 3: choose a new password (only reachable after a correct code). */
export default function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm({ password: '', password_confirmation: '' });

    function submit(event) {
        event.preventDefault();
        form.post('/reset-password', { onError: () => form.reset('password', 'password_confirmation') });
    }

    const bind = (field, id) => ({
        id,
        className: 'signin-input',
        value: form.data[field],
        onChange: (event) => {
            form.setData(field, event.target.value);
            if (form.errors[field]) form.clearErrors(field);
        },
        'aria-invalid': Boolean(form.errors[field]),
        'aria-describedby': form.errors[field] ? `${id}-error` : undefined,
    });

    return (<AuthLayout title="Choose a new password" image={dogImage} imageAlt="Puppies at a veterinary clinic" caption="Locked out? We'll get you back in a minute." kicker="Code verified" heading="Choose a new password" subtitle="Use at least 8 characters. You'll be asked to log in again afterwards.">
      <form className="signin-form" onSubmit={submit}>
        <Field id="password" label="New password" required error={form.errors.password}>
          <div className="signin-password">
            <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" autoFocus required {...bind('password', 'password')}/>
            <button type="button" className="signin-toggle" onClick={() => setShowPassword((shown) => !shown)} aria-pressed={showPassword} aria-controls="password password-confirmation">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </Field>

        <Field id="password-confirmation" label="Confirm password" required error={form.errors.password_confirmation}>
          <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter password" required {...bind('password_confirmation', 'password-confirmation')}/>
        </Field>

        <button type="submit" className="signin-submit" disabled={form.processing} aria-busy={form.processing}>
          {form.processing && <span className="signin-spinner" aria-hidden="true"/>}
          <span>{form.processing ? 'Updating…' : 'Update password'}</span>
        </button>

        <p className="signin-footnote">
          <Link href="/login" className="signin-link">Back to login</Link>
        </p>
      </form>
    </AuthLayout>);
}
