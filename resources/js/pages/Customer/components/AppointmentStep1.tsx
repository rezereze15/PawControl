interface AppointmentStep1Props {
  onNext: () => void
  onCancel: () => void
}

function AppointmentStep1({
  onNext,
  onCancel,
}: AppointmentStep1Props) {
  const inp =
    "border border-gray-300 rounded-full px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]"
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
          Owners Name <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input
            className={inp}
            defaultValue="Karina"
            placeholder="First Name"
          />
          <input
            className={inp}
            defaultValue="Cruz"
            placeholder="Middle Name"
          />
          <input className={inp} defaultValue="Ganda" placeholder="Last Name" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
          Authorized Representative <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input className={inp} placeholder="First Name" />
          <input className={inp} placeholder="Last Name" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            className={inp}
            defaultValue="09299667721"
            placeholder="Contact Number"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            className={inp}
            defaultValue="Kawina@gmail.com"
            placeholder="Email Address"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          className={inp}
          defaultValue="Blk 28 Lot 3 South Korea"
          placeholder="Address"
        />
      </div>
      <div className="flex justify-between pt-2">
        <button
          onClick={onCancel}
          className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onNext}
          className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default AppointmentStep1
