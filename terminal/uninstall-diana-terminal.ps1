[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$fragmentDirectory = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows Terminal\Fragments\DianaCodexTheme'
$shortcutDirectory = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Diana Terminal'
$managedFiles = @(
    (Join-Path $fragmentDirectory 'diana-terminal.json'),
    (Join-Path $fragmentDirectory 'diana-terminal-bg-v2.png'),
    (Join-Path $fragmentDirectory 'diana-night-v3.png')
)

& (Join-Path $PSScriptRoot 'set-diana-terminal-default.ps1') -Restore | Out-Null

foreach ($file in $managedFiles) {
    if (Test-Path -LiteralPath $file) {
        Remove-Item -LiteralPath $file -Force
    }
}

if ((Test-Path -LiteralPath $fragmentDirectory) -and -not (Get-ChildItem -LiteralPath $fragmentDirectory -Force | Select-Object -First 1)) {
    Remove-Item -LiteralPath $fragmentDirectory -Force
}

foreach ($shortcutName in @('Diana PowerShell.lnk', 'Diana CMD.lnk')) {
    $shortcutPath = Join-Path $shortcutDirectory $shortcutName
    if (Test-Path -LiteralPath $shortcutPath) {
        Remove-Item -LiteralPath $shortcutPath -Force
    }
}
if ((Test-Path -LiteralPath $shortcutDirectory) -and -not (Get-ChildItem -LiteralPath $shortcutDirectory -Force | Select-Object -First 1)) {
    Remove-Item -LiteralPath $shortcutDirectory -Force
}

[pscustomobject]@{
    Installed = $false
    Scope = 'CurrentUser'
    FragmentDirectory = $fragmentDirectory
    StartMenuShortcuts = $false
} | ConvertTo-Json
