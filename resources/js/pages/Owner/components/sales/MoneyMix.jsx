import { CARD, peso, share } from "./salesFormat";

const PARTS = [
    { key: "services", label: "Services", color: "#6250d6" },
    { key: "supplies", label: "Supplies", color: "#eb6834" },
    { key: "others", label: "Others (added by the clerk)", color: "#1baf7a" },
];

/** Where the money came from: services, supplies and other lines of the paid bills. */
export default function MoneyMix({ report }) {
    const { mix, totals } = report;
    const parts = PARTS.filter((part) => mix[part.key] > 0);

    return (<section className={`${CARD} flex min-w-0 flex-col gap-4`}>
      <div>
        <h2 className="text-base font-bold text-[#1a0a3c]">Where the money came from</h2>
        <p className="mt-1 text-xs text-gray-500">Lines on the paid bills in this period</p>
      </div>

      {mix.billed === 0 ? (<p className="rounded-xl bg-[#f7f5fc] px-4 py-6 text-center text-sm text-gray-500">Nothing paid in this period yet.</p>) : (<>
          {/* One bar split by amount; the 2px gaps keep neighbouring colours apart. */}
          <div className="flex h-3.5 gap-0.5 overflow-hidden rounded" aria-hidden="true">
            {parts.map((part) => (<div key={part.key} className="min-w-1" style={{ flex: `${mix[part.key]} 1 0`, background: part.color }}/>))}
          </div>

          <ul className="flex flex-col gap-2.5 text-sm">
            {PARTS.map((part) => (<li key={part.key} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: part.color }} aria-hidden="true"/>
                <span className="min-w-0 flex-1 text-gray-700">{part.label}</span>
                <span className="font-bold text-[#1a0a3c] tabular-nums">{peso(mix[part.key])}</span>
                <span className="w-10 text-right text-gray-500 tabular-nums">{share(mix[part.key], mix.billed)}%</span>
              </li>))}
          </ul>

          <dl className="flex flex-col gap-1.5 border-t border-[#efecf5] pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Billed</dt><dd className="tabular-nums">{peso(mix.billed)}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Discounts given</dt><dd className="tabular-nums">−{peso(mix.discounts)}</dd></div>
            <div className="flex justify-between font-bold text-[#1a0a3c]"><dt>Collected</dt><dd className="tabular-nums">{peso(totals.revenue)}</dd></div>
          </dl>
        </>)}
    </section>);
}
