/**
 * Smooth entrance when switching dashboard sections (Home, Appointments, Settings…).
 *
 * Applied to the dashboards' <main>: each section is a different component, so its root
 * mounts fresh on every switch and @starting-style (Tailwind `starting:`) animates it in:
 * a quick fade + 6px rise, 220ms strong ease-out. Short because sections are switched often.
 * Toasts are skipped (they have their own slide-in). Reduced motion: fade only.
 */
export const SECTION_ENTER = '[&>*:not(.paw-success-toast)]:transition-[opacity,translate] [&>*:not(.paw-success-toast)]:duration-[220ms] [&>*:not(.paw-success-toast)]:ease-[cubic-bezier(0.23,1,0.32,1)] [&>*:not(.paw-success-toast)]:starting:translate-y-1.5 [&>*:not(.paw-success-toast)]:starting:opacity-0 motion-reduce:[&>*:not(.paw-success-toast)]:starting:translate-y-0';
