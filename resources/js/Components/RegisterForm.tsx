import { useForm } from "@inertiajs/react"

export default function RegisterForm() {
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
  })

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    form.post("/register")
  }

  const fieldError = (field: keyof typeof form.errors) =>
    form.errors[field] && <p className="login-error" role="alert">{form.errors[field]}</p>

  return (
    <form className="login-form" onSubmit={submit}>
                  <div className="register-name-fields">
                    <div className="login-field">
                      <label htmlFor="first-name">First Name<span className="login-required">*</span></label>
                      <input id="first-name" type="text" autoComplete="given-name" placeholder="Enter your first name" value={form.data.first_name} onChange={(event) => form.setData("first_name", event.target.value)} required />
                      {fieldError("first_name")}
                    </div>
    
                    <div className="login-field">
                      <label htmlFor="middle-name">Middle Name</label>
                      <input id="middle-name" type="text" placeholder="Enter your middle name" value={form.data.middle_name} onChange={(event) => form.setData("middle_name", event.target.value)} />
                      {fieldError("middle_name")}
                    </div>
    
                    <div className="login-field">
                      <label htmlFor="last-name">Last Name<span className="login-required">*</span></label>
                      <input id="last-name" type="text" autoComplete="family-name" placeholder="Enter your last name" value={form.data.last_name} onChange={(event) => form.setData("last_name", event.target.value)} required />
                      {fieldError("last_name")}
                    </div>
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="username">Username<span className="login-required">*</span></label>
                    <input id="username" type="text" autoComplete="username" placeholder="Choose a username" value={form.data.username} onChange={(event) => form.setData("username", event.target.value)} required />
                    {fieldError("username")}
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="address">Address<span className="login-required">*</span></label>
                    <input id="address" type="text" autoComplete="street-address" placeholder="Enter your address" value={form.data.address} onChange={(event) => form.setData("address", event.target.value)} required />
                    {fieldError("address")}
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="email">Email Address<span className="login-required">*</span></label>
                    <input id="email" type="email" autoComplete="email" placeholder="Enter your email address" value={form.data.email} onChange={(event) => form.setData("email", event.target.value)} required />
                    {fieldError("email")}
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="contact-number">Contact Number<span className="login-required">*</span></label>
                    <input id="contact-number" type="tel" autoComplete="tel" placeholder="Enter your contact number" value={form.data.phone} onChange={(event) => form.setData("phone", event.target.value)} required />
                    {fieldError("phone")}
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="password">Password<span className="login-required">*</span></label>
                    <input id="password" type="password" autoComplete="new-password" placeholder="Create a password" value={form.data.password} onChange={(event) => form.setData("password", event.target.value)} required />
                    {fieldError("password")}
                  </div>
    
                  <div className="login-field">
                    <label htmlFor="password-confirmation">Confirm Password<span className="login-required">*</span></label>
                    <input id="password-confirmation" type="password" autoComplete="new-password" placeholder="Confirm your password" value={form.data.password_confirmation} onChange={(event) => form.setData("password_confirmation", event.target.value)} required />
                  </div>
    
                  <button type="submit" className="login-btn" disabled={form.processing}>{form.processing ? "Creating Account..." : "Create Account"}</button>
    
                  <p className="login-signup-text">
                    Already have an account? <a href="/login" className="login-signup-link">Log in</a>
                  </p>
                </form>
  )
}
