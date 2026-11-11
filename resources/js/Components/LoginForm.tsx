import type { FormEventHandler } from "react"

interface LoginFormProps {
  username: string
  password: string
  error: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onClearError: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export default function LoginForm({ username, password, error, onUsernameChange, onPasswordChange, onClearError, onSubmit }: LoginFormProps) {
  return (
    <form className="login-form" onSubmit={onSubmit}>
                  <div className="login-field">
                    <label htmlFor="username">
                      Username<span className="login-required">*</span>
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(event) => {
                        onUsernameChange(event.target.value);
                        onClearError();
                      }}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="password">
                      Password<span className="login-required">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => {
                        onPasswordChange(event.target.value);
                        onClearError();
                      }}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
    
                  {error && <p className="login-error" role="alert">{error}</p>}
    
                  <p className="login-forgot-password">Forgot password?</p>
                  <button type="submit" className="login-btn">Login</button>
    
                  <p className="login-signup-text">
                    Don't have an account yet?{" "}
                    <a href="/register" className="login-signup-link">Sign up</a>{" "}
                    to book your pet's visit
                  </p>
                </form>
  )
}
