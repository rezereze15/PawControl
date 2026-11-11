import { CalendarIcon } from "../../shared/dashboard/Icons"
import { pawLogo } from "../../shared/dashboard/assets"
import { MOCK_PATIENTS, NEXT_APPOINTMENTS } from "../../shared/dashboard/data"
import { PetAvatar } from "../../shared/dashboard/PetAvatar"

interface LegacyAdminHomeSectionProps {
  username: string
}

function LegacyAdminHomeSection({ username }: LegacyAdminHomeSectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
        Hi, {username}!
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-orange-100 rounded-xl p-3 flex-shrink-0">
            <img src={pawLogo} alt="Paw" className="w-10 h-10 object-contain" />
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
              <rect
                x="4"
                y="12"
                width="40"
                height="24"
                rx="4"
                stroke="#374151"
                strokeWidth="2.5"
              />
              <path d="M4 20h40" stroke="#374151" strokeWidth="2.5" />
              <rect x="10" y="28" width="8" height="3" rx="1" fill="#374151" />
              <rect
                x="22"
                y="28"
                width="14"
                height="3"
                rx="1.5"
                fill="#374151"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Sales</p>
            <p className="text-3xl font-extrabold text-[#1a0a3c]">
              +412,850.00
            </p>
            <p className="text-green-500 text-xs font-semibold mt-0.5">
              +8.64% vs last week
            </p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <div className="bg-gray-100 rounded-xl p-3 flex-shrink-0">
            <svg className="w-10 h-10" viewBox="0 0 48 48" fill="currentColor">
              <circle cx="16" cy="16" r="7" fill="#374151" />
              <circle cx="32" cy="16" r="7" fill="#374151" opacity="0.6" />
              <path d="M4 40c0-8 5-12 12-12s12 4 12 12" fill="#374151" />
              <path
                d="M28 40c0-8 5-12 12-12"
                stroke="#374151"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">22</p>
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row â€” same as Clerk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Operation */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-[#3b0f8c] font-bold text-lg mb-4">
            Todays' Operation
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {MOCK_PATIENTS.map((p) => (
              <div
                key={p.id}
                className="border border-gray-200 rounded-xl p-4 flex items-center gap-3"
              >
                <PetAvatar name={p.name} photo={p.photo} />
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold mb-0.5 ${
                      p.status === "On Going"
                        ? "text-green-500"
                        : "text-orange-400"
                    }`}
                  >
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
              </div>
            ))}
          </div>
        </div>

        {/* Next Day Appointment */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" color="#3b0f8c" />
              <span className="text-[#3b0f8c] font-bold text-sm">
                Next Day Appointment
              </span>
            </div>
            <button className="text-[#3b0f8c] text-xs font-medium hover:underline">
              See more &gt;
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {NEXT_APPOINTMENTS.map((apt) => (
              <div key={apt.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <PetAvatar name={apt.name} photo={apt.photo} size="lg" />
                  <div>
                    <p className="font-extrabold text-[#1a0a3c] text-base leading-tight">
                      {apt.name}
                    </p>
                    <p className="text-gray-500 text-xs">{apt.breed}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-xs text-gray-600 pl-1">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                    {apt.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" strokeLinecap="round" />
                    </svg>
                    {apt.time}
                  </div>
                </div>
                <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 rounded-lg text-xs transition-colors">
                  View Appointment Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegacyAdminHomeSection
