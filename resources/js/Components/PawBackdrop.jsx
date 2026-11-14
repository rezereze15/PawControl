import '../../css/PawBackdrop.css';

function PawPrint({ className }) {
    return (<svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <ellipse cx="14" cy="26" rx="6" ry="8" transform="rotate(-20 14 26)"/>
      <ellipse cx="25" cy="14" rx="6" ry="8.5" transform="rotate(-6 25 14)"/>
      <ellipse cx="39" cy="14" rx="6" ry="8.5" transform="rotate(6 39 14)"/>
      <ellipse cx="50" cy="26" rx="6" ry="8" transform="rotate(20 50 26)"/>
      <path d="M32 30c-9 0-17 9-17 17 0 6 5 9 10 8 3-.5 4.5-2 7-2s4 1.5 7 2c5 1 10-2 10-8 0-8-8-17-17-17z"/>
    </svg>);
}

/**
 * Decorative background: violet + gold glows, faded dot grid, scattered paw prints.
 * Place inside a `position: relative; overflow: clip` parent, before the content.
 */
export default function PawBackdrop() {
    return (<div className="paw-backdrop" aria-hidden="true">
      <div className="paw-glow paw-glow--violet"/>
      <div className="paw-glow paw-glow--gold"/>
      <div className="paw-dots"/>
      {[1, 2, 3, 4, 5, 6].map((n) => <PawPrint key={n} className={`paw-print paw-print--${n}`}/>)}
    </div>);
}
