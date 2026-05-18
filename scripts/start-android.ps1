# Finds Android SDK / adb, sets ANDROID_HOME and PATH, runs: expo start --android
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$candidates = New-Object System.Collections.Generic.List[string]

function Add-Candidate([string]$path) {
  if ([string]::IsNullOrWhiteSpace($path)) { return }
  $normalized = $path.Trim().TrimEnd('\', '/')
  if ($normalized -and $candidates -notcontains $normalized) {
    [void]$candidates.Add($normalized)
  }
}

Add-Candidate $env:ANDROID_HOME
Add-Candidate $env:ANDROID_SDK_ROOT
Add-Candidate "$env:LOCALAPPDATA\Android\Sdk"
Add-Candidate "$env:USERPROFILE\AppData\Local\Android\Sdk"
Add-Candidate "${env:ProgramFiles(x86)}\Android\android-sdk"
Add-Candidate "$env:ProgramFiles\Android\Sdk"

foreach ($fullReg in @(
    'HKLM:\SOFTWARE\Android SDK Tools',
    'HKLM:\SOFTWARE\WOW6432Node\Android SDK Tools',
    'HKCU:\SOFTWARE\Android SDK Tools'
  )) {
  try {
    $prop = Get-ItemProperty -LiteralPath $fullReg -ErrorAction Stop
    if ($prop.Path) { Add-Candidate $prop.Path }
  }
  catch {}
}

$sdkRoot = $null
foreach ($c in $candidates) {
  $adb = Join-Path $c 'platform-tools\adb.exe'
  if (Test-Path -LiteralPath $adb) {
    $sdkRoot = $c
    break
  }
}

if (-not $sdkRoot) {
  Write-Host ''
  Write-Host 'Android SDK not found (missing platform-tools\adb.exe).' -ForegroundColor Red
  Write-Host 'Install Android Studio and SDK Platform-Tools:'
  Write-Host 'https://developer.android.com/studio' -ForegroundColor Cyan
  Write-Host ''
  Write-Host 'Default SDK folder after install:'
  Write-Host "  $env:LOCALAPPDATA\Android\Sdk"
  Write-Host ''
  Write-Host 'Without adb - use Expo Go (scan QR):'
  Write-Host '  npm run start' -ForegroundColor Yellow
  Write-Host '  npm run tunnel   (if phone cannot reach PC on LAN)' -ForegroundColor Yellow
  Write-Host ''
  exit 1
}

$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$platformTools = Join-Path $sdkRoot 'platform-tools'
$emulatorDir = Join-Path $sdkRoot 'emulator'
if (Test-Path -LiteralPath $emulatorDir) {
  $env:Path = "$platformTools;$emulatorDir;$env:Path"
}
else {
  $env:Path = "$platformTools;$env:Path"
}

Write-Host "ANDROID_HOME=$sdkRoot" -ForegroundColor Green

$npx = Get-Command npx.cmd -ErrorAction SilentlyContinue
if (-not $npx) {
  Write-Host 'npx not found. Install Node.js.' -ForegroundColor Red
  exit 1
}

& npx.cmd expo start --android @args
