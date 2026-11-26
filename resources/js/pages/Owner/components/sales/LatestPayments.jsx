import { CARD, peso } from "./salesFormat";

/** The most recent bills the clerk marked as paid (whatever period is chosen). */
export default function LatestPayments({ payments }) {
    return (<section className={`${CARD} min-w-0`}>
      <h2 className="text-base font-bold text-[#1a0a3c]">Latest payments</h2>
      <p className="mt-1 text-xs text-gray-500">The last {payments.length || 5} bills marked as paid</p>

      {payments.length === 0 ? (<p className="mt-4 rounded-xl bg-[#f7f5fc] px-4 py-6 text-center text-sm text-gray-500">No payments yet.</p>) : (<div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-gray-500">
              <tr>
                <th className="py-2 pr-3 font-semibold">Paid on</th>
                <th className="py-2 pr-3 font-semibold">Pet</th>
                <th className="py-2 pr-3 font-semibold">Service</th>
                <th className="py-2 pr-3 font-semibold">Receipt</th>
                <th className="py-2 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (<tr key={payment.id} className="border-t border-[#f0edf6]">
                  <td className="py-2.5 pr-3 whitespace-nowrap text-gray-600">{payment.paidOn}</td>
                  <td className="py-2.5 pr-3">
                    <span className="font-semibold text-[#1a0a3c]">{payment.pet}</span>
                    {payment.breed && <span className="text-gray-500"> · {payment.breed}</span>}
                  </td>
                  <td className="py-2.5 pr-3 text-gray-600">{payment.service}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-gray-500">{payment.receiptNo}</td>
                  <td className="py-2.5 text-right font-bold text-[#1a0a3c] tabular-nums">{peso(payment.amount)}</td>
                </tr>))}
            </tbody>
          </table>
        </div>)}
    </section>);
}
