import { useEffect } from "react";
import { useForm } from "@inertiajs/react";

/** Confirm activating or deactivating a medical supply. */
export default function SupplyStatusModal({ supply, onClose }) {
    const deactivating = supply.isActive;
    const form = useForm({ is_active: !deactivating });

    useEffect(() => {
        const onKeyDown = (event) => event.key === "Escape" && !form.processing && onClose();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [form.processing, onClose]);

    function confirm() {
        form.patch(`/admin/supplies/${supply.id}/status`, { preserveScroll: true, onSuccess: onClose });
    }

    return (<div className="paw-modal-backdrop" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !form.processing) onClose();
        }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="supply-status-title" aria-describedby="supply-status-desc" className="paw-pet-modal" style={{ width: "min(100%, 440px)" }}>
        <div className="paw-pet-modal-body">
          <h2 id="supply-status-title" className="text-lg font-extrabold text-[#1a0a3c]">{deactivating ? "Deactivate" : "Activate"} {supply.name}?</h2>
          <p id="supply-status-desc" className="mt-2 text-sm leading-6 text-gray-600">
            {deactivating
            ? `${supply.name} won't show in low stock alerts anymore. Its stock record is kept.`
            : `${supply.name} will be tracked for low stock alerts again.`}
          </p>
          {form.errors.is_active && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{form.errors.is_active}</p>}
        </div>
        <footer className="paw-pet-modal-footer">
          <button type="button" onClick={onClose} disabled={form.processing} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={confirm} disabled={form.processing} className={`rounded-lg px-5 py-2 text-sm font-bold text-white disabled:opacity-60 ${deactivating ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
            {form.processing ? "Saving…" : deactivating ? "Deactivate" : "Activate"}
          </button>
        </footer>
      </section>
    </div>);
}
