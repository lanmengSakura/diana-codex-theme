[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 9336,
    [switch]$Json
)

$ErrorActionPreference = 'SilentlyContinue'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runtimeScript = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot 'diana-runtime.mjs')).Path
$statePath = Join-Path $repoRoot '.runtime\diana-runtime.json'
$escapedRuntime = [regex]::Escape($runtimeScript)

$watchers = @(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine -match $escapedRuntime -and
        $_.CommandLine -match '(?i)\sapply\s' -and
        $_.CommandLine -match '(?i)\s--watch(?:\s|$)'
    })

$watcherMemory = 0
foreach ($watcher in $watchers) {
    $process = Get-Process -Id $watcher.ProcessId
    if ($process) { $watcherMemory += $process.WorkingSet64 }
}

$codexMain = @(Get-CimInstance Win32_Process -Filter "Name = 'ChatGPT.exe'" |
    Where-Object { $_.CommandLine -and $_.CommandLine -notmatch '--type=' })
$cdpOwner = Get-NetTCPConnection -LocalPort $Port -State Listen | Select-Object -First 1

$targets = @()
foreach ($hostName in @('127.0.0.1', 'localhost')) {
    try {
        $targets = @(Invoke-RestMethod -Uri "http://${hostName}:$Port/json/list" -TimeoutSec 2)
        if ($targets.Count) { break }
    } catch {}
}

$state = $null
if (Test-Path -LiteralPath $statePath) {
    try { $state = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8 | ConvertFrom-Json } catch {}
}

$appManager = @(Get-CimInstance Win32_Process -Filter "Name = 'codex-app-manager.exe'")
$result = [ordered]@{
    active = [bool]($watchers.Count -eq 1 -and $targets.Count -gt 0)
    variant = if ($state.variant) { $state.variant } else { $null }
    port = $Port
    watcherCount = $watchers.Count
    watcherPids = @($watchers | ForEach-Object { $_.ProcessId })
    watcherMemoryMB = [math]::Round($watcherMemory / 1MB, 1)
    rendererTargets = $targets.Count
    cdpListening = [bool]$cdpOwner
    cdpOwnerPid = if ($cdpOwner) { $cdpOwner.OwningProcess } else { $null }
    codexMainPids = @($codexMain | ForEach-Object { $_.ProcessId })
    codexHasDianaPort = [bool]($codexMain | Where-Object { $_.CommandLine -match "--remote-debugging-port=$Port(?:\s|$)" })
    codexAppManagerCount = $appManager.Count
}

if ($Json) {
    $result | ConvertTo-Json -Depth 4
    return
}

$status = if ($result.active) { 'ACTIVE' } else { 'INACTIVE' }
Write-Host "Diana runtime: $status" -ForegroundColor $(if ($result.active) { 'Green' } else { 'Yellow' })
$result.GetEnumerator() | Where-Object Key -ne 'active' | ForEach-Object {
    '{0,-24} {1}' -f $_.Key, ($_.Value -join ', ')
}
