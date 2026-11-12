export function CalendarIcon({ className = "w-10 h-10", color = "#5b21b6", }) {
    return (<svg viewBox="0 0 48 48" fill="none" className={className}>
      <rect x="6" y="10" width="36" height="32" rx="4" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M6 18h36" stroke={color} strokeWidth="2.5"/>
      <path d="M16 6v8M32 6v8" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="13" y="24" width="6" height="5" rx="1" stroke={color} strokeWidth="2"/>
    </svg>);
}
export function BellIcon() {
    return (<svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M24 6a14 14 0 00-14 14v8l-4 6h36l-4-6v-8A14 14 0 0024 6z" stroke="#5b21b6" strokeWidth="2.5" fill="none"/>
      <path d="M20 38a4 4 0 008 0" stroke="#5b21b6" strokeWidth="2.5"/>
    </svg>);
}
export function ShieldCheckIcon() {
    return (<svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M24 6L8 12v14c0 9 7 16 16 18 9-2 16-9 16-18V12L24 6z" stroke="#e87c1e" strokeWidth="2.5" fill="none"/>
      <path d="M17 24l5 5 9-9" stroke="#e87c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
}
export function PersonIcon({ className = "w-10 h-10", color = "#5b21b6", }) {
    return (<svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="16" r="8" stroke={color} strokeWidth="2.5"/>
      <path d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>);
}
export function CardIcon() {
    return (<svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <rect x="6" y="12" width="36" height="24" rx="3" stroke="#e87c1e" strokeWidth="2.5" fill="none"/>
      <path d="M6 20h36" stroke="#e87c1e" strokeWidth="2.5"/>
      <rect x="12" y="28" width="10" height="3" rx="1" fill="#e87c1e"/>
    </svg>);
}
export function HeartIcon() {
    return (<svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
      <path d="M24 38s-16-10-16-22a10 10 0 0116-8 10 10 0 0116 8c0 12-16 22-16 22z" stroke="#5b21b6" strokeWidth="2.5" fill="none"/>
    </svg>);
}
export function DashedArrow() {
    return (<div className="flex items-center mx-2">
      <svg width="80" height="20" viewBox="0 0 80 20">
        <line x1="0" y1="10" x2="68" y2="10" stroke="#999" strokeWidth="1.5" strokeDasharray="6 4"/>
        <path d="M68 5l10 5-10 5" fill="none" stroke="#999" strokeWidth="1.5"/>
      </svg>
    </div>);
}
