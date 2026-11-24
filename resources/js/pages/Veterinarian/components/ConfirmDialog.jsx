import { useEffect, useRef } from "react";

const TONES = {
    sky: { icon: "bg-sky-50 text-sky-600", button: "bg-paw-blue hover:bg-paw-blue-dark" },
    green: { icon: "bg-green-50 text-green-700", button: "bg-green-700 hover:bg-green-800" },
};

const ICONS = {
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01" strokeLinecap="round"/></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round"/></>,
};

/**
 * "Are you sure?" prompt shown on top of another modal (record view or diagnosis form).
 * Escape / backdrop click cancels only this prompt, never the modal underneath.
 */
export default function ConfirmDialog({ title = "Are you sure?", children, confirmLabel, busyLabel = "Saving…", busy = false, tone = "sky", icon = "info", onConfirm, onCancel }) {
    const confirmRef = useRef(null);
    const colors = TONES[tone] ?? TONES.sky;

    useEffect(() => {
        confirmRef.current?.focus();
        // Capture on document so the modal underneath (listening on window) doesn't close too.
        const onKeyDown = (event) => {
            if (event.key !== "Escape") return;
            event.stopPropagation();
            if (!busy) onCancel();
        };
        document.addEventListener("keydown", onKeyDown, true);
        return () => document.removeEventListener("keydown", onKeyDown, true);
    }, [busy, onCancel]);

    return (<div className="paw-modal-backdrop" style={{ zIndex: 60 }} onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) onCancel();
        }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-body" className="paw-pet-modal" style={{ width: "min(100%, 460px)" }}>
        <div className="flex flex-col gap-3 px-6 pt-6 pb-2">
          <span className={`flex h-11 w-11 items-center justify-center rounded-full ${colors.icon}`} aria-hidden="true">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{ICONS[icon] ?? ICONS.info}</svg>
          </span>
          <h2 id="confirm-dialog-title" className="text-lg font-extrabold text-[#1a0a3c]">{title}</h2>
          <div id="confirm-dialog-body" className="text-sm text-gray-600">{children}</div>
        </div>
        <footer className="paw-pet-modal-footer" style={{ borderTop: "none" }}>
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60">Cancel</button>
          <button ref={confirmRef} type="button" onClick={onConfirm} disabled={busy} className={`rounded-lg px-5 py-2 text-sm font-bold text-white disabled:opacity-60 ${colors.button}`}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </footer>
      </section>
    </div>);
}
