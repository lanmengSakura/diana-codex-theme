[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$LegacyPort = 9336,
    [switch]$CloseCodex
)

$ErrorActionPreference = 'Stop'
$taskName = 'Diana Codex Theme'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path

Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue

$legacyWatchers = @(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine -match '(?i)diana-runtime\.mjs' -and
        $_.CommandLine -match '(?i)\s--watch(?:\s|$)'
    })
foreach ($watcher in $legacyWatchers) {
    Stop-Process -Id $watcher.ProcessId -Force -ErrorAction SilentlyContinue
}

foreach ($stateName in @('diana-runtime.json', 'diana-autostart.json')) {
    $statePath = Join-Path $repoRoot ".runtime\$stateName"
    if (Test-Path -LiteralPath $statePath -PathType Leaf) {
        Remove-Item -LiteralPath $statePath -Force
    }
}

$codexWithDebugPort = @(Get-CimInstance Win32_Process -Filter "Name = 'ChatGPT.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine -match '(?i)--remote-debugging-port(?:=|\s+)\d+'
    })

if ($CloseCodex) {
    foreach ($codexProcess in $codexWithDebugPort) {
        Stop-Process -Id $codexProcess.ProcessId -Force -ErrorAction SilentlyContinue
    }
}

Write-Host 'Legacy Diana watcher and scheduled task removed.' -ForegroundColor Green
if ($codexWithDebugPort.Count -gt 0 -and -not $CloseCodex) {
    Write-Host 'Codex is still running with a remote debugging port.' -ForegroundColor Yellow
    Write-Host 'Fully exit every Codex window/process, then reopen Codex from the normal Start menu.'
    Write-Host 'After reopening, run npm run security:audit.'
} elseif ($CloseCodex) {
    Write-Host 'Codex debug-port processes were closed. Reopen Codex from the normal Start menu.' -ForegroundColor Yellow
} else {
    Write-Host 'No Codex process with a remote debugging port remains.'
}

