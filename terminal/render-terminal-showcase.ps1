[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$edgeCandidates = @(
    (Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),
    (Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe')
)
$edgePath = $edgeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $edgePath) { throw 'Microsoft Edge was not found.' }

$htmlPath = (Resolve-Path (Join-Path $PSScriptRoot 'showcase.html')).Path
$outputPath = Join-Path $PSScriptRoot 'qa\terminal-readme-1600x900.png'
$profileDirectory = Join-Path $env:TEMP "diana-terminal-render-$([guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $profileDirectory | Out-Null

try {
    $htmlUri = ([uri]$htmlPath).AbsoluteUri
    & $edgePath `
        '--headless=new' `
        '--disable-gpu' `
        '--hide-scrollbars' `
        "--user-data-dir=$profileDirectory" `
        '--window-size=1600,900' `
        "--screenshot=$outputPath" `
        $htmlUri | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Edge screenshot failed with exit code $LASTEXITCODE." }
    if (-not (Test-Path -LiteralPath $outputPath)) { throw 'Terminal screenshot was not created.' }
}
finally {
    $resolvedTemp = [System.IO.Path]::GetFullPath($profileDirectory)
    $resolvedRoot = [System.IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
    if ($resolvedTemp.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase) -and
        [System.IO.Path]::GetFileName($resolvedTemp).StartsWith('diana-terminal-render-')) {
        Remove-Item -LiteralPath $resolvedTemp -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile($outputPath)
try {
    if ($image.Width -ne 1600 -or $image.Height -ne 900) {
        throw "Unexpected screenshot size: $($image.Width)x$($image.Height)."
    }
}
finally {
    $image.Dispose()
}

[pscustomobject]@{
    Output = $outputPath
    Width = 1600
    Height = 900
    ContainsPrivateUserData = $false
} | ConvertTo-Json
