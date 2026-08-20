[CmdletBinding()]
param(
    [ValidateSet('dark', 'light')]
    [string]$Variant = 'dark',
    [int]$DelaySeconds = 3
)

$ErrorActionPreference = 'Stop'
Start-Sleep -Seconds $DelaySeconds

$enableScript = Join-Path $PSScriptRoot 'enable-diana-theme.ps1'
& $enableScript `
    -Variant $Variant `
    -RestartExisting `
    -Watch `
    -MaintainHost

exit $LASTEXITCODE
