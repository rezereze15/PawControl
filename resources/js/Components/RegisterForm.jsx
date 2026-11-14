import { useForm } from "@inertiajs/react";
import { useState } from "react";

function Field({ id, label, required = false, optional = false, error, className = "", children }) {
    return (<div className={`signin-field ${className}`}>
      <label htmlFor={id} className="signin-label">
        {label}
        {required && <span className="signin-required" aria-hidden="true">*</span>}
        {optional && <span className="signin-optional">Optional</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="signin-field-error" role="alert">{error}</p>}
    </div>);
}

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        username: "",
        address: "",
        email: "",
        phone: "",
        password: "",
        password_confirmation: "",
    });
    function submit(event) {
        event.preventDefault();
        form.post("/register", { onError: () => form.reset("password", "password_confirmation") });
    }
    // Shared props for each input: value binding, error state and a11y wiring.
    const bind = (field, id) => ({
        id,
        className: "signin-input",
        value: form.data[field],
        onChange: (event) => {
            form.setData(field, event.target.value);
            if (form.errors[field]) form.clearErrors(field);
        },
        "aria-invalid": Boolean(form.errors[field]),
        "aria-describedby": form.errors[field] ? `${id}-error` : undefined,
    });
    return (<form className="signin-form register-form" onSubmit={submit}>
      <div className="register-grid register-grid--3">
        <Field id="first-name" label="First name" required error={form.errors.first_name}>
          <input type="text" autoComplete="given-name" placeholder="First name" required {...bind("first_name", "first-name")}/>
        </Field>
        <Field id="middle-name" label="Middle name" optional error={form.errors.middle_name}>
          <input type="text" autoComplete="additional-name" placeholder="Middle name" {...bind("middle_name", "middle-name")}/>
        </Field>
        <Field id="last-name" label="Last name" required error={form.errors.last_name}>
          <input type="text" autoComplete="family-name" placeholder="Last name" required {...bind("last_name", "last-name")}/>
        </Field>
      </div>

      <div className="register-grid register-grid--2">
        <Field id="username" label="Username" required error={form.errors.username}>
          <input type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="Choose a username" required {...bind("username", "username")}/>
        </Field>
        <Field id="contact-number" label="Contact number" required error={form.errors.phone}>
          <input type="tel" autoComplete="tel" inputMode="tel" placeholder="Your phone number" required {...bind("phone", "contact-number")}/>
        </Field>
      </div>

      <Field id="email" label="Email address" required error={form.errors.email}>
        <input type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} placeholder="you@example.com" required {...bind("email", "email")}/>
      </Field>

      <Field id="address" label="Address" required error={form.errors.address}>
        <input type="text" autoComplete="street-address" placeholder="House no., street, city" required {...bind("address", "address")}/>
      </Field>

      <div className="register-grid register-grid--2">
        <Field id="password" label="Password" required error={form.errors.password}>
          <div className="signin-password">
            <input type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" required {...bind("password", "password")}/>
            <button type="button" className="signin-toggle" onClick={() => setShowPassword((shown) => !shown)} aria-pressed={showPassword} aria-controls="password password-confirmation">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Field>
        <Field id="password-confirmation" label="Confirm password" required error={form.errors.password_confirmation}>
          <input type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Re-enter password" required {...bind("password_confirmation", "password-confirmation")}/>
        </Field>
      </div>

      <button type="submit" className="signin-submit" disabled={form.processing} aria-busy={form.processing}>
        {form.processing && <span className="signin-spinner" aria-hidden="true"/>}
        <span>{form.processing ? "Sending code…" : "Create account"}</span>
      </button>

      <p className="signin-footnote">
        Already have an account? <a href="/login" className="signin-link">Log in</a>
      </p>
    </form>);
}
