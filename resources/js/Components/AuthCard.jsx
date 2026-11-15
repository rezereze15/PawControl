import { cx, ui } from '@/Components/authStyles';
import logoBadge from '../imports/BIGPAW_LOGO-removebg-preview.png';

/**
 * The split auth card: photo panel (badge + caption) on the left, heading + form on
 * the right. Used by AuthModal on the landing page for every auth view (login,
 * register, verify code, forgot / reset password).
 *
 * Pass `onClose` to show a ✕ button in the top-right corner, and `onBack` to show a
 * "← Back" button above the heading (modal step views).
 */
export default function AuthCard({ ref, image, imageAlt, eyebrow = 'Big Paws Animal Clinic', caption, kicker, heading, subtitle, wide = false, className = '', onClose, onBack, children }) {
    return (<section ref={ref} className={cx(ui.card, wide ? ui.cardWide : ui.cardNormal, className)} aria-labelledby="signin-title">
      {onClose && (<button type="button" onClick={onClose} aria-label="Close" className="absolute top-3.5 right-3.5 z-10 grid size-10 cursor-pointer place-items-center rounded-full border border-[rgb(25_4_63/0.08)] bg-white/90 text-[#19043f] shadow-[0_4px_12px_rgb(25_4_63/0.18)] backdrop-blur-[6px] transition-[background-color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white active:scale-[0.94] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#ffbb50] motion-reduce:active:scale-100">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>)}

      <aside className={ui.visual}>
        <img src={image} alt={imageAlt} className={ui.visualImg}/>
        <div className={ui.visualOverlay}/>
        <div className={ui.visualContent}>
          <img src={logoBadge} alt="Big Paws Animal Clinic" className={ui.badge}/>
          <div className={ui.visualCopy}>
            <p className={ui.eyebrow}>{eyebrow}</p>
            <p className={ui.visualTitle}>{caption}</p>
          </div>
        </div>
      </aside>

      <div className={ui.panel}>
        <header className={ui.panelHead}>
          {onBack
            ? (
              // Arrow-only Back button on its own row with the kicker, spaced apart.
              <div className="mb-2.5 flex items-center gap-3 [&>p]:mb-0">
                <button type="button" onClick={onBack} aria-label="Back" className="grid size-8 flex-none cursor-pointer place-items-center rounded-full border border-[#dcd8e8] bg-white text-[#5d6475] transition-[background-color,color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#f6f2ff] hover:text-[#45199a] active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffbb50] motion-reduce:active:scale-100">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M16 10H5m4.5-4.5L5 10l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <p className={ui.kicker}>{kicker}</p>
              </div>
            )
            : <p className={ui.kicker}>{kicker}</p>}
          <h1 id="signin-title" className={ui.title}>{heading}</h1>
          {subtitle && <p className={ui.subtitle}>{subtitle}</p>}
        </header>

        {children}
      </div>
    </section>);
}
