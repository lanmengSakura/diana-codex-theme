[CmdletBinding()]
param(
    [string]$Version = '0.2.0'
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
$outputDirectory = Join-Path $repositoryRoot 'dist'
$outputPath = Join-Path $outputDirectory "diana-terminal-$Version.zip"
$releaseFiles = @(
    (Join-Path $PSScriptRoot 'README.md'),
    (Join-Path $PSScriptRoot 'install-independent.cmd'),
    (Join-Path $PSScriptRoot 'install-as-default.cmd'),
    (Join-Path $PSScriptRoot 'uninstall.cmd'),
    (Join-Path $PSScriptRoot 'install-diana-terminal.ps1'),
    (Join-Path $PSScriptRoot 'set-diana-terminal-default.ps1'),
    (Join-Path $PSScriptRoot 'uninstall-diana-terminal.ps1'),
    (Join-Path $PSScriptRoot 'diana-terminal'),
    (Join-Path $PSScriptRoot 'qa'),
    (Join-Path $repositoryRoot 'LICENSE'),
    (Join-Path $repositoryRoot 'ASSET_LICENSES.md')
)

foreach ($path in $releaseFiles) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Release input is missing: $path" }
}

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
Compress-Archive -LiteralPath $releaseFiles -DestinationPath $outputPath -CompressionLevel Optimal -Force

[pscustomobject]@{
    Output = $outputPath
    Version = $Version
    Bytes = (Get-Item -LiteralPath $outputPath).Length
    Sha256 = Get-Sha256 -Path $outputPath
} | ConvertTo-Json
