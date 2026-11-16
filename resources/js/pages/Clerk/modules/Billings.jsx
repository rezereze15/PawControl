import { useCallback, useMemo, useState } from 'react';
import SearchField from '@/Components/SearchField';
import DataTable from '@/Components/DataTable';
import StatusBadge from '@/Components/StatusBadge';
import { PetAvatar } from '../../shared/dashboard/PetAvatar';
import { MOCK_BILLINGS } from '../../shared/dashboard/data';
import BillingReceiptModal, { billingTotals } from '../components/BillingReceiptModal';

const PAGE_SIZE = 5;

const LAST_VISIT_RANGES = [
    { id: 'all', label: 'All Time', days: null },
    { id: '7', label: 'Last 7 Days', days: 7 },
    { id: '30', label: 'Last 30 Days', days: 30 },
    { id: '90', label: 'Last 3 Months', days: 90 },
];

// Badge colours per billed item type; anything else gets the neutral style.
const TYPE_BADGE = {
    Vaccination: 'border-amber-300 bg-amber-50 text-amber-500',
    Surgery: 'border-violet-500 bg-violet-100 text-violet-800',
    Consultation: 'border-sky-300 bg-sky-50 text-sky-700',
    Grooming: 'border-teal-300 bg-teal-50 text-teal-700',
};

const STATUS_TEXT = {
    Unpaid: 'text-red-500',
    'Partially Paid': 'text-amber-600',
    Paid: 'text-green-600',
};

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort();

// YYYY-MM-DD for "n days ago", in local time to match the lastVisit dates.
function daysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function SelectField({ label, value, onChange, children }) {
    return (<label className="flex flex-col gap-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="relative">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full min-w-[150px] appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-9 text-sm text-[#1a0a3c] focus:border-[#3b0f8c] focus:outline-none">
          {children}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </label>);
}

function RowMenu({ bill, open, onToggle, onView }) {
    return (<div className="relative inline-block">
      <button type="button" onClick={onToggle} aria-label={`Actions for ${bill.pet}'s billing`} aria-expanded={open} className="rounded-lg p-2 text-[#1a0a3c] transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-300">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="12" cy="19" r="2"/>
        </svg>
      </button>
      {open && (<>
          {/* Invisible backdrop so a click anywhere else closes the menu. */}
          <button type="button" aria-hidden="true" tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={onToggle}/>
          <div className="absolute right-full top-0 z-20 mr-1 w-40 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
            <button type="button" onClick={onView} className="block w-full px-4 py-2 text-left text-sm text-[#1a0a3c] hover:bg-violet-50">
              View details
            </button>
          </div>
        </>)}
    </div>);
}

