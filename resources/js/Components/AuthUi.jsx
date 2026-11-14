import { cx, ui } from '@/Components/authStyles';

/** Red alert box with an icon (form-level errors). */
export function ErrorMessage({ children }) {
    return (<p className={ui.error} role="alert">
      <svg viewBox="0 0 20 20" aria-hidden="true" className={ui.errorIcon}>
        <path fill="currentColor" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a1 1 0 0 1 1 1v3.5a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8.75a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"/>
      </svg>
      <span>{children}</span>
    </p>);
}

/** Green notice (e.g. "Password updated. You can now log in."). */
export function SuccessMessage({ children }) {
    return <p className={ui.success} role="status">{children}</p>;
}

/** Navy primary button with a spinner while `processing`. */
export function SubmitButton({ processing = false, disabled = false, busyLabel, children }) {
    return (<button type="submit" className={ui.submit} disabled={processing || disabled} aria-busy={processing}>
      {processing && <span className={ui.spinner} aria-hidden="true"/>}
      <span>{processing ? busyLabel : children}</span>
    </button>);
}

/** Labelled form field with optional "*" / "Optional" marker and an error line. */
export function Field({ id, label, required = false, optional = false, error, className = '', children }) {
    return (<div className={cx(ui.field, className)}>
      <label htmlFor={id} className={ui.label}>
        {label}
        {required && <span className={ui.required} aria-hidden="true">*</span>}
        {optional && <span className={ui.optional}>Optional</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className={ui.fieldError} role="alert">{error}</p>}
    </div>);
}
