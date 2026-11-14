import { Link } from '@inertiajs/react';
import { useState } from 'react';
import GoogleButton from '@/Components/GoogleButton';

export default function LoginForm({ username, password, error, success = '', processing = false, onUsernameChange, onPasswordChange, onClearError, onSubmit }) {
    const [showPassword, setShowPassword] = useState(false);

    return (<form className="signin-form" onSubmit={onSubmit}>
      {success && <p className="signin-success" role="status">{success}</p>}

      <div className="signin-field">
        <label htmlFor="username" className="signin-label">
          Username or email<span className="signin-required" aria-hidden="true">*</span>
        </label>
        <input id="username" type="text" className="signin-input" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(event) => {
            onUsernameChange(event.target.value);
            onClearError();
        }} placeholder="Enter your username" aria-invalid={Boolean(error)} required/>
      </div>

      <div className="signin-field">
        <div className="signin-label-row">
          <label htmlFor="password" className="signin-label">
            Password<span className="signin-required" aria-hidden="true">*</span>
          </label>
          <Link href="/forgot-password" className="signin-forgot">Forgot password?</Link>
        </div>
        <div className="signin-password">
          <input id="password" type={showPassword ? 'text' : 'password'} className="signin-input" autoComplete="current-password" value={password} onChange={(event) => {
            onPasswordChange(event.target.value);
            onClearError();
        }} placeholder="Enter your password" aria-invalid={Boolean(error)} required/>
          <button type="button" className="signin-toggle" onClick={() => setShowPassword((shown) => !shown)} aria-pressed={showPassword} aria-controls="password">
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {error && (<p className="signin-error" role="alert">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="signin-error-icon">
            <path fill="currentColor" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a1 1 0 0 1 1 1v3.5a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8.75a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"/>
          </svg>
          <span>{error}</span>
        </p>)}

      <button type="submit" className="signin-submit" disabled={processing} aria-busy={processing}>
        {processing && <span className="signin-spinner" aria-hidden="true"/>}
        <span>{processing ? 'Logging in…' : 'Log in'}</span>
      </button>

      <GoogleButton />

      <p className="signin-footnote">
        Don&apos;t have an account yet?{' '}
        <a href="/register" className="signin-link">Sign up</a>{' '}
        to book your pet&apos;s visit.
      </p>
    </form>);
}
