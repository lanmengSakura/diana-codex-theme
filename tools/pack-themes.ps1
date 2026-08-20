[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$codedrobe = Join-Path $repoRoot 'node_modules\.bin\codedrobe.cmd'
$dist = Join-Path $repoRoot 'dist'
$projectVersion = (Get-Content -LiteralPath (Join-Path $repoRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version

if (-not (Test-Path -LiteralPath $codedrobe)) {
    throw 'Dependencies are missing. Run npm install first.'
}

New-Item -ItemType Directory -Path $dist -Force | Out-Null
$packages = @(
    @('themes\diana-dark\codedrobe.json', "diana-night-$projectVersion.codedrobe-theme"),
    @('themes\diana-light\codedrobe.json', "diana-day-$projectVersion.codedrobe-theme")
)

foreach ($package in $packages) {
    $manifest = Join-Path $repoRoot $package[0]
    $output = Join-Path $dist $package[1]
    & $codedrobe theme pack $manifest --output $output --force
    if ($LASTEXITCODE -ne 0) { throw "Theme packaging failed: $manifest" }
}

Write-Host "Packed Diana Night and Diana Day into $dist" -ForegroundColor Green
