import { useEffect, useRef, useState } from "react";
import UserAvatar from "@/Components/UserAvatar";
import { SECTION_ENTER } from "./sectionEnter";

const PHONE_QUERY = "(max-width: 640px)";

/** True while the viewport matches `query` (updates on resize / rotation). */
function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
    useEffect(() => {
        const list = window.matchMedia(query);
        const onChange = () => setMatches(list.matches);
        onChange();
        list.addEventListener("change", onChange);
        return () => list.removeEventListener("change", onChange);
    }, [query]);
    return matches;
}

/**
 * Customer dashboard frame: top bar, sidebar, content.
 *
 * Tablet / desktop: the sidebar sits beside the content; ☰ collapses it to icons
 * (`sidebarOpen` / `onToggleSidebar`, owned by the page).
 * Phones (≤640px): the sidebar is hidden and ☰ opens it as a slide-in drawer over the
 * content, so pages get the full screen width. Tapping a link, the dimmed backdrop or
 * Esc closes it. Drawer styles live in Dashboard.css (.mobile-nav-open).
 *
 * avatarSrc is the signed-in user's own photo URL (or null). It never depends on the role.
 */
export default function CustomerDashboardLayout({ username, onLogout, logoSrc, avatarSrc, navItems, section, booking, sidebarOpen, onNavigate, onToggleSidebar, children }) {
    const isPhone = useMediaQuery(PHONE_QUERY);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerVisible = isPhone && drawerOpen;
    const sidebar = useRef(null);
    const menuButton = useRef(null);

    // Leaving phone width closes the drawer.
    useEffect(() => {
        if (!isPhone) setDrawerOpen(false);
    }, [isPhone]);

    // While the drawer is open: Esc closes it, the page behind doesn't scroll, focus moves in.
    useEffect(() => {
        if (!drawerVisible) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        sidebar.current?.querySelector("button")?.focus({ preventScroll: true });
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                setDrawerOpen(false);
                menuButton.current?.focus();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [drawerVisible]);

    const toggleMenu = () => (isPhone ? setDrawerOpen((open) => !open) : onToggleSidebar());
    const collapsed = !isPhone && !sidebarOpen;

    return (<div className={`paw-dashboard-shell paw-customer-dashboard ${collapsed ? "sidebar-collapsed" : ""} ${drawerVisible ? "mobile-nav-open" : ""} flex h-screen bg-gray-100 overflow-hidden`}>
      <header className="paw-customer-topbar">
        <button ref={menuButton} className="paw-customer-menu-button" aria-label={isPhone ? (drawerOpen ? "Close menu" : "Open menu") : "Toggle navigation"} aria-expanded={isPhone ? drawerOpen : sidebarOpen} aria-controls="customer-sidebar" onClick={toggleMenu}>
            {drawerVisible
            ? (<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/>
              </svg>)
            : (<svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
              </svg>)}
        </button>
        <img src={logoSrc} alt="PawControl" className="paw-customer-brand"/>
        <div className="paw-customer-userbar">
          <div className="relative paw-customer-bell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
            </svg>
            <span>3</span>
          </div>
          <div className="paw-customer-avatar overflow-hidden" aria-hidden="true">
            <UserAvatar photoUrl={avatarSrc} name={username} className="rounded-full"/>
          </div>
          <span className="paw-customer-username">{username}</span>
        </div>
      </header>
      <div className="paw-customer-workspace">
      {/* Phones only: dims the page behind the open drawer; tap to close. */}
      {isPhone && <div className="paw-customer-nav-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true"/>}
      <aside ref={sidebar} id="customer-sidebar" inert={isPhone && !drawerOpen} className="paw-dashboard-sidebar paw-customer-sidebar bg-[#1a0a3c] flex flex-col flex-shrink-0">
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (<button key={item.id} onClick={() => {
                onNavigate(item.id);
                setDrawerOpen(false);
            }} className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold text-left transition-colors ${section === item.id && !booking
                ? "bg-orange-400 text-white"
                : "text-gray-300 hover:bg-white/10 hover:text-white"}`}>
              {item.icon}
              <span className="paw-sidebar-label">{item.label}</span>
            </button>))}
        </nav>
        <button onClick={onLogout} className="flex items-center gap-3 px-5 py-4 text-white font-bold text-sm hover:bg-red-600 transition-colors border-t border-white/10">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round"/>
          </svg>
          <span className="paw-sidebar-label">LOGOUT</span>
        </button>
      </aside>
      <div className="paw-customer-content flex-1 flex flex-col overflow-hidden">
        <main className={`paw-dashboard-main paw-customer-main flex-1 overflow-y-auto ${SECTION_ENTER}`}>{children}</main>
      </div>
      </div>
    </div>);
}
