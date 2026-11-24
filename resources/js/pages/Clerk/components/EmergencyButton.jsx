/** Opens the Emergency Walk-In form. Rendered on the clerk dashboard only. */
export default function EmergencyButton({ onClick }) {
    return (<button type="button" onClick={onClick} className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
      Emergency
    </button>);
}
