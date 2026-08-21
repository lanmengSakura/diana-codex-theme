[CmdletBinding()]
param(
    [string]$Version
)

$ErrorActionPreference = 'Stop'

function Get-Sha256 {
    param([Parameter(Mandatory)] [string]$Path)
    $stream = [System.IO.File]::OpenRead($Path)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        return ([System.BitConverter]::ToString($sha256.ComputeHash($stream))).Replace('-', '').ToLowerInvariant()
    }
    finally {
        $sha256.Dispose()
        $stream.Dispose()
    }
}

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not $Version) {
    $Version = (Get-Content -LiteralPath (Join-Path $repositoryRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
}
$skillDirectory = Join-Path $repositoryRoot 'skills\diana-codex-theme'
$outputDirectory = Join-Path $repositoryRoot 'dist'
$outputPath = Join-Path $outputDirectory "diana-codex-theme-skill-$Version.zip"

if (-not (Test-Path -LiteralPath (Join-Path $skillDirectory 'SKILL.md'))) {
    throw 'The Diana skill entrypoint is missing.'
}

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
Compress-Archive -LiteralPath $skillDirectory -DestinationPath $outputPath -CompressionLevel Optimal -Force

[pscustomobject]@{
    Output = $outputPath
    Version = $Version
    Bytes = (Get-Item -LiteralPath $outputPath).Length
    Sha256 = Get-Sha256 -Path $outputPath
} | ConvertTo-Json
