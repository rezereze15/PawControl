import { qrCode } from "../../shared/dashboard/assets";
function AppointmentStep4({ data, setData, errors, onNext, onBack }) {
    const inp = "border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#3b0f8c] focus:ring-1 focus:ring-[#3b0f8c]";
    const proofError = errors.proof_of_down_payment && <p className="mt-1 text-sm text-red-600" role="alert">{errors.proof_of_down_payment}</p>;
    const termsError = errors.terms_accepted && <p className="mt-1 text-sm text-red-600" role="alert">{errors.terms_accepted}</p>;
    const referenceError = errors.reference_number && <p className="mt-1 text-sm text-red-600" role="alert">{errors.reference_number}</p>;
    return (<div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-8 items-start">
        {/* Left â€” terms + form */}
        <div className="flex flex-col gap-4">
          <label className="flex items-start gap-3 text-sm text-[#1a0a3c]">
            <input type="checkbox" checked={data.terms_accepted} onChange={(event) => setData("terms_accepted", event.target.checked)} className="mt-1 h-4 w-4 flex-shrink-0 accent-[#3b0f8c]"/>
            <span>
              By checking and booking an appointment, you agree to pay a{" "}
              <strong>₱200 non-refundable down payment</strong> to secure your
              slot.
            </span>
          </label>
          {termsError}
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 pl-1">
            <li>
              The down payment will be deducted from the total service fee.
            </li>
            <li>
              Appointments will only be confirmed after payment and receipt
              upload are completed.
            </li>
            <li>
              You must upload a valid proof of payment (receipt or screenshot)
              during booking.
            </li>
            <li>
              Cancellations or no-shows will result in forfeiture of the down
              payment.
            </li>
            <li>
              Rescheduling is allowed if requested at least 24 hours before the
              appointment.
            </li>
          </ul>
          <div>
            <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
              Upload Attachment
            </label>
            <input className={inp} placeholder="Select an Attachment" type="file" accept=".jpg,.jpeg,.png,.pdf" required onChange={(event) => setData("proof_of_down_payment", event.target.files?.[0] ?? null)}/>
            {data.proof_of_down_payment && <p className="mt-1 text-sm text-gray-600">Selected: {data.proof_of_down_payment.name}</p>}
            {proofError}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1a0a3c] mb-2">
              Payment Reference Number <span className="text-red-500">*</span>
            </label>
            <input className={inp} type="text" inputMode="numeric" maxLength={255} required value={data.reference_number} onChange={(event) => setData("reference_number", event.target.value)} placeholder="Enter payment reference number"/>
            {referenceError}
          </div>
        </div>

        {/* Right â€” QR code */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-extrabold text-[#1a0a3c] text-lg underline">
            PAY HERE
          </p>
          <div className="flex flex-col items-center px-3 pt-3 pb-2">
            <p className="mb-2 text-center text-sm font-extrabold text-black">Big Paw's Clinic</p>
            <img src={qrCode} alt="Payment QR code" className="h-48 w-48 object-contain"/>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="border-2 border-gray-400 text-gray-600 px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button onClick={onNext} className="border-2 border-[#1a0a3c] text-[#1a0a3c] px-6 py-2 rounded-full text-sm font-bold hover:bg-[#1a0a3c] hover:text-white transition-colors">
          Next
        </button>
      </div>
    </div>);
}
export default AppointmentStep4;
