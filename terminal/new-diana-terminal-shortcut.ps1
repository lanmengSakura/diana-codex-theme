[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$CommandPath,

    [ValidateSet('Auto', 'CMD', 'PowerShell')]
    [string]$Shell = 'Auto',

    [string]$ShortcutPath,
    [string]$Name,
    [string]$WorkingDirectory,
    [string[]]$CommandArgument = @()
)

$ErrorActionPreference = 'Stop'

function ConvertTo-WindowsArgument {
    param([AllowEmptyString()] [string]$Value)

    if ($Value.Length -eq 0) {
        return '""'
    }

    if ($Value -notmatch '[\s"]') {
        return $Value
    }

    $builder = [System.Text.StringBuilder]::new()
    [void]$builder.Append('"')
    $backslashes = 0

    foreach ($character in $Value.ToCharArray()) {
        if ($character -eq '\') {
            $backslashes++
            continue
        }

        if ($character -eq '"') {
            [void]$builder.Append(('\' * (($backslashes * 2) + 1)))
            [void]$builder.Append('"')
        }
        else {
            if ($backslashes -gt 0) {
                [void]$builder.Append(('\' * $backslashes))
            }
            [void]$builder.Append($character)
        }
        $backslashes = 0
    }

    if ($backslashes -gt 0) {
        [void]$builder.Append(('\' * ($backslashes * 2)))
    }
    [void]$builder.Append('"')
    return $builder.ToString()
}

function Join-WindowsArguments {
    param([Parameter(Mandatory)] [string[]]$ArgumentList)
    return (($ArgumentList | ForEach-Object { ConvertTo-WindowsArgument -Value $_ }) -join ' ')
}

$fragmentFile = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows Terminal\Fragments\DianaCodexTheme\diana-terminal.json'
if (-not (Test-Path -LiteralPath $fragmentFile)) {
    throw 'Diana Terminal is not installed. Run install-independent.cmd or npm run terminal:install first.'
}

$wtCommand = Get-Command wt.exe -ErrorAction SilentlyContinue
if (-not $wtCommand) {
    throw 'Windows Terminal (wt.exe) was not found.'
}

$resolvedCommand = (Resolve-Path -LiteralPath $CommandPath).Path
$extension = [System.IO.Path]::GetExtension($resolvedCommand).ToLowerInvariant()
if ($Shell -eq 'Auto') {
    $Shell = switch ($extension) {
        '.cmd' { 'CMD' }
        '.bat' { 'CMD' }
        '.ps1' { 'PowerShell' }
        default { throw "Auto detection supports .cmd, .bat, and .ps1 files. Choose -Shell explicitly for: $resolvedCommand" }
    }
}

if (-not $Name) {
    $Name = "$([System.IO.Path]::GetFileNameWithoutExtension($resolvedCommand)) (Diana)"
}

if (-not $WorkingDirectory) {
    $WorkingDirectory = Split-Path -Parent $resolvedCommand
}
else {
    $WorkingDirectory = (Resolve-Path -LiteralPath $WorkingDirectory).Path
}

if (-not $ShortcutPath) {
    $shortcutDirectory = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Diana Terminal'
    $ShortcutPath = Join-Path $shortcutDirectory "$Name.lnk"
}
elseif ([System.IO.Path]::GetExtension($ShortcutPath) -ne '.lnk') {
    $ShortcutPath = "$ShortcutPath.lnk"
}

$shortcutParent = Split-Path -Parent $ShortcutPath
if ($shortcutParent) {
    New-Item -ItemType Directory -Path $shortcutParent -Force | Out-Null
}

if ($Shell -eq 'CMD') {
    $profileName = 'Diana CMD'
    $terminalCommand = @('cmd.exe', '/d', '/k', 'call', $resolvedCommand) + $CommandArgument
}
else {
    $profileName = 'Diana PowerShell'
    $terminalCommand = @('pwsh.exe', '-NoLogo', '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', $resolvedCommand) + $CommandArgument
}

$windowArguments = @('-w', 'new', '-p', $profileName, '-d', $WorkingDirectory) + $terminalCommand
$shellObject = New-Object -ComObject WScript.Shell
$shortcut = $shellObject.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = $wtCommand.Source
$shortcut.Arguments = Join-WindowsArguments -ArgumentList $windowArguments
$shortcut.WorkingDirectory = $WorkingDirectory
$shortcut.Description = "Open $Name in the $profileName profile"
$shortcut.IconLocation = "$($wtCommand.Source),0"
$shortcut.Save()

[pscustomobject]@{
    Created = $true
    Shortcut = (Resolve-Path -LiteralPath $ShortcutPath).Path
    Profile = $profileName
    Command = $resolvedCommand
    WorkingDirectory = $WorkingDirectory
    BackgroundProcess = $false
} | ConvertTo-Json -Depth 3
