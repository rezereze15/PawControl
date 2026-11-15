import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Field, SubmitButton } from '@/Components/AuthUi';
import { inputClass, ui } from '@/Components/authStyles';

/**
 * Forgot password, last step: choose a new password (the server only allows this
 * after a correct code). Moved unchanged from the old pages/ResetPassword.jsx.
 * On success the server redirects to /login with "Password updated…".
 */
export default function ResetPasswordForm({ onBackToLogin }) {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm({ password: '', password_confirmation: '' });

    function submit(event) {
        event.preventDefault();
        form.post('/reset-password', { onError: () => form.reset('password', 'password_confirmation') });
    }

    const bind = (field, id, extraClass = '') => ({
        id,
        className: inputClass(Boolean(form.errors[field]), extraClass),
        value: form.data[field],
        onChange: (event) => {
            form.setData(field, event.target.value);
            if (form.errors[field]) form.clearErrors(field);
        },
        'aria-invalid': Boolean(form.errors[field]),
        'aria-describedby': form.errors[field] ? `${id}-error` : undefined,
    });

    return (<form className={ui.form} onSubmit={submit}>
      <Field id="password" label="New password" required error={form.errors.password}>
        <div className={ui.passwordWrap}>
          <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" autoFocus required {...bind('password', 'password', ui.passwordInputPad)}/>
          <button type="button" className={ui.toggle} onClick={() => setShowPassword((shown) => !shown)} aria-pressed={showPassword} aria-controls="password password-confirmation">
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </Field>

      <Field id="password-confirmation" label="Confirm password" required error={form.errors.password_confirmation}>
        <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter password" required {...bind('password_confirmation', 'password-confirmation')}/>
      </Field>

      <SubmitButton processing={form.processing} busyLabel="Updating…">Update password</SubmitButton>

      <p className={ui.footnote}>
        <Link href="/login" className={ui.link} onClick={onBackToLogin ? (event) => {
            event.preventDefault();
            onBackToLogin();
        } : undefined}>Back to login</Link>
      </p>
    </form>);
}
