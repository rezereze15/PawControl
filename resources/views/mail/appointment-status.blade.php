{{-- Appointment confirmed / rejected email. Vars: confirmed, name, details (label => value), reason. --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $confirmed ? 'Appointment confirmed' : 'Appointment not approved' }}</title>
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
                    <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:{{ $confirmed ? '#15803d' : '#b91c1c' }};">
                        {{ $confirmed ? 'Your appointment is confirmed' : 'Your appointment was not approved' }}
                    </p>
                    <p style="margin:0 0 20px;font-size:16px;line-height:1.5;">
                        {{ $confirmed ? "Good news! We've confirmed your payment and your appointment." : "Unfortunately, we couldn't approve your appointment." }}
                    </p>
                    @if (! $confirmed && ! empty($reason))
                    <p style="margin:0 0 20px;padding:12px 16px;background:#fef2f2;border-left:4px solid #b91c1c;border-radius:8px;font-size:15px;line-height:1.5;">
                        <strong>Reason:</strong> {{ $reason }}
                    </p>
                    @endif
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f4f1ff;border-radius:12px;">
                        @foreach ($details as $label => $value)
                        <tr>
                            <td style="padding:8px 16px;font-size:14px;color:#6b7280;">{{ $label }}</td>
                            <td style="padding:8px 16px;font-size:14px;font-weight:bold;color:#19043f;text-align:right;">{{ $value }}</td>
                        </tr>
                        @endforeach
                    </table>
                </td></tr>
                <tr><td style="padding:0 28px 28px;">
                    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                        {{ $confirmed ? 'Please arrive on time.' : 'You can book a new appointment from your PawControl dashboard.' }}
                    </p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>
