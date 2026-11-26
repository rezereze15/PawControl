import { useState } from "react";
import { router } from "@inertiajs/react";
import KpiCards from "../components/sales/KpiCards";
import RevenueChart from "../components/sales/RevenueChart";
import MoneyMix from "../components/sales/MoneyMix";
import LatestPayments from "../components/sales/LatestPayments";
import { CARD } from "../components/sales/salesFormat";

const PERIODS = [
    { id: "week", label: "This week" },
    { id: "month", label: "This month" },
    { id: "year", label: "This year" },
];

// `step`: the Sales Reports build step that fills the tab in.
const TABS = [
    { id: "overview", label: "Overview" },
    { id: "services", label: "Services & supplies", step: 2 },
    { id: "forecasts", label: "Forecasts", step: 3 },
    { id: "insights", label: "Clinic insights", step: 4 },
];

/**
 * Clinic owner: Sales Reports, built from the real bills (DashboardController →
 * App\Support\SalesReport). Switching the period asks the server for only the new
 * salesReport prop (an Inertia partial reload); the rest of the page stays as it is.
 */
export default function SalesReports({ report }) {
    const [tab, setTab] = useState("overview");
    const [loadingPeriod, setLoadingPeriod] = useState(null);

    if (!report) {
        return <p className="text-sm text-gray-500">The sales report could not be loaded. Refresh the page to try again.</p>;
    }

    const shownPeriod = loadingPeriod ?? report.period;
    const changePeriod = (period) => {
        if (period === report.period || loadingPeriod) return;
        router.reload({
            only: ["salesReport"],
            data: { period },
            onStart: () => setLoadingPeriod(period),
            onFinish: () => setLoadingPeriod(null),
        });
    };
    const comingStep = TABS.find((item) => item.id === tab)?.step;

    return (<div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Sales Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            {report.rangeLabel}
            {report.change.revenue !== null && ` · compared with ${report.compareLabel}`}
          </p>
        </div>
        <div role="group" aria-label="Report period" className="flex flex-wrap gap-1 rounded-2xl border border-[#e3ddf2] bg-white p-1">
          {PERIODS.map((item) => {
              const pressed = shownPeriod === item.id;
              return (<button key={item.id} type="button" aria-pressed={pressed} onClick={() => changePeriod(item.id)} disabled={Boolean(loadingPeriod)} className={`min-h-10 rounded-xl px-4 text-[13px] font-bold transition-colors disabled:cursor-wait ${pressed ? "bg-paw-blue text-white" : "text-[#3d3553] hover:bg-paw-blue-soft"}`}>
                  {item.label}
                </button>);
          })}
        </div>
      </div>

      <div role="group" aria-label="Report sections" className="flex flex-wrap gap-1 border-b border-[#e3ddf2]">
        {TABS.map((item) => {
            const pressed = tab === item.id;
            return (<button key={item.id} type="button" aria-pressed={pressed} onClick={() => setTab(item.id)} className={`-mb-px min-h-11 border-b-[3px] px-3.5 text-sm transition-colors ${pressed ? "border-paw-blue font-bold text-paw-blue" : "border-transparent font-semibold text-gray-500 hover:text-paw-blue"}`}>
                {item.label}
              </button>);
        })}
      </div>

      <div aria-busy={Boolean(loadingPeriod)} className={`flex flex-col gap-5 transition-opacity ${loadingPeriod ? "opacity-60" : ""}`}>
        {tab === "overview" && (<>
            <KpiCards report={report}/>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2"><RevenueChart report={report}/></div>
              <MoneyMix report={report}/>
            </div>
            <LatestPayments payments={report.latestPayments}/>
          </>)}

        {comingStep && (<div className={`${CARD} border-dashed py-10 text-center`}>
            <p className="text-base font-bold text-[#1a0a3c]">{TABS.find((item) => item.id === tab).label}</p>
            <p className="mt-1 text-sm text-gray-500">Wala pa for now hehe</p>
          </div>)}
      </div>
    </div>);
}
