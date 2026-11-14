import { Link } from '@inertiajs/react';
import { useState } from 'react';
import GoogleButton from '@/Components/GoogleButton';
import { ErrorMessage, SubmitButton, SuccessMessage } from '@/Components/AuthUi';
import { inputClass, ui } from '@/Components/authStyles';

export default function LoginForm({ username, password, error, success = '', processing = false, onUsernameChange, onPasswordChange, onClearError, onSubmit }) {
    const [showPassword, setShowPassword] = useState(false);
    const invalid = Boolean(error);

    return (<form className={ui.form} onSubmit={onSubmit}>
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <div className={ui.field}>
        <label htmlFor="username" className={ui.label}>
          Username or email<span className={ui.required} aria-hidden="true">*</span>
        </label>
        <input id="username" type="text" className={inputClass(invalid)} autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(event) => {
            onUsernameChange(event.target.value);
            onClearError();
        }} placeholder="Enter your username" aria-invalid={invalid} required/>
      </div>

      <div className={ui.field}>
        <div className={ui.labelRow}>
          <label htmlFor="password" className={ui.label}>
            Password<span className={ui.required} aria-hidden="true">*</span>
          </label>
          <Link href="/forgot-password" className={ui.forgot}>Forgot password?</Link>
        </div>
        <div className={ui.passwordWrap}>
          <input id="password" type={showPassword ? 'text' : 'password'} className={inputClass(invalid, ui.passwordInputPad)} autoComplete="current-password" value={password} onChange={(event) => {
            onPasswordChange(event.target.value);
            onClearError();
        }} placeholder="Enter your password" aria-invalid={invalid} required/>
          <button type="button" className={ui.toggle} onClick={() => setShowPassword((shown) => !shown)} aria-pressed={showPassword} aria-controls="password">
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <SubmitButton processing={processing} busyLabel="Logging in…">Log in</SubmitButton>

      <GoogleButton />

      <p className={ui.footnote}>
        Don&apos;t have an account yet?{' '}
        <a href="/register" className={ui.link}>Sign up</a>{' '}
        to book your pet&apos;s visit.
      </p>
    </form>);
}
