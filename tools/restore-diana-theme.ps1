[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 9336,
    [switch]$RemoveAutostart
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runtimeScript = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot 'diana-runtime.mjs')).Path

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'node_modules\@codedrobe\core\package.json'))) {
    throw 'Dependencies are missing. Run npm install in the repository root first.'
}

$escapedRuntime = [regex]::Escape($runtimeScript)
Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine -match $escapedRuntime -and
        $_.CommandLine -match '(?i)\sapply\s' -and
        $_.CommandLine -match '(?i)\s--watch(?:\s|$)'
    } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

if ($RemoveAutostart) {
    & (Join-Path $PSScriptRoot 'install-diana-autostart.ps1') -Remove
}

& node $runtimeScript restore --port $Port
if ($LASTEXITCODE -ne 0) { throw 'Theme restore failed.' }

Write-Host 'Codex native appearance restored.' -ForegroundColor Green
