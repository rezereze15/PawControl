import type { FormEventHandler } from "react"

interface RegisterFormProps {
  onSubmit: FormEventHandler<HTMLFormElement>
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  return (
    <form className="login-form" onSubmit={onSubmit}>
                  <div className="register-name-fields">
                    <div className="login-field">
                      <label htmlFor="first-name">First Name<span className="login-required">*</span></label>
                      <input id="first-name" type="text" placeholder="Enter your first name" />
                    </div>
    
                    <div className="login-field">
                      <label htmlFor="middle-name">Middle Name</label>
                      <input id="middle-name" type="text" placeholder="Enter your middle name" />
                    </div>
    
                    <div className="login-field">
                      <label htmlFor="last-name">Last Name<span className="login-required">*</span></label>
                      <input id="last-name" type="text" placeholder="Enter your last name" />
                    </div>
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="username">Username<span className="login-required">*</span></label>
                    <input id="username" type="text" placeholder="Choose a username" />
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="address">Address<span className="login-required">*</span></label>
                    <input id="address" type="text" placeholder="Enter your address" />
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="email">Email Address<span className="login-required">*</span></label>
                    <input id="email" type="email" placeholder="Enter your email address" />
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="contact-number">Contact Number<span className="login-required">*</span></label>
                    <input id="contact-number" type="tel" placeholder="Enter your contact number" />
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="password">Password<span className="login-required">*</span></label>
                    <input id="password" type="password" placeholder="Create a password" />
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="password-confirmation">Confirm Password<span className="login-required">*</span></label>
                    <input id="password-confirmation" type="password" placeholder="Confirm your password" />
                  </div>
    
                  <button type="submit" className="login-btn">Create Account</button>
    
                  <p className="login-signup-text">
                    Already have an account? <a href="/login" className="login-signup-link">Log in</a>
                  </p>
                </form>
  )
}
