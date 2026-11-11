import { CalendarIcon } from "../../shared/dashboard/Icons"
import { pawLogo } from "../../shared/dashboard/assets"
import { MOCK_PATIENTS, NEXT_APPOINTMENTS } from "../../shared/dashboard/data"
import { PetAvatar } from "../../shared/dashboard/PetAvatar"

interface StaffHomeSectionProps {
  username: string
  role: "Clerk" | "Veterinarian"
}

function StaffHomeSection({
  username,
  role,
}: StaffHomeSectionProps) {
  const isVeterinarian = role === "Veterinarian"

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
        Hi, {isVeterinarian ? `Doc ${username}` : username}!
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <img
            src={pawLogo}
            alt="Paw"
            className="w-12 h-12 object-contain flex-shrink-0"
          />
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
        {/* Appointments */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <CalendarIcon color="#5b21b6" />
          <div>
            <p className="text-sm text-gray-500 font-medium">Appointments</p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">8</p>
            {!isVeterinarian && (
              <p className="text-red-500 text-xs font-semibold mt-0.5">
                1 Pending
              </p>
            )}
            <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
              View Details
            </button>
          </div>
        </div>
        {/* Role-specific third metric */}
        <div className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <svg
            className="w-12 h-12 flex-shrink-0"
            viewBox="0 0 48 48"
            fill="none"
          >
            <rect
              x="8"
              y="4"
              width="32"
              height="40"
              rx="3"
              stroke="#9ca3af"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M16 14h16M16 20h16M16 26h10"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M14 36h6M24 33l3 3-3 3"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p className="text-sm text-gray-500 font-medium">
              {isVeterinarian ? "# of Operation Today" : "Upcoming Billing"}
            </p>
            <p className="text-4xl font-extrabold text-[#1a0a3c]">
              {isVeterinarian ? 4 : 3}
            </p>
            {!isVeterinarian && (
              <button className="text-[#3b0f8c] text-xs font-medium mt-1 hover:underline">
                View Details
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
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

export default StaffHomeSection
