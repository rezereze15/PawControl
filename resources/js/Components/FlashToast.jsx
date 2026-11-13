import { useEffect, useState } from "react";

/** Auto-dismissing success/error toast. Re-shows whenever `message` changes. */
export default function FlashToast({ message, tone = "success", title }) {
    const [dismissed, setDismissed] = useState(false);
    const isError = tone === "error";

    useEffect(() => {
        setDismissed(false);
        if (!message) return undefined;
        const timeout = window.setTimeout(() => setDismissed(true), 6000);
        return () => window.clearTimeout(timeout);
    }, [message]);

    if (!message || dismissed) return null;

    return (<div className={`paw-success-toast fixed left-4 right-4 top-4 z-[70] flex items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 shadow-xl sm:left-auto sm:right-6 sm:top-6 sm:w-[min(24rem,calc(100vw-3rem))] ${isError ? "border-red-200 shadow-red-950/10" : "border-emerald-200 shadow-emerald-950/10"}`} role={isError ? "alert" : "status"} aria-live="polite">
      <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isError ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
        {isError
            ? <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 8v5M12 16.5v.5" strokeLinecap="round"/></svg>
            : <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block text-sm font-bold text-slate-900">{title ?? (isError ? "Something went wrong" : "Success")}</span>
        <span className="mt-0.5 block text-sm leading-5 text-slate-600">{message}</span>
      </span>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss message" className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
      </button>
      <span className={`paw-toast-progress absolute inset-x-0 bottom-0 h-1 origin-left ${isError ? "bg-red-500" : "bg-emerald-500"}`} aria-hidden="true"/>
    </div>);
}
