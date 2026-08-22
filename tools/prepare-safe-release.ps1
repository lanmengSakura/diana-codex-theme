[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$distPath = Join-Path $repoRoot 'dist'
$packagePath = Join-Path $repoRoot 'package.json'
$package = Get-Content -LiteralPath $packagePath -Raw -Encoding UTF8 | ConvertFrom-Json

$forbiddenSourcePaths = @(
    'tools\diana-runtime.mjs',
    'tools\enable-diana-theme.ps1',
    'tools\install-diana-autostart.ps1',
    'tools\pack-themes.ps1',
    'themes\diana-dark\codedrobe.json',
    'themes\diana-light\codedrobe.json'
)
foreach ($relativePath in $forbiddenSourcePaths) {
    if (Test-Path -LiteralPath (Join-Path $repoRoot $relativePath)) {
        throw "Unsafe legacy release source is still present: $relativePath"
    }
}

$packageSource = Get-Content -LiteralPath $packagePath -Raw -Encoding UTF8
if ($packageSource -match '@codedrobe/core|\.codedrobe-theme|theme:(?:dark|light|autostart|switch|pack)') {
    throw 'package.json still exposes a legacy desktop injection path.'
}

$removed = [System.Collections.Generic.List[string]]::new()
if (Test-Path -LiteralPath $distPath -PathType Container) {
    $resolvedDist = (Resolve-Path -LiteralPath $distPath).Path
    $candidates = @(
        Get-ChildItem -LiteralPath $resolvedDist -File -Filter '*.codedrobe-theme'
        Get-ChildItem -LiteralPath $resolvedDist -File -Filter 'diana-codex-theme-skill-*.zip' |
            Where-Object Name -ne "diana-codex-theme-skill-$($package.version).zip"
    )

    foreach ($candidate in $candidates) {
        if ($candidate.DirectoryName -ne $resolvedDist) {
            throw "Refusing to remove artifact outside dist: $($candidate.FullName)"
        }
        $removed.Add($candidate.Name)
        Remove-Item -LiteralPath $candidate.FullName -Force
    }
}

[pscustomobject]@{
    status = 'safe'
    version = $package.version
    removedLegacyArtifacts = @($removed)
} | ConvertTo-Json -Depth 3

