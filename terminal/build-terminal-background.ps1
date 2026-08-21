[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$assetDirectory = Join-Path $repositoryRoot 'assets\diana-brand\derived'
$outputPath = Join-Path $PSScriptRoot 'diana-terminal\diana-terminal-bg-v2.png'

function Draw-TransparentImage {
    param(
        [Parameter(Mandatory)] [System.Drawing.Graphics]$Graphics,
        [Parameter(Mandatory)] [string]$Path,
        [Parameter(Mandatory)] [System.Drawing.Rectangle]$Destination,
        [Parameter(Mandatory)] [double]$Opacity,
        [double]$Brightness = 1.0,
        [double]$Rotation = 0,
        [string]$TintHex,
        [switch]$FlipHorizontal
    )

    $image = [System.Drawing.Image]::FromFile($Path)
    if ($FlipHorizontal) {
        $image.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)
    }
    $attributes = New-Object System.Drawing.Imaging.ImageAttributes
    $matrix = New-Object System.Drawing.Imaging.ColorMatrix
    $matrix.Matrix00 = [single]$Brightness
    $matrix.Matrix11 = [single]$Brightness
    $matrix.Matrix22 = [single]$Brightness
    $matrix.Matrix33 = [single]$Opacity
    if ($TintHex) {
        $tint = [System.Drawing.ColorTranslator]::FromHtml($TintHex)
        $matrix.Matrix00 = 0
        $matrix.Matrix11 = 0
        $matrix.Matrix22 = 0
        $matrix.Matrix40 = [single]($tint.R / 255)
        $matrix.Matrix41 = [single]($tint.G / 255)
        $matrix.Matrix42 = [single]($tint.B / 255)
    }
    $attributes.SetColorMatrix($matrix, [System.Drawing.Imaging.ColorMatrixFlag]::Default, [System.Drawing.Imaging.ColorAdjustType]::Bitmap)
    $graphicsState = $null
    try {
        if ($Rotation -ne 0) {
            $graphicsState = $Graphics.Save()
            $centerX = $Destination.X + ($Destination.Width / 2)
            $centerY = $Destination.Y + ($Destination.Height / 2)
            $Graphics.TranslateTransform($centerX, $centerY)
            $Graphics.RotateTransform([single]$Rotation)
            $Graphics.TranslateTransform(-$centerX, -$centerY)
        }
        $Graphics.DrawImage(
            $image,
            $Destination,
            0,
            0,
            $image.Width,
            $image.Height,
            [System.Drawing.GraphicsUnit]::Pixel,
            $attributes
        )
    }
    finally {
        if ($graphicsState) {
            $Graphics.Restore($graphicsState)
        }
        $attributes.Dispose()
        $image.Dispose()
    }
}

$canvas = New-Object System.Drawing.Bitmap 1920, 1080, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

try {
    # Current Diana Night right-top line: same asset, color, scale and opacity as the desktop theme.
    Draw-TransparentImage `
        -Graphics $graphics `
        -Path (Join-Path $assetDirectory 'diana-line-art-approved-upper.png') `
        -Destination (New-Object System.Drawing.Rectangle 1552, 44, 350, 225) `
        -Opacity 0.27 `
        -TintHex '#D86E91'

    # Scale the desktop 440x720 ornament container to 354x579 and preserve its percentages.
    Draw-TransparentImage `
        -Graphics $graphics `
        -Path (Join-Path $assetDirectory 'diana-hand-star-reference-v2.png') `
        -Destination (New-Object System.Drawing.Rectangle 1549, 742, 27, 27) `
        -Opacity 0.70 `
        -Brightness 0.78 `
        -Rotation -11

    Draw-TransparentImage `
        -Graphics $graphics `
        -Path (Join-Path $assetDirectory 'diana-hand-star-reference-v2.png') `
        -Destination (New-Object System.Drawing.Rectangle 1830, 643, 37, 37) `
        -Opacity 0.70 `
        -Brightness 0.78 `
        -Rotation 9

    Draw-TransparentImage `
        -Graphics $graphics `
        -Path (Join-Path $assetDirectory 'diana-candy-wrapped-v1.png') `
        -Destination (New-Object System.Drawing.Rectangle 1531, 805, 59, 59) `
        -Opacity 0.78 `
        -Brightness 0.84 `
        -Rotation -12

    Draw-TransparentImage `
        -Graphics $graphics `
        -Path (Join-Path $assetDirectory 'diana-candy-lollipop-v1.png') `
        -Destination (New-Object System.Drawing.Rectangle 1796, 829, 64, 64) `
        -Opacity 0.78 `
        -Brightness 0.72 `
        -Rotation 8

    Draw-TransparentImage `
        -Graphics $graphics `
        -Path (Join-Path $assetDirectory 'acao-heart-v3.png') `
        -Destination (New-Object System.Drawing.Rectangle 1582, 887, 95, 95) `
        -Opacity 0.58 `
        -Brightness 0.70 `
        -Rotation -4

    Draw-TransparentImage `
        -Graphics $graphics `
        -Path (Join-Path $assetDirectory 'acao-cheer-v1.png') `
        -Destination (New-Object System.Drawing.Rectangle 1767, 910, 90, 90) `
        -Opacity 0.58 `
        -Brightness 0.70 `
        -Rotation 4

    Draw-TransparentImage `
        -Graphics $graphics `
        -Path (Join-Path $assetDirectory 'diana-night-v3.png') `
        -Destination (New-Object System.Drawing.Rectangle 1524, 586, 354, 480) `
        -Opacity 0.66 `
        -Brightness 0.98

    $canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $legacyPackageImage = Join-Path $PSScriptRoot 'diana-terminal\diana-night-v3.png'
    if (Test-Path -LiteralPath $legacyPackageImage) {
        Remove-Item -LiteralPath $legacyPackageImage -Force
    }
}
finally {
    $graphics.Dispose()
    $canvas.Dispose()
}

[pscustomobject]@{
    Output = $outputPath
    Width = 1920
    Height = 1080
    CharacterHeight = 480
    CharacterOpacity = 0.66
    LineOpacity = 0.27
    OrnamentCount = 6
    LeftTextZone = 'transparent'
} | ConvertTo-Json
