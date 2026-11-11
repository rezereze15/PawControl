interface AppointmentStep5Props {
  onBack: () => void
  onDone: () => void
}

function AppointmentStep5({ onBack, onDone }: AppointmentStep5Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Owner Details */}
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <p className="font-bold text-[#1a0a3c] text-sm mb-1">Owner Details</p>
          <div>
            <p className="text-xs font-bold text-[#1a0a3c]">Full Name</p>
            <p className="text-xs text-gray-600">Karina Cruz Ganda</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#1a0a3c]">
              Authorized Representative
            </p>
            <p className="text-xs text-gray-600">Jane Doe</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Contact Number</p>
              <p className="text-xs text-gray-600">09299667721</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Email Address</p>
              <p className="text-xs text-gray-600">Kawina@gmail.com</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-[#1a0a3c]">Address</p>
            <p className="text-xs text-gray-600">Blk 28 Lot 3 South Korea</p>
          </div>
        </div>

        {/* Animal Signalment */}
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-2">
          <p className="font-bold text-[#1a0a3c] text-sm mb-1">
            Animal Signalment
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">
                Patient/Pet Name
              </p>
              <p className="text-xs text-gray-600">Lean Angelus</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Species</p>
              <p className="text-xs text-gray-600">Dog</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-[#1a0a3c]">Breed</p>
            <p className="text-xs text-gray-600">Aspin</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Date of Birth</p>
              <p className="text-xs text-gray-400">--/--/----</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Age</p>
              <p className="text-xs text-gray-600">3</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Color/Markings</p>
              <p className="text-xs text-gray-600">Brown/Polka dots</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Weight</p>
              <p className="text-xs text-gray-600">8kg</p>
            </div>
            <div>
              <p className="text-xs font-bold text-[#1a0a3c]">Temperature</p>
              <p className="text-xs text-gray-400">--/--/----</p>
            </div>
          </div>
        </div>

        {/* Confirm Date */}
        <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
          <p className="font-bold text-[#1a0a3c] text-sm mb-1">Selected Date</p>
          <div className="flex justify-center">
            <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
              <rect
                x="6"
                y="14"
                width="52"
                height="44"
                rx="5"
                stroke="#1a0a3c"
                strokeWidth="3"
              />
              <path d="M6 26h52" stroke="#1a0a3c" strokeWidth="3" />
              <path
                d="M20 8v12M44 8v12"
                stroke="#1a0a3c"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>
              Your selected date for appointment:{" "}
              <span className="text-[#3b0f8c] font-medium">
                May 15, 2026 at 4:00AM
              </span>
            </span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            <span>Wait for your appointment confirmation</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-600">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>
              We'll contact you in your email:{" "}
              <span className="text-[#3b0f8c] font-medium">
                Kawina@gmail.com
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onDone}
          className="bg-[#3b0f8c] text-white px-8 py-2 rounded-full text-sm font-bold hover:bg-[#2d0a6e] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )
}

export default AppointmentStep5
