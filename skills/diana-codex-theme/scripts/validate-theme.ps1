[CmdletBinding()]
param(
    [string]$RepoRoot
)

$ErrorActionPreference = 'Stop'
$RepoRoot = if ($RepoRoot) {
    (Resolve-Path -LiteralPath $RepoRoot).Path
} else {
    (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..\..')).Path
}
$errors = [System.Collections.Generic.List[string]]::new()

function Add-ValidationError {
    param([string]$Message)
    $errors.Add($Message)
}

$requiredFiles = @(
    'README.md',
    'ASSET_LICENSES.md',
    'brand-spec.md',
    'preview\index.html',
    'preview\preview.css',
    'preview\preview.js',
    'themes\diana-dark\theme.json',
    'themes\diana-dark\theme.css',
    'themes\diana-light\theme.json',
    'themes\diana-light\theme.css',
    'package.json',
    'assets\diana-brand\derived\diana-corner-cutout-v2.png',
    'assets\diana-brand\derived\diana-night-v3.png',
    'assets\diana-brand\derived\diana-line-art-approved-upper.png',
    'assets\diana-brand\derived\diana-line-art-approved-lower.png',
    'tools\audit-legacy-cdp.ps1',
    'tools\remove-legacy-cdp.ps1',
    'tools\prepare-safe-release.ps1'
)

foreach ($relativePath in $requiredFiles) {
    $fullPath = Join-Path $RepoRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        Add-ValidationError "Missing required file: $relativePath"
    }
}

$manifestPaths = @(
    (Join-Path $RepoRoot 'themes\diana-dark\theme.json'),
    (Join-Path $RepoRoot 'themes\diana-light\theme.json')
)

foreach ($manifestPath in $manifestPaths) {
    if (-not (Test-Path -LiteralPath $manifestPath)) { continue }
    try {
        $manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    } catch {
        Add-ValidationError "Invalid JSON: $manifestPath"
        continue
    }

    if ($manifest.status -ne 'blueprint') {
        Add-ValidationError "Theme status must be blueprint: $manifestPath"
    }
    foreach ($field in @('accent', 'ink', 'surface')) {
        $value = $manifest.nativeAppearance.$field
        if ($value -notmatch '^#[0-9A-Fa-f]{6}$') {
            Add-ValidationError "Invalid color $field in $manifestPath"
        }
    }

    foreach ($asset in $manifest.assets.PSObject.Properties) {
        $assetPath = [System.IO.Path]::GetFullPath((Join-Path (Split-Path $manifestPath) $asset.Value))
        if (-not $assetPath.StartsWith($RepoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
            Add-ValidationError "Asset escapes repository: $manifestPath ($($asset.Name))"
        } elseif (-not (Test-Path -LiteralPath $assetPath -PathType Leaf)) {
            Add-ValidationError "Asset not found: $assetPath"
        }
    }

    $cssPath = Join-Path (Split-Path $manifestPath) $manifest.css
    if (-not (Test-Path -LiteralPath $cssPath -PathType Leaf)) {
        Add-ValidationError "CSS not found: $cssPath"
        continue
    }
    $css = Get-Content -LiteralPath $cssPath -Raw -Encoding UTF8
    if ($css -notmatch 'html\.diana-theme-host') {
        Add-ValidationError "CSS is not host-scoped: $cssPath"
    }
    if ($css -match 'https?://' -or $css -match '@import') {
        Add-ValidationError "Remote CSS or asset reference found: $cssPath"
    }
    if ($css -match '<script' -or $css -match 'javascript:') {
        Add-ValidationError "Executable content found: $cssPath"
    }
    if ($css -notmatch 'pointer-events:\s*none') {
        Add-ValidationError "Character layer must ignore pointer events: $cssPath"
    }
}

$imagePaths = @(
    (Join-Path $RepoRoot 'assets\diana-brand\derived\diana-corner-cutout-v2.png'),
    (Join-Path $RepoRoot 'assets\diana-brand\derived\diana-night-v3.png')
)
foreach ($imagePath in $imagePaths) {
if (Test-Path -LiteralPath $imagePath -PathType Leaf) {
    Add-Type -AssemblyName System.Drawing
    $bitmap = [System.Drawing.Bitmap]::FromFile($imagePath)
    try {
        $corners = @(
            $bitmap.GetPixel(0, 0),
            $bitmap.GetPixel($bitmap.Width - 1, 0),
            $bitmap.GetPixel(0, $bitmap.Height - 1),
            $bitmap.GetPixel($bitmap.Width - 1, $bitmap.Height - 1)
        )
        if (($corners | Where-Object { $_.A -ne 0 }).Count -gt 0) {
            Add-ValidationError "Character PNG corners are not fully transparent: $imagePath"
        }
    } finally {
        $bitmap.Dispose()
    }
}
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Host 'Diana theme validation passed.' -ForegroundColor Green
