{{-- Billing receipt PDF (DomPDF), matching the receipt printed from the clerk's Billings screen.
     Tables only: DomPDF has no flexbox/grid. DejaVu Sans ships with DomPDF and has the ₱ sign. --}}
@php($peso = fn ($amount) => \App\Support\BillingReceipt::peso((float) $amount))
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{{ $receiptNo }}</title>
<style>
    @page { margin: 14mm 14mm 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'DejaVu Sans', sans-serif; font-size: 10.5px; color: #1a0a3c; }
    table { width: 100%; border-collapse: collapse; }
    td, th { vertical-align: top; }
    .muted { color: #6b7280; }
    .label { font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: .4px; color: #6b7280; margin: 0 0 6px; }
    .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 14px; }
    .clinic-name { font-size: 19px; font-weight: bold; margin: 0 0 3px; }
    .title { font-size: 14px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 8px; }
    .items { margin-top: 18px; border: 1px solid #e5e7eb; }
    .items th { font-size: 9px; text-transform: uppercase; text-align: left; padding: 9px 10px; border-bottom: 1px solid #e5e7eb; }
    .items td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
    .num, .items th.num { text-align: right; }
    .center, .items th.center { text-align: center; }
    .totals td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
    .total-row td { background: #f5f3ff; font-weight: bold; font-size: 12px; border-bottom: 0; }
    .paid { display: inline-block; padding: 2px 10px; border: 1px solid #16a34a; border-radius: 10px; background: #f0fdf4; color: #15803d; font-weight: bold; font-size: 9px; letter-spacing: .6px; }
    .footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid #e5e7eb; font-size: 9px; color: #6b7280; text-align: center; }
</style>
</head>
<body>
    <table class="header">
        <tr>
            @if ($logo)
            <td style="width: 70px;"><img src="{{ $logo }}" alt="" style="width: 62px; height: 62px;"></td>
            @endif
            <td style="padding-top: 6px;">
                <p class="clinic-name">{{ $clinic['name'] }}</p>
                <div class="muted">{{ $clinic['address'] }}</div>
                <div class="muted">Contact: {{ $clinic['contact'] }}</div>
            </td>
            <td style="width: 190px; text-align: right;">
                <p class="title">Billing Receipt</p>
                <div class="muted">Receipt No.</div>
                <div style="font-weight: bold; margin-bottom: 6px;">{{ $receiptNo }}</div>
                <div class="muted">Date Issued</div>
                <div style="font-weight: bold;">{{ $dateIssued }}</div>
            </td>
        </tr>
    </table>

    <table style="margin-top: 16px;">
        <tr>
            <td style="width: 50%;">
                <p class="label">Billed To</p>
                <div style="font-weight: bold;">{{ $owner }}</div>
                @if ($email)<div>{{ $email }}</div>@endif
                @if ($phone)<div>{{ $phone }}</div>@endif
            </td>
            <td style="width: 50%;">
                <p class="label">Pet Information</p>
                <table>
                    <tr><td style="width: 95px;">Pet Name</td><td>{{ $pet }}</td></tr>
                    <tr><td>Species/Breed</td><td>{{ $species ?: '—' }}</td></tr>
                    <tr><td>Patient ID</td><td>{{ $patientId }}</td></tr>
                    <tr><td>Visit</td><td>{{ $service }}, {{ $visitDate }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Item / Description</th>
                <th class="center" style="width: 50px;">Qty</th>
                <th class="num" style="width: 100px;">Unit Price</th>
                <th class="num" style="width: 100px;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($items as $item)
            <tr>
                <td>{{ $item['description'] }}</td>
                <td class="center">{{ $item['qty'] }}</td>
                <td class="num">{{ $peso($item['unitPrice']) }}</td>
                <td class="num">{{ $peso($item['amount']) }}</td>
            </tr>
            @empty
            <tr><td colspan="4" class="muted">No billed items.</td></tr>
            @endforelse
        </tbody>
    </table>

    <table style="border: 1px solid #e5e7eb; border-top: 0;">
        <tr>
            <td style="padding: 10px;">
                <p class="label" style="color: #1a0a3c;">Notes</p>
                <div class="muted">{{ $notes ?: '—' }}</div>
            </td>
            <td style="width: 40%; border-left: 1px solid #e5e7eb; padding: 0;">
                <table class="totals">
                    <tr><td style="font-weight: bold;">Subtotal</td><td class="num">{{ $peso($subtotal) }}</td></tr>
                    <tr><td style="font-weight: bold;">Discount</td><td class="num">– {{ $peso($discount) }}</td></tr>
                    <tr class="total-row"><td>{{ $paid ? 'TOTAL PAID' : 'TOTAL DUE' }}</td><td class="num">{{ $peso($total) }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="margin: 14px 0 8px;"><span class="muted">Attending Veterinarian:</span> <strong>{{ $veterinarian }}</strong></p>

    @if ($paid)
    <p style="margin: 0;">
        <span class="paid">PAID</span>
        @if ($paidAt)&nbsp; <span class="muted">Paid on</span> <strong>{{ $paidAt }}</strong>@endif
        @if ($referenceNumber)&nbsp; <span class="muted">Reference No.</span> <strong>{{ $referenceNumber }}</strong>@endif
        @if ($paidBy)&nbsp; <span class="muted">Received by</span> <strong>{{ $paidBy }}</strong>@endif
    </p>
    @endif

    <div class="footer">
        Thank you for trusting {{ $clinic['name'] }} with {{ $pet }}'s care.
        For questions about this receipt, call {{ $clinic['contact'] }}.
    </div>
</body>
</html>
