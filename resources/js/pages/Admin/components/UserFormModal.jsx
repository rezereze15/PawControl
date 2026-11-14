import { useEffect } from "react";
import { useForm } from "@inertiajs/react";

const input = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c] disabled:bg-gray-50 disabled:text-gray-500";

function Field({ id, label, required, error, children, className = "" }) {
    return (<div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-[#1a0a3c]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>);
}

/**
 * Create (user = null) or edit a user account. When editing your own account,
 * the role can't be changed, so an admin can't lock themselves out.
 */
export default function UserFormModal({ user, roles, isSelf, onClose }) {
    const editing = Boolean(user);
    const form = useForm({
        first_name: user?.first_name ?? "",
        middle_name: user?.middle_name ?? "",
        last_name: user?.last_name ?? "",
        username: user?.username ?? "",
        email: user?.email ?? "",
        phone: user?.phone ?? "",
        address: user?.address ?? "",
        role: user?.role ?? "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && !form.processing && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [form.processing, onClose]);

    function submit(event) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };
        if (editing) form.put(`/admin/users/${user.id}`, options);
        else form.post("/admin/users", options);
    }

    const selectedRole = roles.find((role) => role.name === form.data.role);
    const set = (field) => (event) => form.setData(field, event.target.value);

    return (<div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !form.processing) onClose();
        }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="user-form-title" className="paw-pet-modal paw-clerk-review-modal" noValidate>
        <header className="paw-pet-modal-header">
          <div>
            <h2 id="user-form-title" className="text-xl font-extrabold text-[#1a0a3c]">{editing ? "Edit User" : "Add New User"}</h2>
            <p className="text-xs text-gray-500">{editing ? `Update ${user.name}'s account details and role.` : "Create an account and assign its role."}</p>
          </div>
          <button type="button" onClick={onClose} disabled={form.processing} aria-label="Close" className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
          </button>
        </header>

        <div className="paw-pet-modal-body grid gap-6 md:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-5">
            <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <legend className="mb-2 text-sm font-extrabold text-[#4a6cf7]">Personal Information</legend>
              <Field id="first_name" label="First Name" required error={form.errors.first_name}>
                <input id="first_name" className={input} value={form.data.first_name} onChange={set("first_name")} maxLength={100} autoComplete="off" required/>
              </Field>
              <Field id="middle_name" label="Middle Name" error={form.errors.middle_name}>
                <input id="middle_name" className={input} value={form.data.middle_name} onChange={set("middle_name")} maxLength={100} autoComplete="off"/>
              </Field>
              <Field id="last_name" label="Last Name" required error={form.errors.last_name}>
                <input id="last_name" className={input} value={form.data.last_name} onChange={set("last_name")} maxLength={100} autoComplete="off" required/>
              </Field>
              <Field id="email" label="Email Address" required error={form.errors.email} className="sm:col-span-2">
                <input id="email" type="email" className={input} value={form.data.email} onChange={set("email")} maxLength={255} autoComplete="off" required/>
              </Field>
              <Field id="phone" label="Contact Number" required error={form.errors.phone}>
                <input id="phone" type="tel" inputMode="tel" className={input} value={form.data.phone} onChange={set("phone")} maxLength={30} placeholder="09XXXXXXXXX" autoComplete="off" required/>
              </Field>
              <Field id="address" label="Address" required error={form.errors.address} className="sm:col-span-3">
                <input id="address" className={input} value={form.data.address} onChange={set("address")} maxLength={500} autoComplete="off" required/>
              </Field>
            </fieldset>

            <fieldset className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <legend className="mb-2 text-sm font-extrabold text-[#4a6cf7]">Sign-in Details</legend>
              <Field id="username" label="Username" required error={form.errors.username}>
                <input id="username" className={input} value={form.data.username} onChange={set("username")} maxLength={50} autoComplete="off" required/>
              </Field>
              <Field id="password" label={editing ? "New Password" : "Password"} required={!editing} error={form.errors.password}>
                <input id="password" type="password" className={input} value={form.data.password} onChange={set("password")} autoComplete="new-password" placeholder={editing ? "Leave blank to keep" : "At least 8 characters"} required={!editing}/>
              </Field>
              <Field id="password_confirmation" label="Confirm Password" required={!editing} error={form.errors.password_confirmation}>
                <input id="password_confirmation" type="password" className={input} value={form.data.password_confirmation} onChange={set("password_confirmation")} autoComplete="new-password" required={!editing || Boolean(form.data.password)}/>
              </Field>
              {!editing && <p className="text-[11px] text-gray-400 sm:col-span-3">Share this password with the user privately. They can change it later in User Settings.</p>}
            </fieldset>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-extrabold text-[#4a6cf7]">Role &amp; Access</legend>
            <Field id="role" label="Role" required error={form.errors.role}>
              <select id="role" className={input} value={form.data.role} onChange={set("role")} disabled={isSelf} required>
                <option value="" disabled>Select a role</option>
                {roles.map((role) => <option key={role.name} value={role.name}>{role.label}</option>)}
              </select>
              {isSelf && <p className="mt-1 text-[11px] text-gray-400">You can't change your own role.</p>}
            </Field>
            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-700">{selectedRole ? `${selectedRole.label} can` : "Access permissions"}</p>
              {selectedRole ? (<ul className="flex flex-col gap-1.5">
                  {selectedRole.permissions.map((permission) => (<li key={permission} className="flex items-start gap-2 text-sm text-[#1a0a3c]">
                      <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {permission}
                    </li>))}
                </ul>) : <p className="text-sm text-gray-500">Choose a role to see what this user will be able to access.</p>}
            </div>
          </fieldset>
        </div>

        <footer className="paw-pet-modal-footer">
          <button type="button" onClick={onClose} disabled={form.processing} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={form.processing} className="rounded-lg bg-[#3b0f8c] px-6 py-2 text-sm font-bold text-white hover:bg-[#2d0a6e] disabled:opacity-60">
            {form.processing ? "Saving…" : editing ? "Save Changes" : "Create Account"}
          </button>
        </footer>
      </form>
    </div>);
}
