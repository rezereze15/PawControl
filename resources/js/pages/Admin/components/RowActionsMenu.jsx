import { useEffect, useRef, useState } from "react";

/** The "⋮" menu at the end of an admin table row: Edit + Activate/Deactivate (same as Manage Users). */
export default function RowActionsMenu({ label, editLabel = "Edit", active, onEdit, onToggleStatus }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // While open: close on a click outside the menu, or on Escape.
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
        action();
    };

    return (<div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open} aria-label={label} className="paw-admin-user-actions flex items-center justify-center rounded p-2 text-gray-500 transition-colors hover:bg-gray-100">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.75"/><circle cx="12" cy="12" r="1.75"/><circle cx="12" cy="19" r="1.75"/></svg>
      </button>
      {open && (<div role="menu" className="paw-pop absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
          <button type="button" role="menuitem" onClick={choose(onEdit)} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[#1a0a3c] hover:bg-gray-50">
            <svg className="h-4 w-4 text-[#4a6cf7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" strokeLinejoin="round"/></svg>
            {editLabel}
          </button>
          <button type="button" role="menuitem" onClick={choose(onToggleStatus)} className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 ${active ? "text-red-600" : "text-emerald-700"}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {active ? <><circle cx="12" cy="12" r="9"/><path d="m6 6 12 12" strokeLinecap="round"/></> : <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round"/></>}
            </svg>
            {active ? "Deactivate" : "Activate"}
          </button>
        </div>)}
    </div>);
}
