/**
 * Tailwind class strings shared by the auth pages (Login, Register, VerifyCode,
 * ForgotPassword, ResetPassword) and the dashboard's "complete your profile" modal.
 *
 * Palette: navy #19043f · navy hover #2a0c63 · violet #45199a · gold #ffbb50
 *          ink #151b2a · muted #5d6475 · line #dcd8e8 · danger #c53030 · link #526eff
 * Easing:  cubic-bezier(0.23,1,0.32,1) (strong ease-out)
 *
 * Keep every class written out in full so Tailwind can find it.
 */

export const cx = (...classes) => classes.filter(Boolean).join(' ');

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffbb50]';
const linkUnderline = 'underline decoration-transparent underline-offset-[3px] transition-[text-decoration-color,color] duration-150';

/** Text input. Border colour depends on error state (kept in JS so it never fights :focus). */
export function inputClass(invalid = false, extra = '') {
    return cx(
        'box-border h-[50px] w-full rounded-[14px] border-[1.5px] bg-white px-4 text-base text-[#151b2a] outline-none',
        'transition-[border-color,box-shadow] duration-150 placeholder:text-[#9096a5]',
        invalid
            ? 'border-[#c53030] focus:shadow-[0_0_0_4px_rgb(197_48_48/0.12)]'
            : 'border-[#dcd8e8] hover:not-focus:border-[#bdb6d3] focus:border-[#45199a] focus:shadow-[0_0_0_4px_rgb(69_25_154/0.12)]',
        extra,
    );
}

/** One of the six code boxes. */
export function codeBoxClass({ invalid = false, filled = false } = {}) {
    return cx(
        'box-border aspect-[5/6] min-h-[52px] w-full rounded-[14px] border-[1.5px] p-0 text-center text-[26px] font-bold tabular-nums',
        'text-[#19043f] caret-[#45199a] outline-none transition-[border-color,box-shadow,background-color] duration-150',
        'max-[400px]:rounded-xl max-[400px]:text-[22px]',
        invalid
            ? 'border-[#c53030] bg-white'
            : cx(filled ? 'border-[#19043f] bg-[#faf9fd]' : 'border-[#dcd8e8] bg-white', 'focus:border-[#45199a] focus:shadow-[0_0_0_4px_rgb(69_25_154/0.12)]'),
    );
}

