import { CARD, peso, percent } from "./salesFormat";

const ICON_PROPS = { width: 12, height: 12, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

/** "Up 14.4%" / "Down 6.8%" / "No change": the word and arrow carry the meaning, not only the colour. */
function ChangePill({ value }) {
    if (value === 0) {
        return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">No change</span>;
    }
    const up = value > 0;
    return (<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${up ? "bg-[#e6f5eb] text-[#0a6b2c]" : "bg-[#fdecea] text-[#b42318]"}`}>
      <svg {...ICON_PROPS} strokeWidth="3">{up ? <><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></> : <><path d="M12 5v14"/><path d="M5 12l7 7 7-7"/></>}</svg>
      {up ? "Up" : "Down"} {percent(value)}
    </span>);
}

function Card({ label, value, note, children }) {
    return (<div className={`${CARD} flex min-w-0 flex-col gap-1.5`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-500">{label}</p>
        {note && <span className="text-[11px] font-semibold text-gray-500">{note}</span>}
      </div>
      <p className="text-[28px] font-extrabold leading-tight tracking-tight text-[#1a0a3c] tabular-nums">{value}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">{children}</div>
    </div>);
}

/** The four numbers at the top: revenue, paid bills, average bill, unpaid balance. */
export default function KpiCards({ report }) {
    const { totals, change, unpaid, compareLabel } = report;
    const compared = (value) => value === null
        ? <span>No earlier bills to compare with</span>
        : <><ChangePill value={value}/><span>vs {compareLabel}</span></>;

    return (<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card label="Revenue" value={peso(totals.revenue)}>{compared(change.revenue)}</Card>
      <Card label="Paid bills" value={totals.bills.toLocaleString()}>{compared(change.bills)}</Card>
      <Card label="Average bill" value={totals.bills > 0 ? peso(totals.averageBill) : "—"}>{compared(change.averageBill)}</Card>
      <Card label="Unpaid balance" value={peso(unpaid.amount)} note="Right now">
        {unpaid.bills === 0 ? (<span className="font-semibold text-[#0a6b2c]">Every bill is paid</span>) : (<>
            {unpaid.olderThanWeek > 0 && (<span className="inline-flex items-center gap-1 rounded-full bg-[#fff4e0] px-2 py-0.5 font-bold text-[#8a4b00]">
                <svg {...ICON_PROPS} strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><path d="M12 17h.01"/></svg>
                Follow up
              </span>)}
            <span>
              {unpaid.bills} {unpaid.bills === 1 ? "bill" : "bills"}
              {unpaid.olderThanWeek > 0 && ` · ${unpaid.olderThanWeek} older than 7 days`}
            </span>
          </>)}
      </Card>
    </div>);
}
