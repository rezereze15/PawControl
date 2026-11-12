export default function StaffDashboardLayout({ username, roleLabel, dashboardClassName, logoSrc, logoAlt, avatarSrc, avatarAlt, avatarClassName, navItems, section, onSectionChange, sidebarOpen, onToggleSidebar, onLogout, children }) {
    return (<div className={`paw-dashboard-shell paw-staff-dashboard ${dashboardClassName} ${sidebarOpen ? "" : "sidebar-collapsed"} flex h-screen bg-gray-100 overflow-hidden`}>
      {/* Sidebar */}
      <aside className="paw-dashboard-sidebar w-64 bg-[#1a0a3c] flex flex-col flex-shrink-0">
        <div className="flex items-center gap-3 px-4 h-16">
          <button className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
            </svg>
          </button>
          <img src={logoSrc} alt={logoAlt} className="h-9 object-contain"/>
        </div>
        <div className="h-1 bg-orange-400"/>
        <nav className="flex flex-col gap-1 mt-4 flex-1">
          {navItems.map((item) => (<button key={item.id} onClick={() => onSectionChange(item.id)} className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold text-left transition-colors ${section === item.id
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="paw-dashboard-header paw-staff-topbar bg-[#1a0a3c] h-16 flex items-center justify-end px-8 gap-4 flex-shrink-0">
          <button className="paw-customer-menu-button" aria-label="Toggle navigation" onClick={() => onToggleSidebar()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/></svg>
          </button>
          <img src={logoSrc} alt="PawControl" className="paw-customer-brand"/>
          <div className="relative">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round"/>
            </svg>
            <span className="absolute -top-1 -right-1 bg-orange-400 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={avatarClassName}>
              <img src={avatarSrc} alt={avatarAlt} className="w-full h-full object-cover"/>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-white font-bold text-sm">{username}</span>
              <span className="text-gray-400 text-xs">{roleLabel}</span>
            </div>
          </div>
        </header>
        <div className="h-1 bg-orange-400 flex-shrink-0"/>

        <main className="paw-dashboard-main flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>);
}
