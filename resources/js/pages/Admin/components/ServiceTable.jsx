import DataTable from "@/Components/DataTable";
import StatusBadge from "@/Components/StatusBadge";
import RowActionsMenu from "./RowActionsMenu";

// Formats "1500.00" as "₱1,500.00".
const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

export default function ServiceTable({ services, onEdit, onToggleStatus }) {
    return (<DataTable className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {["Service", "Description", "Price", "Status", "Actions"].map((h) => (<th key={h} className="px-6 py-4 text-left text-sm font-bold text-[#1a0a3c]">{h}</th>))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {services.length === 0 && (<tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No services match these filters.</td></tr>)}
        {services.map((s) => (<tr key={s.id} className={`transition-colors hover:bg-gray-50 ${s.isActive ? "" : "bg-gray-50/60"}`}>
            <td className="px-6 py-4 font-semibold text-[#1a0a3c]">{s.name}</td>
            <td className="px-6 py-4 text-gray-600">{s.description || <span className="text-gray-400">No description</span>}</td>
            <td className="whitespace-nowrap px-6 py-4 font-semibold text-[#1a0a3c]">{peso.format(Number(s.price))}</td>
            <td className="px-6 py-4">
              <StatusBadge className={`rounded-full border px-3 py-1 text-xs font-semibold ${s.isActive ? "border-green-400 bg-green-50 text-green-600" : "border-gray-300 bg-gray-50 text-gray-500"}`}>{s.isActive ? "Active" : "Inactive"}</StatusBadge>
            </td>
            <td className="px-6 py-4">
              <RowActionsMenu label={`Actions for ${s.name}`} editLabel="Edit service" active={s.isActive} onEdit={() => onEdit(s)} onToggleStatus={() => onToggleStatus(s)}/>
            </td>
          </tr>))}
      </tbody>
    </DataTable>);
}
