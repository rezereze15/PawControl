import { useEffect, useRef, useState } from "react";
import DataTable from "@/Components/DataTable";
import StatusBadge from "@/Components/StatusBadge";

export const ROLE_BADGE = {
    admin: "bg-red-100 text-red-500 border border-red-300",
    owner: "bg-orange-100 text-orange-600 border border-orange-300",
    clerk: "bg-yellow-100 text-yellow-600 border border-yellow-300",
    veterinarian: "bg-green-100 text-green-600 border border-green-300",
    customer: "bg-purple-100 text-purple-600 border border-purple-300",
};

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

function ActionsMenu({ user, isSelf, onEdit, onToggleStatus }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const active = user.status === "Active";

    useEffect(() => {
        if (!open) return undefined;
        const close = (event) => {
            if (event.type === "keydown" ? event.key === "Escape" : !ref.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", close);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("keydown", close);
        };
    }, [open]);

    const choose = (action) => () => {
        setOpen(false);
        action(user);
    };

    return (<div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label={`Actions for ${user.name}`} className="paw-admin-user-actions flex items-center justify-center rounded p-2 text-gray-500 transition-colors hover:bg-gray-100">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.75"/><circle cx="12" cy="12" r="1.75"/><circle cx="12" cy="19" r="1.75"/></svg>
      </button>
      {open && (<div role="menu" className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <button type="button" role="menuitem" onClick={choose(onEdit)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#1a0a3c] hover:bg-gray-50">
            <svg className="h-4 w-4 text-[#4a6cf7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" strokeLinejoin="round"/></svg>
            Edit details &amp; role
          </button>
          {!isSelf && (<button type="button" role="menuitem" onClick={choose(onToggleStatus)} className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 ${active ? "text-red-600" : "text-emerald-700"}`}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {active ? <><circle cx="12" cy="12" r="9"/><path d="m6 6 12 12" strokeLinecap="round"/></> : <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round"/></>}
              </svg>
              {active ? "Deactivate" : "Activate"}
            </button>)}
        </div>)}
    </div>);
}

export default function UserTable({ users, roleLabels, currentUserId, onEdit, onToggleStatus }) {
    return (<DataTable className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {["Users", "Role", "Email", "Last Login", "Status", "Actions"].map((h) => (<th key={h} className="px-6 py-4 text-left text-sm font-bold text-[#1a0a3c]">{h}</th>))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {users.length === 0 && (<tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">No users match these filters.</td></tr>)}
        {users.map((u) => {
            const isSelf = u.id === currentUserId;
            const lastLogin = u.lastLoginAt ? new Date(u.lastLoginAt) : null;
            return (<tr key={u.id} className={`transition-colors hover:bg-gray-50 ${u.status === "Active" ? "" : "bg-gray-50/60"}`}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                    {u.photoUrl ? <img src={u.photoUrl} alt="" className="h-full w-full object-cover"/> : <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">{u.name?.[0] ?? "?"}</div>}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1a0a3c]">{u.name}{isSelf && <span className="ml-1.5 text-[10px] font-bold uppercase text-violet-500">You</span>}</p>
                    <p className="text-xs text-gray-400">UID-{String(u.id).padStart(4, "0")}{u.username ? ` · @${u.username}` : ""}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge className={`rounded-full px-3 py-1 text-xs font-semibold ${ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-600"}`}>{roleLabels[u.role] ?? u.role}</StatusBadge>
              </td>
              <td className="px-6 py-4 text-gray-600">{u.email}</td>
              <td className="px-6 py-4">
                {lastLogin ? (<div className="flex flex-col gap-0.5 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                      {dateFormat.format(lastLogin)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
                      {timeFormat.format(lastLogin)}
                    </span>
                  </div>) : <span className="text-xs text-gray-400">Never</span>}
              </td>
              <td className="px-6 py-4">
                <StatusBadge className={`rounded-full border px-3 py-1 text-xs font-semibold ${u.status === "Active" ? "border-green-400 bg-green-50 text-green-600" : "border-gray-300 bg-gray-50 text-gray-500"}`}>{u.status}</StatusBadge>
              </td>
              <td className="px-6 py-4">
                <ActionsMenu user={u} isSelf={isSelf} onEdit={onEdit} onToggleStatus={onToggleStatus}/>
              </td>
            </tr>);
        })}
      </tbody>
    </DataTable>);
}
