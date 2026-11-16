import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Bell in the dashboard top bar: unread badge + dropdown list.
 *
 * `notifications`: [{ id, title, body, when?, tone?, section? }]. They are built from data the
 * dashboard already has (see shared/dashboard/notifications.js); there is no notifications
 * table yet. Which ones were read is remembered per user in this browser (localStorage), so a
 * notification stays read across reloads as long as its id doesn't change.
 *
 * The panel is rendered into <body> so the top bar's CSS (which styles every span/svg inside
 * the bell wrapper) and the layout's overflow can't clip or restyle it.
 */
const TONE_DOT = {
    info: "bg-paw-blue",
    success: "bg-green-500",
    warning: "bg-amber-400",
    danger: "bg-red-500",
};

function readStored(key) {
    try {
        const raw = window.localStorage.getItem(key);
        return new Set(raw ? JSON.parse(raw) : []);
    } catch {
        return new Set();
    }
}

function writeStored(key, ids) {
    try {
        window.localStorage.setItem(key, JSON.stringify([...ids]));
    } catch {
        // Private mode / blocked storage: read state just lasts until reload.
    }
}

export default function NotificationBell({ notifications = [], storageKey = "paw-notifications-read", onNavigate, className = "", badgeClassName = "" }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const [readIds, setReadIds] = useState(() => (typeof window === "undefined" ? new Set() : readStored(storageKey)));
    const buttonRef = useRef(null);
    const panelRef = useRef(null);

    const unread = useMemo(() => notifications.filter((n) => !readIds.has(n.id)), [notifications, readIds]);

    const markRead = useCallback((ids) => {
        setReadIds((current) => {
            const next = new Set(current);
            ids.forEach((id) => next.add(id));
            // Keep storage small: only ids that still exist.
            const live = new Set(notifications.map((n) => n.id));
            writeStored(storageKey, [...next].filter((id) => live.has(id)));
            return next;
        });
    }, [notifications, storageKey]);

    const place = useCallback(() => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) setPosition({ top: rect.bottom + 10, right: Math.max(8, window.innerWidth - rect.right - 8) });
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        place();
        const onPointer = (event) => {
            if (!buttonRef.current?.contains(event.target) && !panelRef.current?.contains(event.target)) setOpen(false);
        };
        const onKey = (event) => {
            if (event.key === "Escape") {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", onPointer);
        document.addEventListener("keydown", onKey);
        window.addEventListener("resize", place);
        return () => {
            document.removeEventListener("mousedown", onPointer);
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("resize", place);
        };
    }, [open, place]);

    const choose = (notification) => {
        markRead([notification.id]);
        if (notification.section && onNavigate) {
            onNavigate(notification.section);
            setOpen(false);
        }
    };

    const label = unread.length ? `Notifications, ${unread.length} unread` : "Notifications";

    return (<div className={className}>
      <button ref={buttonRef} type="button" onClick={() => setOpen((v) => !v)} aria-label={label} aria-haspopup="dialog" aria-expanded={open} className="relative block h-full w-full cursor-pointer rounded text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffbb50]">
        <svg className="h-full w-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
        </svg>
        {unread.length > 0 && (<span className={`absolute -top-1 -right-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-orange-400 px-0.5 text-[9px] font-bold leading-none text-white ${badgeClassName}`} aria-hidden="true">
            {unread.length > 9 ? "9+" : unread.length}
          </span>)}
      </button>

      {open && position && createPortal(<div ref={panelRef} role="dialog" aria-label="Notifications" style={{ top: position.top, right: position.right }} className="paw-pop fixed z-[60] flex max-h-[min(480px,calc(100vh-90px))] w-[min(360px,calc(100vw-16px))] flex-col overflow-hidden rounded-xl border border-gray-100 bg-white text-left shadow-xl [font-family:'Instrument_Sans','Segoe_UI',sans-serif]">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-bold text-[#1a0a3c]">
              Notifications
              {unread.length > 0 && <span className="ml-2 rounded-full bg-paw-blue-soft px-2 py-0.5 text-[11px] font-semibold text-paw-blue">{unread.length} new</span>}
            </p>
            {unread.length > 0 && (<button type="button" onClick={() => markRead(unread.map((n) => n.id))} className="cursor-pointer rounded-md px-2 py-1 text-xs font-semibold text-paw-blue hover:bg-paw-blue-soft">
                Mark all as read
              </button>)}
          </div>
          {notifications.length === 0 ? (<div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-[#1a0a3c]">You're all caught up</p>
              <p className="mt-1 text-xs text-gray-500">New updates will show up here.</p>
            </div>) : (<ul className="divide-y divide-gray-100 overflow-y-auto overscroll-contain">
              {notifications.map((n) => {
                const isUnread = !readIds.has(n.id);
                return (<li key={n.id}>
                    <button type="button" onClick={() => choose(n)} className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${isUnread ? "bg-paw-blue-soft/50" : ""}`}>
                      <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${isUnread ? TONE_DOT[n.tone] ?? TONE_DOT.info : "bg-gray-200"}`} aria-hidden="true"/>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm ${isUnread ? "font-bold text-[#1a0a3c]" : "font-medium text-gray-600"}`}>{n.title}</span>
                        {n.body && <span className="mt-0.5 block text-xs leading-snug text-gray-500">{n.body}</span>}
                        {n.when && <span className="mt-1 block text-[11px] text-gray-400">{n.when}</span>}
                      </span>
                      {isUnread && <span className="sr-only">(unread)</span>}
                    </button>
                  </li>);
            })}
            </ul>)}
        </div>, document.body)}
    </div>);
}
