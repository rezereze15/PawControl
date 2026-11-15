import { useEffect, useId, useRef, useState } from 'react';

export const SERVICES = [
    '24/7 Emergency response',
    'Advance Diagnosis',
    'Critical Care',
    'ICU',
    'Blood Transfusion',
    'Surgery & Intensive Monitoring',
];

// Small hover-intent delays: don't flash open when the mouse just passes over the
// header, and don't snap shut while the mouse travels down into the panel.
const OPEN_DELAY = 60;
const CLOSE_DELAY = 140;

/**
 * "Services" item in the landing page header with a dropdown list of services.
 * Opens on hover (mouse), on click/tap (touch), and from the keyboard
 * (Enter / Space / ArrowDown); Escape or tabbing away closes it.
 */
export default function ServicesMenu() {
    const [open, setOpen] = useState(false);
    const timer = useRef(null);
    const root = useRef(null);
    const trigger = useRef(null);
    const panelId = useId();

    const schedule = (next, delay) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setOpen(next), delay);
    };

    useEffect(() => () => clearTimeout(timer.current), []);

    // Close when clicking/tapping anywhere else.
    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event) => {
            if (!root.current?.contains(event.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    function focusItem(index) {
        const links = root.current?.querySelectorAll('[data-service-link]');
        links?.[Math.max(0, Math.min(links.length - 1, index))]?.focus();
    }

    function onTriggerKeyDown(event) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            clearTimeout(timer.current);
            setOpen(true);
            requestAnimationFrame(() => focusItem(0));
        }
    }

    function onPanelKeyDown(event) {
        const links = [...(root.current?.querySelectorAll('[data-service-link]') ?? [])];
        const index = links.indexOf(document.activeElement);
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            focusItem(index + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (index <= 0) trigger.current?.focus();
            else focusItem(index - 1);
        }
    }

    function onKeyDown(event) {
        if (event.key === 'Escape' && open) {
            event.preventDefault();
            setOpen(false);
            trigger.current?.focus();
        }
    }

    function onBlur(event) {
        // Close once focus has left the whole menu (e.g. Tab past the last item).
        if (!root.current?.contains(event.relatedTarget)) setOpen(false);
    }

    // Hover only for real mouse pointers; touch uses the click toggle instead.
    const onPointerEnter = (event) => {
        if (event.pointerType === 'mouse') schedule(true, OPEN_DELAY);
    };
    const onPointerLeave = (event) => {
        if (event.pointerType === 'mouse') schedule(false, CLOSE_DELAY);
    };

    // `group` + data-open drive the open styles below (group-data-[open=true]:…).
    return (<li ref={root} className="group relative" data-open={open} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onKeyDown={onKeyDown} onBlur={onBlur}>
      {/* Looks like the other header links, plus a chevron that flips while open. */}
      <button ref={trigger} type="button" className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 [font-family:var(--font-plus-jakarta-sans),system-ui,sans-serif] text-[25px] font-medium tracking-[-0.01em] text-white transition-colors duration-150 group-data-[open=true]:text-[#F5A623] hover:text-[#F5A623] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffbb50] max-[900px]:text-[17px]" aria-expanded={open} aria-controls={panelId} onClick={() => {
            clearTimeout(timer.current);
            setOpen((value) => !value);
        }} onKeyDown={onTriggerKeyDown}>
        Services
        <svg className="transition-[rotate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-data-[open=true]:rotate-180 motion-reduce:transition-none" width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/*
        Panel drops from just under the trigger (origin-top). Closed: faded, nudged up 4px,
        97% size; exit (120ms) is a little faster than the entrance (180ms).
        ::before is an invisible bridge over the gap so moving the mouse down doesn't
        close it; ::after is the little pointer towards "Services".
      */}
      <div id={panelId} onKeyDown={onPanelKeyDown} className="invisible pointer-events-none absolute top-[calc(100%+26px)] left-1/2 min-w-[300px] origin-top -translate-x-1/2 -translate-y-1 scale-[0.97] rounded-[18px] border border-[rgb(25_4_63/0.08)] bg-white p-2.5 opacity-0 shadow-[0_1px_2px_rgb(25_4_63/0.06),0_22px_48px_-14px_rgb(25_4_63/0.35)] [transition:opacity_120ms_cubic-bezier(0.23,1,0.32,1),translate_120ms_cubic-bezier(0.23,1,0.32,1),scale_120ms_cubic-bezier(0.23,1,0.32,1),visibility_0s_linear_120ms] group-data-[open=true]:pointer-events-auto group-data-[open=true]:visible group-data-[open=true]:translate-y-0 group-data-[open=true]:scale-100 group-data-[open=true]:opacity-100 group-data-[open=true]:[transition:opacity_180ms_cubic-bezier(0.23,1,0.32,1),translate_180ms_cubic-bezier(0.23,1,0.32,1),scale_180ms_cubic-bezier(0.23,1,0.32,1),visibility_0s] motion-reduce:translate-y-0 motion-reduce:scale-100 before:absolute before:inset-x-0 before:-top-7 before:bottom-full after:absolute after:-top-1.5 after:left-1/2 after:size-3 after:-translate-x-1/2 after:rotate-45 after:rounded-tl-[3px] after:border-t after:border-l after:border-[rgb(25_4_63/0.08)] after:bg-white max-[900px]:top-[calc(100%+24px)]">
        <p className="mx-3 mt-1 mb-1.5 text-[12px] font-bold tracking-[0.08em] text-[#8a8f9c] uppercase">Our services</p>
        <ul className="m-0 list-none p-0">
          {SERVICES.map((service) => (<li key={service}>
              <a href="#" className="flex items-center gap-3 rounded-xl px-3 py-[11px] [font-family:var(--font-plus-jakarta-sans),system-ui,sans-serif] text-[15px] leading-[1.3] font-semibold whitespace-nowrap text-[#19043f] no-underline transition-colors duration-150 hover:bg-[#f6f2ff] hover:text-[#45199a] focus-visible:bg-[#f6f2ff] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#ffbb50]" data-service-link tabIndex={open ? 0 : -1}>
                <span className="size-2 flex-none rounded-full bg-[#ffbb50] shadow-[0_0_0_3px_rgb(255_187_80/0.25)]" aria-hidden="true"/>
                {service}
              </a>
            </li>))}
        </ul>
      </div>
    </li>);
}
