import { useEffect, useRef, useState } from "react";
import { useForm } from "@inertiajs/react";
import { PersonIcon } from "../../shared/dashboard/Icons";

const input = "w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]";
const readOnly = "w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500";

function ReadOnlyField({ label, value }) {
    return (<label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-bold text-[#1a0a3c]">{label}</span>
      <input className={readOnly} value={value || ""} placeholder="Not provided" readOnly aria-readonly="true" tabIndex={-1}/>
    </label>);
}

function FieldError({ message }) {
    return message ? <p className="mt-1 text-xs text-red-600" role="alert">{message}</p> : null;
}

function PasswordInput({ id, label, value, onChange, error, autoComplete, placeholder }) {
    const [visible, setVisible] = useState(false);
    return (<div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-[#1a0a3c]">{label}</label>
      <div className="relative">
        <input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} placeholder={placeholder} className={`${input} pr-10`} required/>
        <button type="button" onClick={() => setVisible((v) => !v)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            {!visible && <path d="M3 3l18 18" strokeLinecap="round"/>}
          </svg>
        </button>
      </div>
      <FieldError message={error}/>
    </div>);
}

export default function UserSettings({ profile = {}, fallbackAvatar }) {
    const fileInput = useRef(null);
    const [preview, setPreview] = useState(null);
    const photo = useForm({ photo: null });
    const address = useForm({ address: profile.address ?? "" });
    const password = useForm({ current_password: "", password: "", password_confirmation: "" });

    useEffect(() => () => {
        if (preview) URL.revokeObjectURL(preview);
    }, [preview]);

    function choosePhoto(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            photo.setError("photo", "Please choose a JPG, PNG or WebP image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            photo.setError("photo", "The photo must be 5 MB or smaller.");
            return;
        }
        photo.clearErrors();
        setPreview(URL.createObjectURL(file));
        photo.setData("photo", file);
    }

    function savePhoto() {
        photo.post("/settings/photo", {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { photo.reset(); setPreview(null); },
        });
    }

    function saveAddress(event) {
        event.preventDefault();
        address.put("/settings/address", { preserveScroll: true });
    }

    function savePassword(event) {
        event.preventDefault();
        password.put("/settings/password", {
            preserveScroll: true,
            onSuccess: () => password.reset(),
            onError: () => password.reset("password", "password_confirmation"),
        });
    }

    const avatar = preview || profile.photoUrl || fallbackAvatar;
    const addressChanged = address.data.address.trim() !== (profile.address ?? "").trim();

    return (<div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">User Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your profile photo, address and password.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="profile-heading">
          <h2 id="profile-heading" className="mb-5 flex items-center gap-2 text-lg font-extrabold text-[#4a6cf7]">
            <PersonIcon className="h-5 w-5" color="currentColor"/> Profile Information
          </h2>
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img src={avatar} alt="Your profile photo" className="h-32 w-32 rounded-full border-4 border-white object-cover shadow"/>
                <button type="button" onClick={() => fileInput.current?.click()} aria-label="Choose a new profile photo" className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#1a0a3c] text-white shadow hover:bg-[#3b0f8c] focus:outline-none focus:ring-2 focus:ring-violet-300">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </button>
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={choosePhoto}/>
              </div>
              {photo.data.photo && (<div className="flex gap-2">
                  <button type="button" onClick={() => { photo.reset(); setPreview(null); }} disabled={photo.processing} className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="button" onClick={savePhoto} disabled={photo.processing} className="rounded-full bg-[#3b0f8c] px-3 py-1 text-xs font-bold text-white hover:bg-[#2d0a6e] disabled:opacity-60">{photo.processing ? "Uploading…" : "Save photo"}</button>
                </div>)}
              <FieldError message={photo.errors.photo}/>
              <p className="max-w-[10rem] text-center text-[11px] text-gray-400">JPG, PNG or WebP, up to 5 MB</p>
            </div>

            <form onSubmit={saveAddress} className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
              <ReadOnlyField label="Full Name" value={profile.name}/>
              <ReadOnlyField label="Username" value={profile.username}/>
              <ReadOnlyField label="Email Address" value={profile.email}/>
              <ReadOnlyField label="Contact Number" value={profile.phone}/>
              <ReadOnlyField label="Role" value={profile.role === "customer" ? "Pet Owner" : profile.role}/>
              <label className="flex min-w-0 flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-bold text-[#1a0a3c]">Address</span>
                <input className={input} value={address.data.address} onChange={(event) => address.setData("address", event.target.value)} maxLength={255} autoComplete="street-address" placeholder="House no., street, barangay, city" required/>
                <FieldError message={address.errors.address}/>
              </label>
              <p className="text-[11px] text-gray-400 sm:col-span-2">To change your name, email or contact number, please ask the clinic staff.</p>
              <div className="flex justify-end sm:col-span-2">
                <button type="submit" disabled={!addressChanged || address.processing} className="rounded-lg bg-[#3b0f8c] px-6 py-2 text-xs font-bold text-white hover:bg-[#2d0a6e] disabled:cursor-not-allowed disabled:opacity-50">{address.processing ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="password-heading">
          <h2 id="password-heading" className="mb-5 flex items-center gap-2 text-lg font-extrabold text-[#4a6cf7]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17 9V7a5 5 0 0 0-10 0v2H5v13h14V9zm-8 0V7a3 3 0 0 1 6 0v2z"/></svg>
            Change Password
          </h2>
          <form onSubmit={savePassword} className="flex flex-col gap-4">
            <PasswordInput id="current-password" label="Current Password" value={password.data.current_password} onChange={(v) => password.setData("current_password", v)} error={password.errors.current_password} autoComplete="current-password" placeholder="Enter current password"/>
            <PasswordInput id="new-password" label="New Password" value={password.data.password} onChange={(v) => password.setData("password", v)} error={password.errors.password} autoComplete="new-password" placeholder="At least 8 characters, letters and numbers"/>
            <PasswordInput id="confirm-password" label="Confirm New Password" value={password.data.password_confirmation} onChange={(v) => password.setData("password_confirmation", v)} error={password.errors.password_confirmation} autoComplete="new-password" placeholder="Confirm new password"/>
            <div className="flex justify-end">
              <button type="submit" disabled={password.processing} className="rounded-lg bg-[#3b0f8c] px-6 py-2 text-xs font-bold text-white hover:bg-[#2d0a6e] disabled:opacity-60">{password.processing ? "Updating…" : "Update Password"}</button>
            </div>
          </form>
        </section>
      </div>
    </div>);
}
