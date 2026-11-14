import { router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Field } from '@/Components/RegisterForm';
import '../../css/AuthPage.css';
import '../../css/CompleteProfileModal.css';

/**
 * Blocking "complete your profile" modal for users who signed up with Google.
 *
 * It cannot be dismissed: no close button, clicks on the backdrop do nothing and
 * Escape is swallowed. The dashboard behind it is `inert` (see Dashboard.jsx), and
 * the server refuses dashboard data/actions until this is saved
 * (EnsureProfileIsComplete middleware), so hiding it in DevTools unlocks nothing.
 */
export default function CompleteProfileModal({ email, firstName = '', middleName = '', lastName = '', photoUrl }) {
    const form = useForm({
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        username: '',
        phone: '',
        address: '',
    });

    // Lock page scroll and swallow Escape while the modal is open.
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const blockEscape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        document.addEventListener('keydown', blockEscape, true);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', blockEscape, true);
        };
    }, []);

    function submit(event) {
        event.preventDefault();
        form.post('/profile/complete', { preserveScroll: true });
    }

    // Same input wiring as RegisterForm: value binding, error state and a11y.
    const bind = (field, id) => ({
        id,
        name: field,
        className: 'signin-input',
        value: form.data[field],
        onChange: (event) => {
            form.setData(field, event.target.value);
            if (form.errors[field]) form.clearErrors(field);
        },
        'aria-invalid': Boolean(form.errors[field]),
        'aria-describedby': form.errors[field] ? `${id}-error` : undefined,
    });

    const errorCount = Object.keys(form.errors).length;

    return (<div className="signin-theme profile-modal-root">
      <div className="profile-modal-backdrop" aria-hidden="true"/>
      <div className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" aria-describedby="profile-modal-desc">
        <header className="profile-modal-head">
          <p className="signin-kicker">One last step</p>
          <h2 id="profile-modal-title" className="signin-title profile-modal-title">Complete your profile</h2>
          <p id="profile-modal-desc" className="signin-subtitle">
            You signed in with Google. We just need a few more details before you can book appointments.
          </p>
        </header>

        <div className="profile-modal-account">
          {photoUrl
            ? <img src={photoUrl} alt="" className="profile-modal-avatar" referrerPolicy="no-referrer"/>
            : <span className="profile-modal-avatar profile-modal-avatar--empty" aria-hidden="true">{(firstName || email || '?').charAt(0).toUpperCase()}</span>}
          <div className="profile-modal-account-text">
            <label htmlFor="profile-email" className="profile-modal-account-label">Signed in as</label>
            <input id="profile-email" type="email" className="profile-modal-email" value={email} readOnly aria-readonly="true" tabIndex={-1}/>
          </div>
          <span className="profile-modal-badge">Google</span>
        </div>

        <form className="signin-form register-form" onSubmit={submit} noValidate>
          {errorCount > 0 && (<p className="signin-error" role="alert">
              <svg viewBox="0 0 20 20" aria-hidden="true" className="signin-error-icon">
                <path fill="currentColor" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a1 1 0 0 1 1 1v3.5a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8.75a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"/>
              </svg>
              <span>Please fix the highlighted {errorCount === 1 ? 'field' : 'fields'} below.</span>
            </p>)}

          <div className="register-grid register-grid--3">
            <Field id="profile-first-name" label="First name" required error={form.errors.first_name}>
              <input type="text" autoComplete="given-name" placeholder="First name" required {...bind('first_name', 'profile-first-name')}/>
            </Field>
            <Field id="profile-middle-name" label="Middle name" optional error={form.errors.middle_name}>
              <input type="text" autoComplete="additional-name" placeholder="Middle name" {...bind('middle_name', 'profile-middle-name')}/>
            </Field>
            <Field id="profile-last-name" label="Last name" required error={form.errors.last_name}>
              <input type="text" autoComplete="family-name" placeholder="Last name" required {...bind('last_name', 'profile-last-name')}/>
            </Field>
          </div>

          <div className="register-grid register-grid--2">
            <Field id="profile-username" label="Username" required error={form.errors.username}>
              <input type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Choose a username" required autoFocus {...bind('username', 'profile-username')}/>
            </Field>
            <Field id="profile-phone" label="Contact number" required error={form.errors.phone}>
              <input type="tel" autoComplete="tel" inputMode="tel" placeholder="Your phone number" required {...bind('phone', 'profile-phone')}/>
            </Field>
          </div>

          <Field id="profile-address" label="Address" required error={form.errors.address}>
            <input type="text" autoComplete="street-address" placeholder="House no., street, city" required {...bind('address', 'profile-address')}/>
          </Field>

          <button type="submit" className="signin-submit" disabled={form.processing} aria-busy={form.processing}>
            {form.processing && <span className="signin-spinner" aria-hidden="true"/>}
            <span>{form.processing ? 'Saving…' : 'Save and continue'}</span>
          </button>

          <p className="signin-footnote profile-modal-foot">
            Not you?{' '}
            <button type="button" className="profile-modal-logout" onClick={() => router.post('/logout')}>Log out</button>
          </p>
        </form>
      </div>
    </div>);
}
