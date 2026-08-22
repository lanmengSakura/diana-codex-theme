[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int]$LegacyPort = 9336,
    [switch]$Json
)

$ErrorActionPreference = 'SilentlyContinue'
$taskName = 'Diana Codex Theme'

$legacyWatchers = @(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine -match '(?i)diana-runtime\.mjs' -and
        $_.CommandLine -match '(?i)\s--watch(?:\s|$)'
    })

$codexWithDebugPort = @(Get-CimInstance Win32_Process -Filter "Name = 'ChatGPT.exe'" |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine -match '(?i)--remote-debugging-port(?:=|\s+)\d+'
    })

$listeners = @(Get-NetTCPConnection -State Listen |
    Where-Object { $_.LocalPort -eq $LegacyPort })
$scheduledTask = Get-ScheduledTask -TaskName $taskName

$result = [ordered]@{
    safe = [bool](
        $legacyWatchers.Count -eq 0 -and
        $codexWithDebugPort.Count -eq 0 -and
        $listeners.Count -eq 0 -and
        -not $scheduledTask
    )
    legacyWatcherCount = $legacyWatchers.Count
    legacyWatcherPids = @($legacyWatchers | ForEach-Object ProcessId)
    codexDebugPortCount = $codexWithDebugPort.Count
    codexDebugPortPids = @($codexWithDebugPort | ForEach-Object ProcessId)
    legacyPort = $LegacyPort
    legacyPortListening = [bool]$listeners.Count
    legacyPortAddresses = @($listeners | ForEach-Object LocalAddress | Select-Object -Unique)
    legacyAutostartInstalled = [bool]$scheduledTask
}

if ($Json) {
    $result | ConvertTo-Json -Depth 4
    return
}

if ($result.safe) {
    Write-Host 'Diana security audit: SAFE' -ForegroundColor Green
    Write-Host 'No legacy watcher, Codex debug-port launch, listener, or Diana scheduled task was found.'
    return
}

Write-Host 'Diana security audit: LEGACY CDP EXPOSURE DETECTED' -ForegroundColor Red
$result.GetEnumerator() | Where-Object Key -ne 'safe' | ForEach-Object {
    '{0,-28} {1}' -f $_.Key, ($_.Value -join ', ')
}
Write-Host ''
Write-Host 'Run npm run security:remove-legacy, then fully exit and reopen Codex normally.' -ForegroundColor Yellow

