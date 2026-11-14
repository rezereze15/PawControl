import { router, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { ErrorMessage, Field, SubmitButton } from '@/Components/AuthUi';
import { cx, inputClass, ui } from '@/Components/authStyles';

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
        className: inputClass(Boolean(form.errors[field])),
        value: form.data[field],
        onChange: (event) => {
            form.setData(field, event.target.value);
            if (form.errors[field]) form.clearErrors(field);
        },
        'aria-invalid': Boolean(form.errors[field]),
        'aria-describedby': form.errors[field] ? `${id}-error` : undefined,
    });

    const errorCount = Object.keys(form.errors).length;
    const avatarClass = 'size-10 flex-none rounded-full object-cover shadow-[0_0_0_2px_#fff,0_0_0_3px_#ffbb50]';

    return (<div className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto p-4 text-[#151b2a] max-[560px]:place-items-start max-[560px]:p-3">
      {/* Backdrop: fades in; clicking it does nothing on purpose. */}
      <div className="fixed inset-0 bg-[rgb(25_4_63/0.55)] backdrop-blur-[4px] transition-opacity duration-200 ease-out starting:opacity-0" aria-hidden="true"/>

      {/* Panel: modals scale from the centre (not from a trigger). */}
      <div className="relative box-border w-[min(100%,680px)] origin-center rounded-3xl border-t-[5px] border-t-[#ffbb50] bg-white px-[clamp(20px,4vw,40px)] pt-8 pb-7 shadow-[0_1px_2px_rgb(25_4_63/0.08),0_32px_80px_-16px_rgb(25_4_63/0.45)] transition-[opacity,translate,scale] duration-[280ms] ease-[cubic-bezier(0.23,1,0.32,1)] starting:translate-y-2 starting:scale-[0.96] starting:opacity-0 motion-reduce:starting:translate-y-0 motion-reduce:starting:scale-100 max-[560px]:rounded-[20px] max-[560px]:px-[18px] max-[560px]:pt-6 max-[560px]:pb-[22px]" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title" aria-describedby="profile-modal-desc">
        <header className="mb-5">
          <p className={ui.kicker}>One last step</p>
          <h2 id="profile-modal-title" className="mb-2 text-[clamp(24px,3vw,30px)] leading-[1.15] font-extrabold tracking-[-0.02em] text-[#151b2a]">Complete your profile</h2>
          <p id="profile-modal-desc" className={ui.subtitle}>
            You signed in with Google. We just need a few more details before you can book appointments.
          </p>
        </header>

        {/* "Signed in as" row with the read-only Google email */}
        <div className="mb-5 flex items-center gap-3 rounded-[14px] border border-[#dcd8e8] bg-[#faf9fd] px-3.5 py-3">
          {photoUrl
            ? <img src={photoUrl} alt="" className={avatarClass} referrerPolicy="no-referrer"/>
            : <span className={cx(avatarClass, 'grid place-items-center bg-[#19043f] font-bold text-white')} aria-hidden="true">{(firstName || email || '?').charAt(0).toUpperCase()}</span>}
          <div className="flex min-w-0 flex-1 flex-col">
            <label htmlFor="profile-email" className="text-xs font-semibold tracking-[0.04em] text-[#5d6475] uppercase">Signed in as</label>
            <input id="profile-email" type="email" className="w-full cursor-default border-0 bg-transparent p-0 text-[15px] font-semibold text-ellipsis text-[#151b2a] outline-none" value={email} readOnly aria-readonly="true" tabIndex={-1}/>
          </div>
          <span className="flex-none rounded-full bg-[rgb(69_25_154/0.08)] px-2.5 py-1 text-xs font-bold text-[#45199a] max-[560px]:hidden">Google</span>
        </div>

        <form className={ui.formTight} onSubmit={submit} noValidate>
          {errorCount > 0 && (<ErrorMessage>
              Please fix the highlighted {errorCount === 1 ? 'field' : 'fields'} below.
            </ErrorMessage>)}

          <div className={ui.grid3}>
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

          <div className={ui.grid2}>
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

          <SubmitButton processing={form.processing} busyLabel="Saving…">Save and continue</SubmitButton>

          <p className="mt-0.5 text-center text-sm leading-normal text-[#5d6475]">
            Not you?{' '}
            <button type="button" className={ui.linkButton} onClick={() => router.post('/logout')}>Log out</button>
          </p>
        </form>
      </div>
    </div>);
}
