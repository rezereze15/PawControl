export default function CustomerDashboardLayout({ username, onLogout, logoSrc, avatarSrc, navItems, section, booking, sidebarOpen, onNavigate, onToggleSidebar, children }) {
    return (<div className={`paw-dashboard-shell paw-customer-dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'} flex h-screen bg-gray-100 overflow-hidden`}>
      <header className="paw-customer-topbar">
        <button className="paw-customer-menu-button" aria-label="Toggle navigation" onClick={() => onToggleSidebar()}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
            </svg>
        </button>
        <img src={logoSrc} alt="PawControl" className="paw-customer-brand"/>
        <div className="paw-customer-userbar">
          <div className="relative paw-customer-bell">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
            </svg>
            <span>3</span>
          </div>
          <div className="paw-customer-avatar" aria-hidden="true">
            <img src={avatarSrc} alt=""/>
          </div>
          <span>{username}</span>
        </div>
      </header>
      <div className="paw-customer-workspace">
      <aside className="paw-dashboard-sidebar paw-customer-sidebar bg-[#1a0a3c] flex flex-col flex-shrink-0">
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (<button key={item.id} onClick={() => {
                onNavigate(item.id);
            }} className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold text-left transition-colors ${section === item.id && !booking
                ? "bg-orange-400 text-white"
                : "text-gray-300 hover:bg-white/10 hover:text-white"}`}>
              {item.icon}
              {item.label}
            </button>))}
        </nav>
        <button onClick={onLogout} className="flex items-center gap-3 px-5 py-4 text-white font-bold text-sm hover:bg-red-600 transition-colors border-t border-white/10">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round"/>
          </svg>
          LOGOUT
        </button>
      </aside>
      <div className="paw-customer-content flex-1 flex flex-col overflow-hidden">
        <main className="paw-dashboard-main paw-customer-main flex-1 overflow-y-auto">{children}</main>
      </div>
      </div>
    </div>);
}
