[CmdletBinding()]
param(
    [ValidateSet('dark', 'light')]
    [string]$Variant = 'dark',
    [ValidateRange(1024, 65535)]
    [int]$Port = 9336,
    [switch]$RestartExisting,
    [switch]$Watch,
    [switch]$MaintainHost
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$themeFolder = if ($Variant -eq 'dark') { 'diana-dark' } else { 'diana-light' }
$projectVersion = (Get-Content -LiteralPath (Join-Path $repoRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
$packageName = if ($Variant -eq 'dark') {
    "diana-night-$projectVersion.codedrobe-theme"
} else {
    "diana-day-$projectVersion.codedrobe-theme"
}
$manifestPath = Join-Path $repoRoot "themes\$themeFolder\codedrobe.json"
$distFolder = Join-Path $repoRoot 'dist'
$packagePath = Join-Path $distFolder $packageName
$runtimeScript = (Resolve-Path -LiteralPath (Join-Path $repoRoot 'tools\diana-runtime.mjs')).Path
$runtimeFolder = Join-Path $repoRoot '.runtime'

function ConvertTo-WindowsCommandLineArgument {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Argument)

    if ($Argument.Length -gt 0 -and $Argument -notmatch '[\s"]') {
        return $Argument
    }

    $escaped = $Argument -replace '(\\*)"', '$1$1\"'
    $escaped = $escaped -replace '(\\+)$', '$1$1'
    return '"' + $escaped + '"'
}

function Stop-ExistingDianaWatchers {
    $escapedRuntime = [regex]::Escape($runtimeScript)
    $watchers = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue |
        Where-Object {
            $_.CommandLine -and
            $_.CommandLine -match $escapedRuntime -and
            $_.CommandLine -match '(?i)\sapply\s' -and
            $_.CommandLine -match '(?i)\s--watch(?:\s|$)'
        }

    foreach ($watcher in $watchers) {
        Stop-Process -Id $watcher.ProcessId -Force -ErrorAction SilentlyContinue
    }

    if ($watchers) {
        $deadline = (Get-Date).AddSeconds(5)
        do {
            $remaining = @($watchers | Where-Object {
                Get-Process -Id $_.ProcessId -ErrorAction SilentlyContinue
            })
            if (-not $remaining) { break }
            Start-Sleep -Milliseconds 100
        } while ((Get-Date) -lt $deadline)
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'node_modules\@codedrobe\core\package.json'))) {
    throw 'Dependencies are missing. Run npm install in the repository root first.'
}

New-Item -ItemType Directory -Path $distFolder -Force | Out-Null
& (Join-Path $repoRoot 'node_modules\.bin\codedrobe.cmd') theme pack $manifestPath --output $packagePath --force
if ($LASTEXITCODE -ne 0) { throw 'Theme packaging failed.' }

$arguments = @($runtimeScript, 'apply', '--theme', $packagePath, '--port', $Port)
if ($RestartExisting) { $arguments += '--restart-existing' }
if ($Watch) { $arguments += '--watch' }
if ($MaintainHost) {
    if (-not $Watch) { throw '-MaintainHost requires -Watch.' }
    $arguments += '--maintain-host'
}

if ($Watch) {
    New-Item -ItemType Directory -Path $runtimeFolder -Force | Out-Null
    Stop-ExistingDianaWatchers

    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $stdoutPath = Join-Path $runtimeFolder "diana-runtime-$timestamp.out.log"
    $stderrPath = Join-Path $runtimeFolder "diana-runtime-$timestamp.err.log"
    $nodePath = (Get-Command node.exe -ErrorAction Stop).Source
    $commandLine = ($arguments | ForEach-Object { ConvertTo-WindowsCommandLineArgument $_ }) -join ' '
    $runtimeProcess = Start-Process -FilePath $nodePath `
        -ArgumentList $commandLine `
        -WorkingDirectory $repoRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput $stdoutPath `
        -RedirectStandardError $stderrPath `
        -PassThru

    Start-Sleep -Milliseconds 800
    if ($runtimeProcess.HasExited) {
        $details = if (Test-Path -LiteralPath $stderrPath) {
            (Get-Content -LiteralPath $stderrPath -Raw -ErrorAction SilentlyContinue).Trim()
        } else { '' }
        throw "Diana runtime exited during startup (code $($runtimeProcess.ExitCode)). $details"
    }

    [ordered]@{
        pid = $runtimeProcess.Id
        variant = $Variant
        port = $Port
        startedAt = (Get-Date).ToString('o')
        stdout = $stdoutPath
        stderr = $stderrPath
        command = "$nodePath $commandLine"
    } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runtimeFolder 'diana-runtime.json') -Encoding utf8

    Write-Host "Diana $Variant runtime started in the background (PID $($runtimeProcess.Id))." -ForegroundColor Green
    Write-Host "Runtime state: $(Join-Path $runtimeFolder 'diana-runtime.json')"
    return
}

& node @arguments
if ($LASTEXITCODE -ne 0) { throw 'Theme application failed.' }

Write-Host "Diana $Variant theme enabled: $packagePath" -ForegroundColor Green
