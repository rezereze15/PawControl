import DataTable from "@/Components/DataTable";
import StatusBadge from "@/Components/StatusBadge";
import { unitLabel } from "../../shared/dashboard/units";

// Formats "250.00" as "₱250.00".
const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

// Inactive rows are greyed out; low-stock rows get a light orange background.
function rowColor(supply) {
    if (!supply.isActive) return "bg-gray-50/60";
    return supply.isLowStock ? "bg-orange-50/60" : "";
}

export default function SupplyTable({ supplies }) {
    return (<DataTable className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {["Supply", "Category", "Stock", "Unit Price", "Status"].map((h) => (<th key={h} className="px-6 py-4 text-left text-sm font-bold text-[#1a0a3c]">{h}</th>))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {supplies.length === 0 && (<tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No supplies match these filters.</td></tr>)}
        {supplies.map((s) => (<tr key={s.id} className={`transition-colors hover:bg-gray-50 ${rowColor(s)}`}>
            <td className="px-6 py-4">
              <p className="font-semibold text-[#1a0a3c]">{s.name}</p>
              {s.description && <p className="mt-0.5 text-xs text-gray-500">{s.description}</p>}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-gray-600">{s.category}</td>
            <td className="whitespace-nowrap px-6 py-4">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${s.isLowStock ? "text-[#e87c1e]" : "text-[#1a0a3c]"}`}>
                  {s.stockQuantity.toLocaleString()} {unitLabel(s.unitOfMeasure, s.stockQuantity)}
                </span>
                {s.isLowStock && <StatusBadge className="rounded-full border border-orange-300 bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-600">Low stock</StatusBadge>}
              </div>
              <p className="mt-0.5 text-xs text-gray-400">Reorder at {s.reorderLevel.toLocaleString()}</p>
            </td>
            <td className="whitespace-nowrap px-6 py-4 font-semibold text-[#1a0a3c]">{peso.format(Number(s.unitPrice))}</td>
            <td className="px-6 py-4">
              <StatusBadge className={`rounded-full border px-3 py-1 text-xs font-semibold ${s.isActive ? "border-green-400 bg-green-50 text-green-600" : "border-gray-300 bg-gray-50 text-gray-500"}`}>{s.isActive ? "Active" : "Inactive"}</StatusBadge>
            </td>
          </tr>))}
      </tbody>
    </DataTable>);
}
