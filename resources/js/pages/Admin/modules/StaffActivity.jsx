/**
 * Admin → Staff Activity: who processed each payment, which vet handled each pet, and who
 * reviewed each booking (accountability). Read-only. Data comes from App\Support\StaffActivity.
 */
function AdminStaffActivity({ activity = {} }) {
    const { payments = [], petHandling = [], reviews = [] } = activity;

    return (<div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a0a3c]">Staff Activity</h1>
        <p className="mt-1 text-sm text-gray-500">See which clerk processed each payment, which veterinarian handled each pet, and who reviewed each booking</p>
      </div>

      <div className="rounded-xl bg-white px-5 py-4 text-sm text-gray-600 shadow-sm">
        {payments.length} payments · {petHandling.length} pet visits · {reviews.length} appointment reviews
      </div>
    </div>);
}
export default AdminStaffActivity;
