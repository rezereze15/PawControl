# Opens PawControl to your phone (or anyone with the link) through a free Cloudflare quick tunnel.
#
#   1. Keep your app running as usual:   composer dev   (or: php artisan serve)
#   2. In another terminal run:          powershell -ExecutionPolicy Bypass -File scripts\tunnel.ps1
#   3. Press Ctrl+C in that terminal to stop; the Vite dev server is put back automatically.
#
# While the tunnel is open this script builds the frontend and keeps public\hot set aside, so pages
# use the built assets (the Vite dev server's http://<ip>:5173 assets are blocked on the https page).
#
# Google sign-in: GoogleAuthController sends Google the tunnel's own callback URL (local env only),
# so .env is not touched. Add the printed callback URL to Google Cloud Console once per tunnel URL.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$hot = Join-Path $root 'public\hot'
$hotAside = Join-Path $root 'public\hot.tunnel'
$port = 8000

function Hide-ViteHotFile {
    if (Test-Path $hot) { Move-Item $hot $hotAside -Force }
}

# Find cloudflared even if this terminal was opened before it was installed.
$cloudflared = (Get-Command cloudflared -ErrorAction SilentlyContinue).Source
if (-not $cloudflared) {
    $cloudflared = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'
    if (-not (Test-Path $cloudflared)) {
        throw 'cloudflared not found. Install it with: winget install --id Cloudflare.cloudflared -e'
    }
}

if (-not (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue)) {
    Write-Host "`nNothing is running on port $port. Start the app first: composer dev  (or: php artisan serve)" -ForegroundColor Yellow
    exit 1
}

Write-Host 'Building the frontend (npm run build)...'
Push-Location $root
try {
    npm run build | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'npm run build failed. Run it yourself to see the error.' }
}
finally { Pop-Location }

$log = Join-Path $env:TEMP 'pawcontrol-cloudflared.log'
Remove-Item $log -ErrorAction SilentlyContinue
$proc = $null

try {
    Hide-ViteHotFile

    Write-Host 'Starting Cloudflare tunnel...'
    $proc = Start-Process -FilePath $cloudflared `
        -ArgumentList 'tunnel', '--url', "http://127.0.0.1:$port" `
        -RedirectStandardError $log -NoNewWindow -PassThru

    $url = $null
    for ($i = 0; $i -lt 60 -and -not $url; $i++) {
        Start-Sleep -Milliseconds 500
        if ($proc.HasExited) {
            $reason = Get-Content $log -Tail 1 -ErrorAction SilentlyContinue
            if ($reason -match '429') { $reason += "`n(429 = Cloudflare is rate-limiting free quick tunnels. Wait 5-10 minutes and try again.)" }
            throw "cloudflared exited early:`n$reason"
        }
        if (Test-Path $log) {
            $m = Select-String -Path $log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' | Select-Object -First 1
            if ($m) { $url = $m.Matches[0].Value }
        }
    }
    if (-not $url) { throw "Timed out waiting for the tunnel URL. See $log" }

    $callback = "$url/auth/google/callback"
    try { Set-Clipboard -Value $callback } catch {}

    Write-Host ''
    Write-Host "  Open on your phone:  $url" -ForegroundColor Green
    Write-Host ''
    Write-Host '  For Google sign-in, add this to Google Cloud Console > APIs & Services >'
    Write-Host '  Credentials > your OAuth client > Authorized redirect URIs (copied to clipboard):'
    Write-Host "      $callback" -ForegroundColor Cyan
    Write-Host '  Save, then allow a few minutes before trying Google sign-in.'
    Write-Host ''
    Write-Host '  Frontend changes need a restart of this script to show up (no live reload over the tunnel).'
    Write-Host '  Press Ctrl+C to stop the tunnel.'

    # Vite rewrites public\hot whenever it restarts; keep it aside while the tunnel is open.
    while (-not $proc.HasExited) {
        Hide-ViteHotFile
        Start-Sleep -Seconds 1
    }
}
finally {
    if ($proc -and -not $proc.HasExited) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
    if (Test-Path $hotAside) {
        # Only bring the dev server back if it is still running.
        if ((Get-NetTCPConnection -State Listen -LocalPort 5173 -ErrorAction SilentlyContinue) -and -not (Test-Path $hot)) {
            Move-Item $hotAside $hot -Force
        }
        else {
            Remove-Item $hotAside -Force
        }
    }
    Write-Host "`nTunnel closed."
}
