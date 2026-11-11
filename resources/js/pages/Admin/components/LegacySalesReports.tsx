interface LegacySalesReportsProps {
  ownerView?: boolean
}

const MOCK_SALES = [
  { month: "Jan", amount: 38200 },
  { month: "Feb", amount: 45600 },
  { month: "Mar", amount: 52100 },
  { month: "Apr", amount: 48750 },
  { month: "May", amount: 61400 },
  { month: "Jun", amount: 57300 },
]

function LegacySalesReports({ ownerView = false }: LegacySalesReportsProps) {
  const max = Math.max(...MOCK_SALES.map((s) => s.amount))
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Sales Reports</h1>
        {ownerView && (
          <button
            type="button"
            className="min-h-10 whitespace-nowrap rounded-xl bg-[#19043f] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_10px_rgba(25,4,63,0.2)] transition-colors hover:bg-[#2d0a6e]"
          >
            Generate Sales Report
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            label: "Total Revenue",
            value: "₱412,850.00",
            sub: "+8.64% vs last week",
            color: "text-green-500",
          },
          {
            label: "This Month",
            value: "₱61,400.00",
            sub: "+7.2% vs last month",
            color: "text-green-500",
          },
          {
            label: "Transactions",
            value: "284",
            sub: "May 2026",
            color: "text-gray-400",
          },
        ].map((c) => (
          <div key={c.label} className={`relative overflow-hidden bg-white rounded-2xl p-6 ${ownerView ? 'border border-violet-100 shadow-[0_8px_24px_rgba(26,10,60,0.06)]' : 'shadow-sm'}`}>
            {ownerView && <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#3b0f8c] to-[#ffbb50]" />}
            <p className="text-sm text-gray-500 font-medium mb-2">{c.label}</p>
            <p className="text-3xl font-extrabold tracking-tight text-[#1a0a3c]">{c.value}</p>
            <p className={`text-xs font-semibold mt-2 ${c.color}`}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className={`bg-white rounded-2xl p-6 ${ownerView ? 'border border-violet-100 shadow-[0_8px_24px_rgba(26,10,60,0.06)]' : 'shadow-sm'}`}>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="font-bold text-lg text-[#1a0a3c]">Monthly Revenue</p>
            <p className="mt-1 text-xs text-gray-500">Revenue collected across the year</p>
          </div>
          {ownerView && (
            <select
              aria-label="Revenue date range"
              defaultValue="This year"
              className="rounded-xl border border-violet-100 bg-violet-50/60 px-3 py-2.5 text-sm font-semibold text-[#3b0f8c] focus:outline-none focus:ring-2 focus:ring-violet-200"
            >
              <option>This week</option>
              <option>This month</option>
              <option>This year</option>
            </select>
          )}
        </div>
        <div className={`flex items-end gap-4 h-64 rounded-xl px-4 pt-4 ${ownerView ? 'bg-slate-50/80' : ''}`}>
          {MOCK_SALES.map((s) => (
            <div
              key={s.month}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <span className="text-xs text-gray-500 font-medium">
                ₱{(s.amount / 1000).toFixed(0)}K
              </span>
              <div
                className={`w-full rounded-t-lg transition-colors ${ownerView ? 'bg-gradient-to-t from-[#3b0f8c] to-[#7044bd] hover:from-orange-400 hover:to-amber-300' : 'bg-[#3b0f8c] hover:bg-orange-400'} cursor-pointer`}
                style={{ height: `${(s.amount / max) * 160}px` }}
              />
              <span className="text-xs text-gray-500">{s.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className={`paw-recent-transactions bg-white rounded-2xl shadow-sm overflow-hidden ${ownerView ? 'owner-transactions' : ''}`}>
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-bold text-[#1a0a3c]">Recent Transactions</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              {["Date", "Patient", "Service", "Amount", "Status"].map((h) => (
                <th key={h} className="px-6 py-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              {
                date: "May 15, 2026",
                patient: "Lean (Aspin)",
                service: "Checkup",
                amount: "₱850",
                status: "Paid",
              },
              {
                date: "May 14, 2026",
                patient: "Sion (Poodle)",
                service: "Vaccination",
                amount: "₱1,200",
                status: "Paid",
              },
              {
                date: "May 14, 2026",
                patient: "Moy (Exotic Shorthair)",
                service: "Surgery",
                amount: "₱8,500",
                status: "Pending",
              },
              {
                date: "May 13, 2026",
                patient: "Bincent (Oriental SH)",
                service: "Checkup",
                amount: "₱850",
                status: "Paid",
              },
              {
                date: "May 13, 2026",
                patient: "John A. (Newfoundland)",
                service: "Vaccination",
                amount: "₱1,200",
                status: "Paid",
              },
            ].map((t, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500">{t.date}</td>
                <td className="px-6 py-4 font-semibold text-[#1a0a3c]">
                  {t.patient}
                </td>
                <td className="px-6 py-4 text-gray-600">{t.service}</td>
                <td className="px-6 py-4 font-bold text-[#1a0a3c]">
                  {t.amount}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      t.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LegacySalesReports
