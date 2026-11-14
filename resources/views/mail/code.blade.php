{{-- Shared 6-digit code email (registration + password reset). Vars: heading, intro, code, expiresInMinutes, footer, name (optional). --}}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $heading }}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#151b2a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
                    <tr>
                        <td style="background:#19043f;padding:20px 28px;border-bottom:5px solid #ffbb50;">
                            <span style="color:#ffffff;font-size:20px;font-weight:bold;">PawControl</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px 28px 12px;">
                            @if (! empty($name))
                            <p style="margin:0 0 12px;font-size:16px;">Hi {{ $name }},</p>
                            @endif
                            <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#19043f;">{{ $heading }}</p>
                            <p style="margin:0 0 24px;font-size:16px;line-height:1.5;">
                                {{ $intro }}
                            </p>
                            <div style="text-align:center;margin:0 0 24px;">
                                <span style="display:inline-block;padding:16px 24px;background:#f4f1ff;border:2px solid #19043f;border-radius:12px;font-size:34px;font-weight:bold;letter-spacing:10px;font-family:'Courier New',Courier,monospace;color:#19043f;">{{ $code }}</span>
                            </div>
                            <p style="margin:0 0 8px;font-size:15px;text-align:center;font-weight:bold;">
                                This code expires in {{ $expiresInMinutes }} minutes.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:12px 28px 28px;">
                            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">
                                {{ $footer }} Never share this code with anyone.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
