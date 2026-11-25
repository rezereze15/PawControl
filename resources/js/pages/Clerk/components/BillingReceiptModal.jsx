import { useCallback, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import clinicLogo from '../../../imports/BIGPAW_LOGO-removebg-preview.png';
import { CLINIC_INFO } from '../../shared/dashboard/data';
import ConfirmDialog from '../../Veterinarian/components/ConfirmDialog';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const lineAmount = (item) => (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);

/** Subtotal, discount and total for a billing (also used for the list's Amount column). */
export function billingTotals(bill) {
    const subtotal = [...(bill.items ?? []), bill.other ?? {}].reduce((sum, item) => sum + lineAmount(item), 0);
    const discount = Number(bill.discount) || 0;
    return { subtotal, discount, total: Math.max(0, subtotal - discount) };
}

/** "Dr. Name" for the attending vet; names already titled ("Dr. X", "Doc X") are kept as is. */
export function vetDisplayName(name) {
    const trimmed = String(name ?? '').trim();
    if (!trimmed) return '—';
    return /^(dr|doc)\.?\s/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`;
}

function formatDate(day) {
    if (!day) return '—';
    return new Date(`${day}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const headerButton = 'rounded-lg border border-paw-blue px-4 py-1.5 text-sm font-medium text-paw-blue transition hover:bg-paw-blue-soft focus:outline-none focus:ring-2 focus:ring-violet-300';
const cellInput = 'w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-paw-blue focus:outline-none';

function NumberCell({ value, editing, onChange, money }) {
    if (!editing) return <span>{money ? peso.format(Number(value) || 0) : value}</span>;
    return (<input type="number" min="0" step={money ? '0.01' : '1'} value={value} onChange={(event) => onChange(event.target.value)} className={`${cellInput} max-w-[110px] text-right`}/>);
}

/**
 * Billing receipt popup for a bill from the database (created when the vet completed the
 * visit). The clerk can adjust it, then "Mark as Paid" saves the receipt as shown and
 * settles it. Paid receipts are read-only.
 */
export default function BillingReceiptModal({ bill, onClose }) {
    const [draft, setDraft] = useState(bill);
    const [editing, setEditing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState(null);
    const paid = bill.status === 'Paid';
    // A paid receipt shows what was saved; until then, the clerk's working copy.
    const shown = paid ? bill : draft;
    const isEditing = editing && !paid;

    useEffect(() => {
        const onKey = (event) => event.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const update = (changes) => setDraft((current) => ({ ...current, ...changes }));
    const updateItem = (id, changes) => update({ items: draft.items.map((item) => (item.id === id ? { ...item, ...changes } : item)) });
    const updateOther = (changes) => update({ other: { ...draft.other, ...changes } });

    const { subtotal, discount, total } = billingTotals(shown);
    const other = shown.other ?? { description: '', qty: 0, unitPrice: 0 };

    const closeConfirm = useCallback(() => setConfirming(false), []);

    const markPaid = () => {
        router.post(`/billings/${bill.id}/pay`, {
            items: draft.items.map(({ id, description, qty, unitPrice }) => ({ id, description, qty: Number(qty) || 0, unitPrice: Number(unitPrice) || 0 })),
            other: { description: other.description ?? '', qty: Number(other.qty) || 0, unitPrice: Number(other.unitPrice) || 0 },
            discount: Number(draft.discount) || 0,
            notes: draft.notes ?? '',
            referenceNumber: draft.referenceNumber ?? '',
        }, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => {
                setPaying(true);
                setError(null);
            },
            onSuccess: () => {
                setEditing(false);
                setConfirming(false);
            },
            onError: (errors) => {
                setConfirming(false);
                setError(Object.values(errors)[0] ?? 'The bill could not be marked as paid.');
            },
            onFinish: () => setPaying(false),
        });
    };

    return (<div className="paw-billing-receipt-overlay paw-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="billing-receipt-title" onClick={(event) => event.stopPropagation()} className="paw-billing-receipt paw-dialog-in flex max-h-[92vh] w-full max-w-3xl flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="paw-receipt-noprint flex flex-wrap items-center justify-between gap-3 px-6 pb-4 pt-6">
          <h2 id="billing-receipt-title" className="text-2xl font-extrabold text-[#1a0a3c]">Billing Receipt</h2>
          <div className="flex items-center gap-3">
            {!paid && (<button type="button" onClick={() => setEditing((on) => !on)} aria-pressed={isEditing} className={`${headerButton} ${isEditing ? 'bg-paw-blue-soft' : ''}`}>
                {isEditing ? 'Done' : 'Edit'}
              </button>)}
            <button type="button" onClick={() => window.print()} className={headerButton}>Print</button>
            {/* No PDF library yet: the browser print dialog's "Save as PDF" produces the file. */}
            <button type="button" onClick={() => window.print()} title="Choose “Save as PDF” in the print dialog" className={headerButton}>Export PDF</button>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-gray-100 px-6 py-5 shadow-[0_2px_6px_rgb(23_4_61/6%)]">
          <div className="flex items-center gap-4">
            <img src={clinicLogo} alt="Big Paws Animal Clinic logo" className="h-20 w-20 rounded-full object-contain"/>
            <div>
              <p className="text-2xl font-extrabold text-[#1a0a3c]">{CLINIC_INFO.name}</p>
              <p className="text-sm text-gray-500">{CLINIC_INFO.address}</p>
              <p className="mt-1 text-sm text-gray-500">Contact: {CLINIC_INFO.contact}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Receipt No.</p>
            <p className="text-sm font-bold text-[#1a0a3c]">{shown.receiptNo}</p>
            <p className="mt-2 text-sm text-gray-500">Date Issued</p>
            <p className="text-sm font-bold text-[#1a0a3c]">{formatDate(shown.dateIssued)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 px-6 py-5">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="text-sm">
              <p className="mb-2 text-xs font-medium uppercase text-gray-500">Billed To</p>
              <p className="font-bold text-[#1a0a3c]">{shown.owner}</p>
              <p className="mt-1 text-[#1a0a3c]">{shown.email}</p>
              <p className="mt-1 text-[#1a0a3c]">{shown.phone}</p>
            </div>
            <div className="text-sm">
              <p className="mb-2 text-xs font-medium uppercase text-gray-500">Pet Information</p>
              <dl className="grid grid-cols-[120px_1fr] gap-y-1 text-[#1a0a3c]">
                <dt>Pet Name</dt><dd>{shown.pet}</dd>
                <dt>Species/Breed</dt><dd>{shown.species}{shown.breed ? ` (${shown.breed})` : ''}</dd>
                <dt>Patient ID:</dt><dd>ID-{String(shown.petId).padStart(4, '0')}</dd>
              </dl>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm text-[#1a0a3c]">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold uppercase">
                    <th className="px-3 py-3 text-left">Item / Description</th>
                    <th className="px-3 py-3 text-center">Qty</th>
                    <th className="px-3 py-3 text-right">Unit Price</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shown.items.map((item) => (<tr key={item.id}>
                      <td className="px-3 py-2.5">
                        {isEditing
                    ? <input type="text" value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} className={cellInput}/>
                    : item.description}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <NumberCell value={item.qty} editing={isEditing} onChange={(qty) => updateItem(item.id, { qty })}/>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <NumberCell value={item.unitPrice} editing={isEditing} money onChange={(unitPrice) => updateItem(item.id, { unitPrice })}/>
                      </td>
                      <td className="px-3 py-2.5 text-right">{peso.format(lineAmount(item))}</td>
                    </tr>))}
                  {/* A paid receipt's "Others" (if any) was saved as a normal line above. */}
                  {!paid && (<>
                  <tr>
                    <td className="px-3 py-2.5">Others</td>
                    <td className="px-3 py-2.5 text-center">
                      <NumberCell value={other.qty} editing={isEditing} onChange={(qty) => updateOther({ qty })}/>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <NumberCell value={other.unitPrice} editing={isEditing} money onChange={(unitPrice) => updateOther({ unitPrice })}/>
                    </td>
                    <td className="px-3 py-2.5 text-right">{peso.format(lineAmount(other))}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-3 py-2.5">
                      {isEditing
                    ? <input type="text" value={other.description} onChange={(event) => updateOther({ description: event.target.value })} placeholder="Input Other" className={cellInput}/>
                    : (other.description || <span className="text-gray-400">Input Other</span>)}
                    </td>
                  </tr>
                  </>)}
                </tbody>
              </table>
            </div>
            <div className="grid border-t border-gray-200 sm:grid-cols-[1fr_minmax(240px,40%)]">
              <div className="p-3 text-sm">
                <p className="mb-2 text-xs font-bold uppercase text-[#1a0a3c]">Notes</p>
                {isEditing
                    ? <textarea value={shown.notes} onChange={(event) => update({ notes: event.target.value })} rows={3} className={`${cellInput} resize-none`}/>
                    : <p className="whitespace-pre-line text-gray-600">{shown.notes}</p>}
              </div>
              <dl className="divide-y divide-gray-200 border-t border-gray-200 text-sm text-[#1a0a3c] sm:border-l sm:border-t-0">
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <dt className="font-bold">Subtotal</dt>
                  <dd>{peso.format(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <dt className="font-bold">Discount</dt>
                  <dd>
                    {isEditing
                    ? <input type="number" min="0" step="0.01" value={shown.discount} onChange={(event) => update({ discount: event.target.value })} aria-label="Discount" className={`${cellInput} max-w-[110px] text-right`}/>
                    : `– ${peso.format(discount)}`}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 bg-violet-50 px-3 py-3">
                  <dt className="font-bold uppercase">Total Due</dt>
                  <dd className="font-semibold">{peso.format(total)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <p className="-mt-3 text-sm text-gray-500">
            Attending Veterinarian: <span className="ml-1 font-semibold text-[#1a0a3c]">{vetDisplayName(shown.veterinarian)}</span>
          </p>

          {/* Printed too: the receipt shows it was settled. */}
          {paid && (<div className="-mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500" role="status">
              <span className="rounded-full border border-green-600 bg-green-50 px-3 py-0.5 text-xs font-bold uppercase tracking-wide text-green-700">Paid</span>
              {shown.paidAt && <span>Paid on <span className="font-semibold text-[#1a0a3c]">{formatDate(shown.paidAt)}</span></span>}
              {shown.referenceNumber && <span>Reference No. <span className="font-semibold text-[#1a0a3c]">{shown.referenceNumber}</span></span>}
              {shown.paidBy && <span>Received by <span className="font-semibold text-[#1a0a3c]">{shown.paidBy}</span></span>}
            </div>)}

          <div className="paw-receipt-noprint mt-4 flex flex-col gap-6">
            {!paid && (<input type="text" value={shown.referenceNumber ?? ''} onChange={(event) => update({ referenceNumber: event.target.value })} placeholder="Enter receipt reference number" aria-label="Receipt reference number" className="w-full max-w-sm rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-paw-blue focus:outline-none"/>)}
            {error && <p className="-mt-3 text-sm text-red-600" role="alert">{error}</p>}
            <div className="flex items-center justify-between gap-3">
              {!paid && (<button type="button" onClick={() => setConfirming(true)} disabled={paying} className="rounded-lg bg-paw-blue px-6 py-2 text-sm font-semibold text-white transition hover:bg-paw-blue-dark focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-60">
                  {paying ? 'Saving…' : 'Mark as Paid'}
                </button>)}
              <p className="ml-auto text-sm text-gray-500">Page 1 of 1</p>
            </div>
          </div>
        </div>
      </div>
      {/* Clicks in the prompt must not reach the overlay, which closes the receipt. */}
      {confirming && (<div onClick={(event) => event.stopPropagation()}>
          <ConfirmDialog title="Mark this bill as paid?" tone="sky" icon="lock" confirmLabel="Yes, mark as paid" busyLabel="Saving…" busy={paying} onConfirm={markPaid} onCancel={closeConfirm}>
            Total collected: <strong>{peso.format(total)}</strong>. Once paid, this receipt can no longer be edited.
          </ConfirmDialog>
        </div>)}
    </div>);
}
