[CmdletBinding()]
param(
    [switch]$Restore
)

$ErrorActionPreference = 'Stop'

$dianaProfileGuid = '{9f604e64-7bc5-4f8a-9d55-7fe0a6fe27d1}'
$fragmentDirectory = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows Terminal\Fragments\DianaCodexTheme'
$statePath = Join-Path $fragmentDirectory 'diana-terminal.state'
$terminalPackage = Get-AppxPackage -Name Microsoft.WindowsTerminal -ErrorAction Stop
$settingsPath = Join-Path $env:LOCALAPPDATA "Packages\$($terminalPackage.PackageFamilyName)\LocalState\settings.json"

if (-not (Test-Path -LiteralPath $settingsPath)) {
    throw "Windows Terminal settings were not found: $settingsPath"
}

function Get-DefaultProfile {
    param([Parameter(Mandatory)] [string]$Text)
    $match = [regex]::Match($Text, '"defaultProfile"\s*:\s*"([^"]+)"')
    if ($match.Success) { return $match.Groups[1].Value }
    return $null
}

function Set-DefaultProfile {
    param(
        [Parameter(Mandatory)] [string]$Path,
        [Parameter(Mandatory)] [string]$ProfileGuid
    )

    $text = [System.IO.File]::ReadAllText($Path)
    $pattern = [regex]'(?<prefix>"defaultProfile"\s*:\s*)"[^"]+"'
    if ($pattern.IsMatch($text)) {
        $updated = $pattern.Replace($text, { param($match) $match.Groups['prefix'].Value + '"' + $ProfileGuid + '"' }, 1)
    }
    else {
        $newline = if ($text.Contains("`r`n")) { "`r`n" } else { "`n" }
        $openingBrace = $text.IndexOf('{')
        if ($openingBrace -lt 0) { throw 'Windows Terminal settings are not a JSON object.' }
        $updated = $text.Insert($openingBrace + 1, "$newline    `"defaultProfile`": `"$ProfileGuid`",$newline")
    }
    [System.IO.File]::WriteAllText($Path, $updated, (New-Object System.Text.UTF8Encoding $false))
}

$settingsText = [System.IO.File]::ReadAllText($settingsPath)
$currentDefault = Get-DefaultProfile -Text $settingsText

if ($Restore) {
    $restored = $false
    if (Test-Path -LiteralPath $statePath) {
        $state = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($currentDefault -eq $dianaProfileGuid -and $state.PreviousDefaultProfile) {
            Set-DefaultProfile -Path $settingsPath -ProfileGuid $state.PreviousDefaultProfile
            $restored = $true
        }
        Remove-Item -LiteralPath $statePath -Force
    }

    [pscustomobject]@{
        DefaultProfile = if ($restored) { $state.PreviousDefaultProfile } else { $currentDefault }
        Restored = $restored
        SettingsPath = $settingsPath
    } | ConvertTo-Json
    return
}

New-Item -ItemType Directory -Path $fragmentDirectory -Force | Out-Null
if (-not (Test-Path -LiteralPath $statePath)) {
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupPath = "$settingsPath.diana-$timestamp.bak"
    Copy-Item -LiteralPath $settingsPath -Destination $backupPath
    [pscustomobject]@{
        PreviousDefaultProfile = $currentDefault
        DianaDefaultProfile = $dianaProfileGuid
        SettingsPath = $settingsPath
        BackupPath = $backupPath
        InstalledAt = (Get-Date).ToString('o')
    } | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8
}

Set-DefaultProfile -Path $settingsPath -ProfileGuid $dianaProfileGuid

[pscustomobject]@{
    DefaultProfile = $dianaProfileGuid
    PreviousDefaultProfile = $currentDefault
    SettingsPath = $settingsPath
    StatePath = $statePath
    IsSystemWide = $false
} | ConvertTo-Json
