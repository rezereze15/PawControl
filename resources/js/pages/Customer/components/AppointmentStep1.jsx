function splitName(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const firstName = parts.shift() ?? "";
    const lastName = parts.length > 0 ? parts.pop() : "";

    return { firstName, middleName: parts.join(" "), lastName };
}

function AppointmentStep1({ owner, data, setData, errors, onNext, onCancel, }) {
    const inp = "border border-gray-300 rounded-full px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]";
    const name = splitName(owner?.name);
    const fieldError = (field) => errors[field] && <p className="mt-1 text-sm text-red-600" role="alert">{errors[field]}</p>;
    return (<div className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
          Owners Name <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input className={inp} value={name.firstName} placeholder="First Name" readOnly/>
          <input className={inp} value={name.middleName} placeholder="Middle Name" readOnly/>
          <input className={inp} value={name.lastName} placeholder="Last Name" readOnly/>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
          Authorized Representative <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input className={inp} value={data.ar_first_name} onChange={(event) => setData("ar_first_name", event.target.value)} placeholder="First Name"/>
            {fieldError("ar_first_name")}
          </div>
          <div>
            <input className={inp} value={data.ar_last_name} onChange={(event) => setData("ar_last_name", event.target.value)} placeholder="Last Name"/>
            {fieldError("ar_last_name")}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input className={inp} value={owner?.phone ?? ""} placeholder="Contact Number" readOnly/>
        </div>
        <div>
          <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input className={inp} value={owner?.email ?? ""} placeholder="Email Address" readOnly/>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <input className={inp} value={owner?.address ?? ""} placeholder="Address" readOnly/>
      </div>
      <div className="flex justify-between pt-2">
        <button onClick={onCancel} className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={onNext} className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors">
          Next
        </button>
      </div>
    </div>);
}
export default AppointmentStep1;
