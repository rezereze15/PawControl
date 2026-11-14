import { useEffect, useRef } from 'react';

function PawPrint({ className }) {
    return (<svg className={className} viewBox="0 0 64 64" fill="currentColor">
      <ellipse cx="14" cy="26" rx="6" ry="8" transform="rotate(-20 14 26)"/>
      <ellipse cx="25" cy="14" rx="6" ry="8.5" transform="rotate(-6 25 14)"/>
      <ellipse cx="39" cy="14" rx="6" ry="8.5" transform="rotate(6 39 14)"/>
      <ellipse cx="50" cy="26" rx="6" ry="8" transform="rotate(20 50 26)"/>
      <path d="M32 30c-9 0-17 9-17 17 0 6 5 9 10 8 3-.5 4.5-2 7-2s4 1.5 7 2c5 1 10-2 10-8 0-8-8-17-17-17z"/>
    </svg>);
}

// Navy prints are very faint; gold ones slightly stronger. Positions tuned for the landing hero
// and the auth card (prints near the centre are hidden behind the card there).
const PRINTS = [
    'top-[9%] left-[3%] w-[72px] -rotate-[18deg] text-[#19043f] opacity-5 max-[640px]:w-11',
    'top-[46%] left-[41%] w-[46px] rotate-[14deg] text-[#19043f] opacity-4 max-[900px]:hidden',
    'top-[7%] left-[47%] w-[38px] rotate-[28deg] text-[#f28b37] opacity-12 max-[900px]:hidden',
    'top-[63%] left-[6%] w-[54px] rotate-[22deg] text-[#f28b37] opacity-10',
    'top-[4%] right-[4%] w-[60px] -rotate-[24deg] text-[#19043f] opacity-5 max-[640px]:w-11',
    'right-[9%] bottom-[6%] w-[84px] rotate-[12deg] text-[#19043f] opacity-4 max-[640px]:w-11',
];

const DRIFT = [{ transform: 'translate3d(0, 0, 0)' }, { transform: 'translate3d(40px, 28px, 0)' }];
const EASE_IN_OUT = 'cubic-bezier(0.77, 0, 0.175, 1)';

/**
 * Decorative background: violet + gold glows, faded dot grid, scattered paw prints.
 * Place inside a `relative` + `overflow-clip` parent, before the content.
 */
export default function PawBackdrop() {
    const violet = useRef(null);
    const gold = useRef(null);

    // Very slow ambient drift of the two glows (transform only, so it stays on the GPU).
    // Skipped entirely when the user prefers reduced motion.
    useEffect(() => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
        const animations = [
            violet.current?.animate(DRIFT, { duration: 22000, easing: EASE_IN_OUT, iterations: Infinity, direction: 'alternate' }),
            gold.current?.animate(DRIFT, { duration: 26000, easing: EASE_IN_OUT, iterations: Infinity, direction: 'alternate-reverse' }),
        ];
        return () => animations.forEach((animation) => animation?.cancel());
    }, []);

    return (<div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div ref={violet} className="absolute -top-[260px] -left-[220px] size-[760px] rounded-full bg-[radial-gradient(closest-side,rgb(69_25_154/0.14),rgb(69_25_154/0.05)_55%,transparent)] will-change-transform max-[900px]:size-[520px]"/>
      <div ref={gold} className="absolute top-[4%] -right-[180px] size-[900px] rounded-full bg-[radial-gradient(closest-side,rgb(255_187_80/0.30),rgb(242_139_55/0.10)_50%,transparent)] will-change-transform max-[900px]:top-[30%] max-[900px]:-right-[240px] max-[900px]:size-[600px]"/>
      <div className="absolute inset-0 bg-[radial-gradient(rgb(25_4_63/0.16)_1.2px,transparent_1.4px)] bg-size-[28px_28px] opacity-55 [mask-image:radial-gradient(ellipse_70%_55%_at_30%_30%,#000_0%,transparent_75%)] max-[640px]:[mask-image:radial-gradient(ellipse_90%_40%_at_50%_20%,#000_0%,transparent_75%)]"/>
      {PRINTS.map((classes) => <PawPrint key={classes} className={`absolute ${classes}`}/>)}
    </div>);
}
