[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$packageDirectory = Join-Path $PSScriptRoot 'diana-terminal'
$fragmentPath = Join-Path $packageDirectory 'diana-terminal.json'
$imagePath = Join-Path $packageDirectory 'diana-terminal-bg-v2.png'

if (-not (Test-Path -LiteralPath $fragmentPath)) {
    throw 'Fragment JSON is missing.'
}
if (-not (Test-Path -LiteralPath $imagePath)) {
    throw 'Background image is missing.'
}

Add-Type -AssemblyName System.Drawing
$background = New-Object System.Drawing.Bitmap $imagePath
try {
    if ($background.Width -ne 1920 -or $background.Height -ne 1080) {
        throw 'Terminal background must remain a 1920x1080 composition.'
    }

    for ($x = 0; $x -lt 960; $x += 24) {
        for ($y = 0; $y -lt 1080; $y += 24) {
            if ($background.GetPixel($x, $y).A -ne 0) {
                throw 'The left text-dense half of the terminal background must remain transparent.'
            }
        }
    }
}
finally {
    $background.Dispose()
}

$fragment = Get-Content -LiteralPath $fragmentPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($fragment.profiles.Count -ne 2) {
    throw 'Expected exactly two terminal profiles.'
}
if ($fragment.schemes.Count -ne 1 -or $fragment.schemes[0].name -ne 'Diana Night') {
    throw 'Expected the Diana Night color scheme.'
}

$names = @($fragment.profiles | ForEach-Object { $_.name })
if ($names -notcontains 'Diana PowerShell' -or $names -notcontains 'Diana CMD') {
    throw 'Required Diana profiles are missing.'
}

$guids = @($fragment.profiles | ForEach-Object { $_.guid })
if (($guids | Select-Object -Unique).Count -ne $guids.Count) {
    throw 'Profile GUIDs must be unique.'
}

foreach ($profile in $fragment.profiles) {
    if ($profile.colorScheme -ne 'Diana Night') { throw "Unexpected scheme for $($profile.name)." }
    if ($profile.backgroundImage -ne 'diana-terminal-bg-v2.png') { throw "Unexpected background for $($profile.name)." }
    if ($profile.backgroundImageOpacity -ne 1.0) { throw "Baked alpha must control background visibility for $($profile.name)." }
    if ($profile.opacity -ne 100 -or $profile.useAcrylic -ne $false) { throw "Performance-safe opacity settings changed for $($profile.name)." }
}

$jsonText = Get-Content -LiteralPath $fragmentPath -Raw -Encoding UTF8
if ($jsonText -match 'https?://') {
    throw 'Remote resources are not allowed in the terminal fragment.'
}

[pscustomobject]@{
    Valid = $true
    Profiles = $names
    Scheme = 'Diana Night'
    BackgroundBytes = (Get-Item -LiteralPath $imagePath).Length
} | ConvertTo-Json -Depth 3
