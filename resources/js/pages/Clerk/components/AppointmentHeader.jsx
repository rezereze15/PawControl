import SearchField from "@/Components/SearchField";
export default function AppointmentHeader({ search, onSearchChange, subtitle = "Review and confirm upcoming appointment requests" }) {
    return (<div className="paw-appointments-heading flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#1a0a3c]">
                Appointments
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <SearchField value={search} onChange={onSearchChange} placeholder="Search by pet, owner, type, reference no..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#3b0f8c] w-72"/>
            </div>
          </div>);
}
