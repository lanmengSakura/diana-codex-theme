[CmdletBinding()]
param(
    [ValidateSet('dark', 'light')]
    [string]$Variant = 'dark',
    [ValidateRange(1024, 65535)]
    [int]$Port = 9336,
    [switch]$Remove,
    [switch]$StartNow
)

$ErrorActionPreference = 'Stop'
$taskName = 'Diana Codex Theme'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$runtimeScript = (Resolve-Path -LiteralPath (Join-Path $repoRoot 'tools\diana-runtime.mjs')).Path
$runtimeFolder = Join-Path $repoRoot '.runtime'
$projectVersion = (Get-Content -LiteralPath (Join-Path $repoRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version

if ($Remove) {
    Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host 'Diana Codex Theme autostart removed.' -ForegroundColor Green
    return
}

$packageName = if ($Variant -eq 'dark') {
    "diana-night-$projectVersion.codedrobe-theme"
} else {
    "diana-day-$projectVersion.codedrobe-theme"
}
$packagePath = Join-Path $repoRoot "dist\$packageName"
if (-not (Test-Path -LiteralPath $packagePath)) {
    & (Join-Path $PSScriptRoot 'pack-themes.ps1')
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $packagePath)) {
        throw "Packaged theme not found after packaging: $packagePath"
    }
}

$nodePath = (Get-Command node.exe -ErrorAction Stop).Source

function ConvertTo-WindowsCommandLineArgument {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Argument)

    if ($Argument.Length -gt 0 -and $Argument -notmatch '[\s"]') {
        return $Argument
    }
    $escaped = $Argument -replace '(\\*)"', '$1$1\"'
    $escaped = $escaped -replace '(\\+)$', '$1$1'
    return '"' + $escaped + '"'
}

$runtimeArguments = @(
    $runtimeScript,
    'apply',
    '--theme',
    $packagePath,
    '--port',
    $Port,
    '--watch',
    '--maintain-host',
    '--service'
)
$argumentLine = ($runtimeArguments | ForEach-Object {
    ConvertTo-WindowsCommandLineArgument $_
}) -join ' '

$action = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument $argumentLine `
    -WorkingDirectory $repoRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$principal = New-ScheduledTaskPrincipal `
    -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
    -LogonType Interactive `
    -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit ([TimeSpan]::Zero) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -Hidden

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description 'Keeps the Diana Codex theme attached across app restarts.' `
    -Force | Out-Null

New-Item -ItemType Directory -Path $runtimeFolder -Force | Out-Null
[ordered]@{
    taskName = $taskName
    variant = $Variant
    port = $Port
    package = $packagePath
    installedAt = (Get-Date).ToString('o')
} | ConvertTo-Json | Set-Content `
    -LiteralPath (Join-Path $runtimeFolder 'diana-autostart.json') `
    -Encoding utf8

if ($StartNow) {
    Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    Start-ScheduledTask -TaskName $taskName
}

Write-Host "Diana $Variant autostart installed: $taskName" -ForegroundColor Green
if (-not $StartNow) {
    Write-Host 'It will start at the next Windows sign-in. Use -StartNow to activate it immediately.'
}
