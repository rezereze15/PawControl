/** Page numbers with gaps, e.g. [1, 2, 3, "…", 24]. */
function pageList(page, pageCount) {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
    const pages = new Set([1, pageCount, page - 1, page, page + 1]);
    if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p));
    if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p));
    const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
    return sorted.flatMap((p, index) => (index > 0 && p - sorted[index - 1] > 1 ? ['…', p] : [p]));
}

/** Slice `items` for one page; the page is clamped so shrinking results never leave an empty page. */
export function paginate(items, page, pageSize) {
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(Math.max(1, page), pageCount);
    const start = (currentPage - 1) * pageSize;
    return { currentPage, pageCount, rows: items.slice(start, start + pageSize) };
}

const NAV_BUTTON = 'rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent';

/**
 * Footer of every list card: "Showing 1 to 10 of 42 entries" + Previous / page numbers / Next.
 * Sits inside the card, under the table (styles: .paw-list-pagination in Dashboard.css).
 */
export default function TablePagination({ page, pageCount, pageSize, total, onPageChange, label = 'entries' }) {
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    return (<div className="paw-list-pagination flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
      <p className="text-sm text-gray-500">
        {total === 0 ? `No ${label}` : `Showing ${from} to ${to} of ${total} ${label}`}
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button type="button" className={NAV_BUTTON} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>&lt; Previous</button>
        {pageList(page, pageCount).map((p, index) => (p === '…'
            ? <span key={`gap-${index}`} className="px-1 text-xs text-gray-400">…</span>
            : (<button key={p} type="button" onClick={() => onPageChange(p)} aria-current={p === page ? 'page' : undefined} className={`h-8 min-w-8 rounded-lg px-1! text-xs font-semibold ${p === page
                    ? 'bg-paw-blue text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                {p}
              </button>)))}
        <button type="button" className={NAV_BUTTON} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Next &gt;</button>
      </nav>
    </div>);
}
