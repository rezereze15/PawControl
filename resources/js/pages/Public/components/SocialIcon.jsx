function SocialIcon({ type }) {
    const size = 36;
    if (type === "fb")
        return (<svg width={size} height={size} viewBox="0 0 36 36" fill="white"><circle cx="18" cy="18" r="18" fill="#1877F2"/><path d="M22 10h-2.5A3.5 3.5 0 0016 13.5V16h-2v4h2v10h4V20h3l.5-4H20v-2c0-.8.7-1.5 1.5-1.5H22V10z" fill="white"/></svg>);
    if (type === "ig")
        return (<svg width={size} height={size} viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="url(#igGrad)"/><rect x="10" y="10" width="16" height="16" rx="5" stroke="white" strokeWidth="2"/><circle cx="18" cy="18" r="4" stroke="white" strokeWidth="2"/><circle cx="23.5" cy="12.5" r="1.2" fill="white"/><defs><radialGradient id="igGrad" cx="30%" cy="100%" r="120%"><stop stopColor="#f9ed32"/><stop offset="40%" stopColor="#ee2a7b"/><stop offset="100%" stopColor="#002aff"/></radialGradient></defs></svg>);
    if (type === "x")
        return (<svg width={size} height={size} viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="black"/><text x="9" y="24" fontSize="16" fontWeight="bold" fill="white" fontFamily="Arial">𝕏</text></svg>);
    return (<svg width={size} height={size} viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#4C2F97"/><rect x="9" y="13" width="18" height="12" rx="2" stroke="white" strokeWidth="1.5"/><polyline points="9,13 18,21 27,13" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/></svg>);
}
export default SocialIcon;
