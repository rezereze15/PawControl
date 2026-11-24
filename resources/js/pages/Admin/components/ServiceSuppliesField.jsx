import { unitLabel } from "../../shared/dashboard/units";

const select = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]";

/**
 * "Supplies Used" section of the Add/Edit Service form.
 * rows: [{ id, quantity }], what the service uses each visit. The form owns this list;
 * this component only shows it and hands back a NEW list through onChange.
 * allSupplies: every supply (from Manage Medical Supplies), for names, units and categories.
 */
export default function ServiceSuppliesField({ rows, allSupplies, errors, onChange }) {
    const byId = new Map(allSupplies.map((supply) => [supply.id, supply]));
    // New picks: active supplies that aren't in the list yet, grouped by category.
    const addable = allSupplies.filter((supply) => supply.isActive && !rows.some((row) => row.id === supply.id));
    const categories = [...new Set(addable.map((supply) => supply.category))].sort();

    const add = (event) => onChange([...rows, { id: Number(event.target.value), quantity: 1 }]);
    const setAmount = (id, quantity) => onChange(rows.map((row) => (row.id === id ? { ...row, quantity } : row)));
    const remove = (id) => onChange(rows.filter((row) => row.id !== id));

    return (<fieldset>
      <legend className="mb-1 text-xs font-bold text-[#1a0a3c]">Supplies Used</legend>
      <p className="mb-2 text-[11px] text-gray-400">Optional. How many of each supply this service uses per visit.</p>

      {rows.length === 0 && <p className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-center text-xs text-gray-400">No supplies added yet.</p>}
      <ul className="flex flex-col gap-2">
        {rows.map((row, index) => {
            const supply = byId.get(row.id);
            const error = errors[`supplies.${index}.quantity`] ?? errors[`supplies.${index}.id`];
            return (<li key={row.id}>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1a0a3c]" title={supply?.name}>
                  {supply?.name ?? "Unknown supply"}
                  {supply && !supply.isActive && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">Inactive</span>}
                </span>
                <input type="number" inputMode="numeric" min="1" step="1" aria-label={`Amount of ${supply?.name ?? "supply"}`} value={row.quantity} onChange={(event) => setAmount(row.id, event.target.value)} className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-[#3b0f8c] focus:outline-none focus:ring-1 focus:ring-[#3b0f8c]"/>
                <span className="w-14 text-xs text-gray-500">{supply && unitLabel(supply.unitOfMeasure, Number(row.quantity))}</span>
                <button type="button" onClick={() => remove(row.id)} aria-label={`Remove ${supply?.name ?? "supply"}`} className="rounded-lg p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round"/></svg>
                </button>
              </div>
              {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
            </li>);
        })}
      </ul>

      {addable.length > 0 && (<select aria-label="Add a supply" value="" onChange={add} className={`${select} mt-2`}>
          <option value="">+ Add a supply…</option>
          {categories.map((category) => (<optgroup key={category} label={category}>
              {addable.filter((supply) => supply.category === category).map((supply) => <option key={supply.id} value={supply.id}>{supply.name}</option>)}
            </optgroup>))}
        </select>)}
      {errors.supplies && <p className="mt-1 text-xs text-red-600" role="alert">{errors.supplies}</p>}
    </fieldset>);
}
