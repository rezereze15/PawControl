import { Area, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CARD, compactPeso, peso } from "./salesFormat";

const SERIES = "#6250d6";
const AXIS_TICK = { fontSize: 11, fill: "#6b6480" };

function RevenueTooltip({ active, payload }) {
    const point = payload?.[0]?.payload;
    if (!active || !point || point.paid === null) return null;
    return (<div className="rounded-xl border border-[#e3ddf2] bg-white px-3 py-2 shadow-[0_6px_18px_rgba(26,10,60,0.12)]">
      <p className="text-[11px] text-gray-500">{point.label}</p>
      <p className="text-[15px] font-bold text-[#1a0a3c] tabular-nums">{peso(point.paid)}</p>
      <p className="text-[11px] text-gray-500">Paid</p>
    </div>);
}

/** Money received per day (week, month) or per month (year). The line stops at today. */
export default function RevenueChart({ report }) {
    const { series, period, totals } = report;
    const byMonth = period === "year";

    return (<section className={`${CARD} min-w-0`}>
      <h2 className="text-base font-bold text-[#1a0a3c]">Revenue over time</h2>
      <p className="mt-1 text-xs text-gray-500">Paid bills, counted on the day they were paid{byMonth ? ", per month" : ""}</p>

      {totals.revenue === 0 ? (<div className="mt-4 flex h-56 items-center justify-center rounded-xl bg-[#f7f5fc] px-4 text-center text-sm text-gray-500">
          No paid bills in this period yet. The chart fills in as the clerk marks bills as paid.
        </div>) : (<div className="mt-4 h-60" role="img" aria-label={`Revenue chart, ${report.rangeLabel}: ${peso(totals.revenue)} in total.`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="#efecf5"/>
              <XAxis dataKey="short" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: "#e3ddf2" }} interval={period === "month" ? 6 : 0} minTickGap={8}/>
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={compactPeso} width={56} allowDecimals={false}/>
              <Tooltip content={<RevenueTooltip/>} cursor={{ stroke: "#cfc8e6" }}/>
              <Area type="linear" dataKey="paid" stroke={SERIES} strokeWidth={2} fill={SERIES} fillOpacity={0.1} dot={false} activeDot={{ r: 5, fill: SERIES, stroke: "#ffffff", strokeWidth: 2 }} connectNulls={false} isAnimationActive={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </div>)}

      {totals.revenue > 0 && (<details className="mt-3 text-sm">
          <summary className="cursor-pointer text-xs font-semibold text-paw-blue">Show the numbers as a table</summary>
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-[#f0edf6]">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#f7f5fc] text-gray-500">
                <tr><th className="px-3 py-2 font-semibold">{byMonth ? "Month" : "Day"}</th><th className="px-3 py-2 text-right font-semibold">Paid</th></tr>
              </thead>
              <tbody>
                {series.filter((point) => point.paid !== null).map((point) => (<tr key={point.key} className="border-t border-[#f0edf6]">
                    <td className="px-3 py-1.5 text-gray-600">{point.label}</td>
                    <td className="px-3 py-1.5 text-right font-semibold text-[#1a0a3c] tabular-nums">{peso(point.paid)}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </details>)}
    </section>);
}
