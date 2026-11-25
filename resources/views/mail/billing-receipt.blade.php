{{-- Paid receipt email; the PDF receipt is attached. Vars: name, clinic, pet, fileName, total, details (label => value). --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Payment receipt</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#151b2a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
        <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
                <tr><td style="background:#19043f;padding:20px 28px;border-bottom:5px solid #ffbb50;">
                    <span style="color:#ffffff;font-size:20px;font-weight:bold;">PawControl</span>
                </td></tr>
                <tr><td style="padding:32px 28px 12px;">
                    @if (! empty($name))
                    <p style="margin:0 0 12px;font-size:16px;">Hi {{ $name }},</p>
                    @endif
                    <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#15803d;">Payment received — thank you!</p>
                    <p style="margin:0 0 20px;font-size:16px;line-height:1.5;">
                        We've received your payment for {{ $pet }}'s visit at {{ $clinic['name'] }}.
                        Your billing receipt is attached to this email as a PDF.
                    </p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f4f1ff;border-radius:12px;">
                        @foreach ($details as $label => $value)
                        <tr>
                            <td style="padding:8px 16px;font-size:14px;color:#6b7280;">{{ $label }}</td>
                            <td style="padding:8px 16px;font-size:14px;font-weight:bold;color:#19043f;text-align:right;">{{ $value }}</td>
                        </tr>
                        @endforeach
                        <tr>
                            <td style="padding:12px 16px;font-size:15px;font-weight:bold;color:#19043f;border-top:1px solid #e4defa;">Total paid</td>
                            <td style="padding:12px 16px;font-size:17px;font-weight:bold;color:#15803d;text-align:right;border-top:1px solid #e4defa;">{{ $total }}</td>
                        </tr>
                    </table>
                    <p style="margin:0 0 20px;font-size:14px;line-height:1.5;">
                        📎 <strong>{{ $fileName }}</strong> — keep it for your records.
                    </p>
                </td></tr>
                <tr><td style="padding:0 28px 28px;">
                    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                        Questions about this receipt? Call us at {{ $clinic['contact'] }} or visit {{ $clinic['address'] }}.
                    </p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>