export const ui = {
    // Page shell
    main: 'relative isolate box-border flex min-h-[calc(100vh-90px)] items-center justify-center overflow-clip bg-[linear-gradient(180deg,#fbfaff_0%,#fdfcff_55%,#fff_100%)] px-[clamp(16px,4vw,48px)] py-[clamp(28px,5vw,64px)] text-[#151b2a]',
    card: 'relative z-[1] grid min-h-[600px] overflow-hidden rounded-[28px] border border-[rgb(25_4_63/0.08)] bg-white shadow-[0_1px_2px_rgb(25_4_63/0.06),0_24px_60px_-12px_rgb(25_4_63/0.22)] transition-[opacity,translate,scale] duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] starting:translate-y-3 starting:scale-[0.99] starting:opacity-0 motion-reduce:starting:translate-y-0 motion-reduce:starting:scale-100 max-[860px]:min-h-0 max-[860px]:grid-cols-1 max-[480px]:rounded-[22px]',
    cardNormal: 'w-[min(100%,1060px)] grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] max-[860px]:w-[min(100%,560px)]',
    cardWide: 'w-[min(100%,1180px)] grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] max-[860px]:w-[min(100%,620px)]',

    // Photo side
    visual: 'relative isolate min-h-full bg-[#19043f] max-[860px]:h-[200px] max-[480px]:h-[160px]',
    visualImg: 'absolute inset-0 -z-20 size-full object-cover',
    visualOverlay: 'absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(25_4_63/0.10)_0%,rgb(25_4_63/0.05)_40%,rgb(25_4_63/0.88)_100%)]',
    visualContent: 'box-border flex h-full flex-col justify-between px-8 pt-7 pb-[34px] max-[860px]:px-[22px] max-[860px]:pt-[18px] max-[860px]:pb-5',
    badge: 'size-[76px] rounded-full bg-white/92 object-contain p-1.5 shadow-[0_6px_18px_rgb(25_4_63/0.25)] max-[860px]:size-14',
    visualCopy: 'max-w-[380px] border-l-[3px] border-[#ffbb50] pl-4',
    eyebrow: 'mb-2 text-[13px] font-bold tracking-[0.08em] text-[#ffbb50] uppercase max-[480px]:hidden',
    visualTitle: 'm-0 text-[clamp(22px,2.2vw,28px)] leading-[1.25] font-bold text-balance text-white max-[860px]:text-xl max-[480px]:text-lg',

    // Form side
    panel: 'flex flex-col justify-center px-[clamp(24px,5vw,64px)] py-[clamp(32px,5vw,64px)] max-[480px]:px-5 max-[480px]:pt-[26px] max-[480px]:pb-7',
    panelHead: 'mb-7 max-[480px]:mb-[22px]',
    kicker: 'mb-2.5 inline-flex items-center gap-2 text-sm font-bold text-[#45199a] before:h-[3px] before:w-[18px] before:rounded-[3px] before:bg-[#ffbb50]',
    title: 'mb-2 text-[clamp(28px,2.6vw,36px)] leading-[1.15] font-extrabold tracking-[-0.02em] text-[#151b2a]',
    subtitle: 'm-0 text-base leading-normal text-[#5d6475]',

    // Forms
    form: 'flex flex-col gap-[18px]',
    formTight: 'flex flex-col gap-4',
    field: 'flex min-w-0 flex-col gap-2',
    labelRow: 'flex items-baseline justify-between gap-3',
    label: 'text-[15px] font-semibold text-[#151b2a]',
    required: 'ml-0.5 text-[#c53030]',
    optional: 'ml-1.5 text-xs font-medium text-[#8a8f9c]',
    fieldError: 'm-0 text-[13px] leading-[1.4] text-[#c53030]',
    grid2: 'grid grid-cols-2 gap-3.5 max-[560px]:grid-cols-1',
    grid3: 'grid grid-cols-3 gap-3.5 max-[1040px]:grid-cols-2 max-[1040px]:[&>:last-child]:col-span-full max-[560px]:grid-cols-1',
    passwordWrap: 'relative',
    passwordInputPad: 'pr-[76px]',
    toggle: 'absolute top-1/2 right-2 h-[34px] -translate-y-1/2 cursor-pointer rounded-[10px] border-0 bg-transparent px-3 text-sm font-semibold text-[#45199a] transition-colors duration-150 hover:bg-[rgb(69_25_154/0.08)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#ffbb50]',

    // Messages
    error: 'm-0 flex items-start gap-2.5 rounded-xl border border-[rgb(197_48_48/0.25)] bg-[#fff5f5] px-3.5 py-3 text-sm leading-[1.45] text-[#9b2c2c] transition-[opacity,translate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] starting:-translate-y-1 starting:opacity-0 motion-reduce:starting:translate-y-0',
    errorIcon: 'mt-px size-[18px] flex-none',
    success: 'm-0 rounded-xl border border-[rgb(31_107_58/0.2)] bg-[#effaf3] px-3.5 py-3 text-sm leading-[1.45] text-[#1f6b3a] transition-opacity duration-200 starting:opacity-0',

    // Buttons
    submit: 'mt-1 inline-flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-0 bg-[#19043f] text-base font-bold tracking-[0.01em] text-white shadow-[inset_0_-3px_0_#ffbb50,0_8px_20px_-8px_rgb(25_4_63/0.55)] transition-[background-color,scale,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:enabled:bg-[#2a0c63] active:enabled:scale-[0.97] motion-reduce:active:enabled:scale-100 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#ffbb50] disabled:cursor-progress disabled:opacity-85 aria-[busy=false]:disabled:cursor-not-allowed aria-[busy=false]:disabled:opacity-45 aria-[busy=false]:disabled:shadow-[inset_0_-3px_0_#ffbb50]',
    spinner: 'size-4 animate-spin rounded-full border-2 border-white/35 border-t-[#ffbb50] [animation-duration:600ms] motion-reduce:[animation-duration:1.2s]',
    divider: 'flex items-center gap-3 text-[13px] tracking-[0.08em] text-[#8a8f9c] uppercase before:h-px before:flex-1 before:bg-[#dcd8e8] after:h-px after:flex-1 after:bg-[#dcd8e8]',
    google: 'box-border inline-flex h-[50px] w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-[#dcd8e8] bg-white text-[15px] font-semibold text-[#151b2a] no-underline transition-[border-color,background-color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[#bdb6d3] hover:bg-[#faf9fd] active:scale-[0.97] motion-reduce:active:scale-100 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#ffbb50]',
    googleIcon: 'size-5 flex-none',

    // Links
    footnote: 'mt-1.5 text-center text-[15px] leading-normal text-[#5d6475]',
    link: cx('font-semibold text-[#526eff] hover:decoration-current focus-visible:rounded', linkUnderline, focusRing),
    forgot: cx('text-sm font-medium text-[#526eff] hover:decoration-current focus-visible:rounded', linkUnderline, focusRing),
    linkButton: cx('cursor-pointer border-0 bg-transparent p-0 font-semibold text-[#526eff] hover:enabled:decoration-current focus-visible:rounded disabled:cursor-not-allowed disabled:text-[#8a8f9c] disabled:tabular-nums', linkUnderline, focusRing),
    linkButtonMuted: cx('cursor-pointer border-0 bg-transparent p-0 text-[15px] font-medium text-[#5d6475] hover:decoration-current focus-visible:rounded', linkUnderline, focusRing),

    // Code step
    codeBoxes: 'grid max-w-[420px] grid-cols-6 gap-2.5 max-[400px]:gap-1.5',
    codeEmail: 'break-all text-[#19043f]',
    resend: 'text-center text-[15px] text-[#5d6475]',
    center: 'text-center',
};
