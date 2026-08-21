[CmdletBinding()]
param(
    [switch]$Open,
    [switch]$SetDefault
)

$ErrorActionPreference = 'Stop'

$packageDirectory = Join-Path $PSScriptRoot 'diana-terminal'
$fragmentDirectory = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows Terminal\Fragments\DianaCodexTheme'
$fragmentFile = Join-Path $fragmentDirectory 'diana-terminal.json'
$imageFile = Join-Path $fragmentDirectory 'diana-terminal-bg-v2.png'
$legacyImageFile = Join-Path $fragmentDirectory 'diana-night-v3.png'
$shortcutDirectory = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Diana Terminal'

$terminalPackage = Get-AppxPackage -Name Microsoft.WindowsTerminal -ErrorAction SilentlyContinue
if ($terminalPackage -and ([version]$terminalPackage.Version -lt [version]'1.24.0.0')) {
    throw "Windows Terminal 1.24 or newer is required for local fragment media. Installed: $($terminalPackage.Version)"
}

$wtCommand = Get-Command wt.exe -ErrorAction SilentlyContinue
if (-not $wtCommand) {
    throw 'Windows Terminal (wt.exe) was not found.'
}
$wtPath = $wtCommand.Source

New-Item -ItemType Directory -Path $fragmentDirectory -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $packageDirectory 'diana-terminal.json') -Destination $fragmentFile -Force
Copy-Item -LiteralPath (Join-Path $packageDirectory 'diana-terminal-bg-v2.png') -Destination $imageFile -Force
if (Test-Path -LiteralPath $legacyImageFile) {
    Remove-Item -LiteralPath $legacyImageFile -Force
}

New-Item -ItemType Directory -Path $shortcutDirectory -Force | Out-Null
$shell = New-Object -ComObject WScript.Shell
foreach ($profileName in @('Diana PowerShell', 'Diana CMD')) {
    $shortcutPath = Join-Path $shortcutDirectory "$profileName.lnk"
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $wtPath
    $shortcut.Arguments = "-w new -p `"$profileName`""
    $shortcut.WorkingDirectory = $env:USERPROFILE
    $shortcut.Description = "Open the $profileName Windows Terminal profile"
    $shortcut.IconLocation = "$wtPath,0"
    $shortcut.Save()
}

if ($SetDefault) {
    & (Join-Path $PSScriptRoot 'set-diana-terminal-default.ps1') | Out-Null
}

$result = [pscustomobject]@{
    Installed = $true
    Scope = 'CurrentUser'
    FragmentDirectory = $fragmentDirectory
    Profiles = @('Diana PowerShell', 'Diana CMD')
    StartMenuShortcuts = @('Diana PowerShell', 'Diana CMD')
    DefaultProfile = if ($SetDefault) { 'Diana PowerShell' } else { 'unchanged' }
    BackgroundProcess = $false
}
$result | ConvertTo-Json -Depth 3

if ($Open) {
    $workingDirectory = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
    Start-Process -FilePath $wtPath -ArgumentList "-w new -p `"Diana PowerShell`" -d `"$workingDirectory`""
}
