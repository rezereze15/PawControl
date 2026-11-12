import { CalendarIcon } from "../../shared/dashboard/Icons";
import { pawLogo } from "../../shared/dashboard/assets";
import { MOCK_PATIENTS } from "../../shared/dashboard/data";
import { PetAvatar } from "../../shared/dashboard/PetAvatar";
function OwnerHomeSection({ username }) {
    return (<div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
        Hi, {username}!
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-orange-100 rounded-xl p-3 flex-shrink-0">
            <img src={pawLogo} alt="Paw" className="w-10 h-10 object-contain"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">118</p>
            <p className="text-[#e87c1e] text-xs font-semibold mt-0.5">
              +30 this month
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="12" width="40" height="24" rx="4" stroke="#374151" strokeWidth="2.5"/>
              <path d="M4 20h40" stroke="#374151" strokeWidth="2.5"/>
              <rect x="10" y="28" width="8" height="3" rx="1" fill="#374151"/>
              <rect x="22" y="28" width="14" height="3" rx="1.5" fill="#374151"/>
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Sales</p>
            <p className="text-3xl font-extrabold text-[#1a0a3c]">
              ₱412,850.00
            </p>
            <p className="text-green-500 text-xs font-semibold mt-0.5">
              +8.64% vs last week
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>

        {/* Monthly Appointments */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">
            <CalendarIcon className="w-10 h-10" color="#374151"/>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              Monthly Appointments
            </p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">149</p>
            <p className="text-green-500 text-xs font-semibold mt-0.5">
              +23 vs last week
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Operation */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#3b0f8c] font-bold text-lg mb-4">Patients</h2>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_PATIENTS.map((p) => (<div key={p.id} className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                <PetAvatar name={p.name} photo={p.photo}/>
                <div className="min-w-0">
                  <p className={`text-xs font-bold mb-0.5 ${p.status === "On Going"
                ? "text-green-500"
                : "text-orange-400"}`}>
                    {p.status}
                  </p>
                  <p className="font-extrabold text-[#1a0a3c] text-sm leading-tight">
                    {p.name}
                  </p>
                  <p className="text-gray-500 text-xs">{p.breed}</p>
                  <p className="text-gray-400 text-xs">
                    {p.age} {p.age === 1 ? "year" : "years"} old
                  </p>
                  <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
                    View Details
                  </button>
                </div>
              </div>))}
          </div>
        </div>

        {/* Sales Report preview â€” line chart */}
        <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-violet-100 bg-white p-6 shadow-[0_10px_30px_rgba(26,10,60,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-violet-500">Performance</span>
              <h2 className="mt-1 text-lg font-extrabold text-[#1a0a3c]">Sales Report</h2>
            </div>
            <button className="rounded-lg px-2 py-1 text-xs font-bold text-[#3b0f8c] transition-colors hover:bg-violet-50">
              See more <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Revenue trend</p>
              <p className="mt-1 text-2xl font-extrabold tracking-tight text-[#1a0a3c]">₱61,400</p>
            </div>
            <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">↗ 8.64%</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-violet-50/70 px-3 py-2">
            <span className="text-xs font-semibold text-[#3b0f8c]">Daily revenue</span>
            <span className="rounded-md border border-violet-100 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600">May 14–19</span>
          </div>
          {/* Simple SVG line chart */}
          <div className="h-40 rounded-xl bg-gradient-to-b from-violet-50/70 to-white p-2">
            <svg viewBox="0 0 280 130" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ownerRevenueFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7044bd" stopOpacity="0.22"/>
                  <stop offset="100%" stopColor="#7044bd" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {[28, 55, 82, 109].map((y) => <line key={y} x1="48" y1={y} x2="272" y2={y} stroke="#e9e3f5" strokeDasharray="3 4"/>)}
              {/* Y axis labels */}
              {[
            ["₱60K", 30],
            ["₱40K", 58],
            ["₱20K", 85],
            ["₱0", 112],
        ].map(([label, y]) => (<text key={label} x="2" y={Number(y)} fontSize="7" fill="#9ca3af">
                  {label}
                </text>))}
              <polygon points="55,82 90,80 120,76 150,74 180,72 210,68 240,60 270,50 270,112 55,112" fill="url(#ownerRevenueFill)"/>
              {/* Line */}
              <polyline points="55,82 90,80 120,76 150,74 180,72 210,68 240,60 270,50" fill="none" stroke="#3b0f8c" strokeWidth="2" strokeLinejoin="round"/>
              {/* Dots */}
              {[
            [55, 82],
            [90, 80],
            [120, 76],
            [150, 74],
            [180, 72],
            [210, 68],
            [240, 60],
            [270, 50],
        ].map(([x, y], i) => (<circle key={i} cx={x} cy={y} r="3" fill="white" stroke="#3b0f8c" strokeWidth="2"/>))}
              {/* X axis labels */}
              {[
            ["May 14", 55],
            ["May 15", 90],
            ["May 16", 120],
            ["May 17", 150],
            ["May 18", 180],
            ["May 19", 210],
        ].map(([label, x]) => (<text key={label} x={Number(x) - 12} y="128" fontSize="7" fill="#9ca3af">
                  {label}
                </text>))}
            </svg>
          </div>
        </div>
      </div>
    </div>);
}
export default OwnerHomeSection;
