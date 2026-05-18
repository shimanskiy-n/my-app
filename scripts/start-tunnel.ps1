# expo start --tunnel (ngrok/exp.direct often fails behind HTTP(S)_PROXY — clear for this session)
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path -Parent $PSScriptRoot)

foreach ($var in @('HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','http_proxy','https_proxy','all_proxy')) {
  if (Test-Path "Env:$var") {
    Remove-Item "Env:$var" -ErrorAction SilentlyContinue
  }
}

Write-Host ''
Write-Host 'If tunnel fails with "remote gone away": VPN off, retry, check https://status.ngrok.com/' -ForegroundColor DarkGray
Write-Host 'Same Wi-Fi as PC: npm run lan' -ForegroundColor DarkGray
Write-Host ''

& npx.cmd expo start --tunnel @args
exit $LASTEXITCODE