function BillingPagination({ page, pageCount, from, to, total, onPageChange }) {
    const navButton = 'rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';
    return (<div className="paw-appointments-pagination flex items-center justify-between px-5 py-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        {total === 0 ? 'No entries' : `Showing ${from} to ${to} of ${total} entries`}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" className={navButton} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>&lt; Previous</button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((n) => (<button key={n} type="button" onClick={() => onPageChange(n)} aria-current={n === page ? 'page' : undefined} className={`w-8 h-8 text-xs rounded-lg font-semibold ${n === page
                ? 'bg-[#1a0a3c] text-white'
                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {n}
          </button>))}
        <button type="button" className={navButton} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>Next &gt;</button>
      </div>
    </div>);
}

/**
 * Upcoming billed items for pets. Not linked to the database yet: rows come in through
 * `billings` (sample data by default) until the step that creates billing records exists.
 */
export function ClerkBillings({ billings: initialBillings = MOCK_BILLINGS }) {
    // Kept in memory so receipt edits show in the list; nothing is persisted yet.
    const [billings, setBillings] = useState(initialBillings);
    const [search, setSearch] = useState('');
    const [species, setSpecies] = useState('All');
    const [status, setStatus] = useState('All');
    const [lastVisit, setLastVisit] = useState('all');
    const [type, setType] = useState('All');
    const [showMore, setShowMore] = useState(false);
    const [page, setPage] = useState(1);
    const [menuId, setMenuId] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const speciesOptions = useMemo(() => uniqueSorted(billings.map((b) => b.species)), [billings]);
    const statusOptions = useMemo(() => uniqueSorted(billings.map((b) => b.status)), [billings]);
    const typeOptions = useMemo(() => uniqueSorted(billings.map((b) => b.type)), [billings]);

    const query = search.trim().toLowerCase();
    const rangeDays = LAST_VISIT_RANGES.find((r) => r.id === lastVisit)?.days;
    const since = rangeDays ? daysAgo(rangeDays) : null;

    const filtered = billings.filter((b) => {
        const matchSearch = !query || [b.pet, b.owner, b.email, b.phone, b.type, b.veterinarian, b.species, b.breed]
            .some((field) => String(field ?? '').toLowerCase().includes(query));
        return matchSearch
            && (species === 'All' || b.species === species)
            && (status === 'All' || b.status === status)
            && (type === 'All' || b.type === type)
            && (!since || (b.lastVisit && b.lastVisit >= since));
    });

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const start = (currentPage - 1) * PAGE_SIZE;
    const rows = filtered.slice(start, start + PAGE_SIZE);

    // Any filter change sends the user back to the first page.
    const withReset = (setter) => (value) => {
        setter(value);
        setPage(1);
    };

    const resetFilters = () => {
        setSearch('');
        setSpecies('All');
        setStatus('All');
        setLastVisit('all');
        setType('All');
        setPage(1);
    };

    const selected = billings.find((b) => b.id === selectedId) ?? null;
    const closeReceipt = useCallback(() => setSelectedId(null), []);

    return (<div className="paw-billings-view paw-appointments-view flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-extrabold text-[#1a0a3c]">Upcoming Billings</h1>
        <p className="mt-1 text-base text-gray-500">A list of all upcoming billed items for pets.</p>
      </div>

      <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex min-w-[240px] flex-1 flex-col gap-1.5">
            <span className="text-sm text-gray-500">Search</span>
            <SearchField value={search} onChange={withReset(setSearch)} placeholder="Search by pet name, owner, services, veterinarian..." className="h-10 w-full rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:border-[#3b0f8c] focus:outline-none"/>
          </label>
          <SelectField label="Species" value={species} onChange={withReset(setSpecies)}>
            <option value="All">All Species</option>
            {speciesOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>
          <SelectField label="Status" value={status} onChange={withReset(setStatus)}>
            <option value="All">All Status</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectField>
          <SelectField label="Last Visit" value={lastVisit} onChange={withReset(setLastVisit)}>
            {LAST_VISIT_RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </SelectField>
          <button type="button" onClick={() => setShowMore((open) => !open)} aria-expanded={showMore} className={`flex h-10 items-center gap-2 rounded-lg border px-4 text-sm transition ${showMore ? 'border-[#3b0f8c] bg-violet-50 text-[#3b0f8c]' : 'border-gray-300 text-[#1a0a3c] hover:bg-gray-50'}`}>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" strokeLinecap="round"/>
              <circle cx="16" cy="6" r="2"/>
              <circle cx="10" cy="12" r="2"/>
              <circle cx="18" cy="18" r="2"/>
            </svg>
            Filters
          </button>
          <button type="button" onClick={resetFilters} className="flex h-10 items-center gap-1.5 px-2 text-sm font-medium text-[#4f6bff] transition hover:text-[#3b0f8c]">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reset
          </button>
        </div>
        {showMore && (<div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4">
            <SelectField label="Type" value={type} onChange={withReset(setType)}>
              <option value="All">All Types</option>
              {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </SelectField>
          </div>)}
      </div>

      <div className="paw-appointments-table-card bg-white rounded-xl shadow-sm overflow-visible">
        <DataTable className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Pet Info', 'Owner', 'Species/Breed', 'Amount', 'Type', 'Veterinarian', 'Actions'].map((h) => (<th key={h} className="px-5 py-4 text-left font-bold text-[#1a0a3c]">
                  {h}
                </th>))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 && (<tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                  {billings.length === 0 ? 'No upcoming billings yet.' : 'No billings match these filters.'}
                </td>
              </tr>)}
            {rows.map((b) => (<tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <PetAvatar name={b.pet} photo={b.photo} size="sm"/>
                    <div>
                      <p className="font-bold text-[#1a0a3c]">{b.pet}</p>
                      <p className="text-gray-400 text-xs">ID-{String(b.petId).padStart(4, '0')}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#1a0a3c] text-sm">{b.owner}</p>
                  {b.email && <p className="text-gray-400 text-xs">{b.email}</p>}
                  {b.phone && <p className="text-gray-400 text-xs">{b.phone}</p>}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  <p>{b.species ?? '—'}</p>
                  {b.breed && <p className="text-gray-400 text-xs">{b.breed}</p>}
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#1a0a3c]">{peso.format(billingTotals(b).total)}</p>
                  {b.status && <p className={`text-xs font-semibold ${STATUS_TEXT[b.status] ?? 'text-gray-400'}`}>{b.status}</p>}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge className={`px-3 py-1 rounded-full text-xs font-semibold border ${TYPE_BADGE[b.type] ?? 'border-gray-300 bg-gray-50 text-gray-600'}`}>
                    {b.type}
                  </StatusBadge>
                </td>
                <td className="px-5 py-4 text-gray-600">{b.veterinarian ?? '—'}</td>
                <td className="px-5 py-4">
                  <RowMenu bill={b} open={menuId === b.id} onToggle={() => setMenuId((id) => (id === b.id ? null : b.id))} onView={() => {
                      setMenuId(null);
                      setSelectedId(b.id);
                  }}/>
                </td>
              </tr>))}
          </tbody>
        </DataTable>
        <BillingPagination page={currentPage} pageCount={pageCount} from={filtered.length ? start + 1 : 0} to={start + rows.length} total={filtered.length} onPageChange={setPage}/>
      </div>

      {selected && (<BillingReceiptModal key={selected.id} bill={selected} onClose={closeReceipt} onSave={(updated) => setBillings((list) => list.map((b) => (b.id === updated.id ? updated : b)))}/>)}
    </div>);
}

export default ClerkBillings;
