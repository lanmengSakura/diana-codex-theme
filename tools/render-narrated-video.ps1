param(
    [string]$Endpoint = 'http://127.0.0.1:9227',
    [string]$BgmPath = '',
    [string]$OutputPath = '',
    [switch]$ReuseVisual
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $ProjectRoot 'dist'
$VisualPath = Join-Path $DistDir 'diana-codex-theme-demo-v2-visual.mp4'
$VoicePath = Join-Path $DistDir 'diana-demo-narration-zh-CN.mp3'
$DefaultBgmPath = Join-Path $DistDir 'diana-theme-original-bgm.wav'
if ([string]::IsNullOrWhiteSpace($BgmPath)) {
    $BgmPath = $DefaultBgmPath
}
else {
    $BgmPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($BgmPath)
}
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path $DistDir 'diana-codex-theme-demo-v2-zh-CN.mp4'
}
else {
    $OutputPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputPath)
}

foreach ($tool in @('node.exe', 'python.exe', 'ffmpeg.exe')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "Required tool not found: $tool"
    }
}

New-Item -ItemType Directory -Force -Path $DistDir | Out-Null
Push-Location $ProjectRoot
try {
    & python.exe -m edge_tts --file '.\video\narration-zh-CN.txt' --voice zh-CN-XiaoxiaoNeural --rate=+6% --write-media $VoicePath
    if ($LASTEXITCODE -ne 0) { throw 'Narration generation failed.' }

    if ($BgmPath -eq $DefaultBgmPath) {
        & node.exe '.\video\generate-bgm.mjs' $BgmPath
        if ($LASTEXITCODE -ne 0) { throw 'Background music generation failed.' }
    }
    elseif (-not (Test-Path -LiteralPath $BgmPath -PathType Leaf)) {
        throw "Background music not found: $BgmPath"
    }

    if (-not $ReuseVisual -or -not (Test-Path -LiteralPath $VisualPath -PathType Leaf)) {
        & node.exe '.\preview\render-video.mjs' $Endpoint $VisualPath
        if ($LASTEXITCODE -ne 0) { throw 'Visual video rendering failed.' }
    }

    $AudioFilter = '[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,adelay=2500,apad=pad_dur=45,pan=stereo|c0=c0|c1=c0,asplit=2[voice_sc][voice_mix];[2:a]atrim=duration=45,asetpts=PTS-STARTPTS,loudnorm=I=-30:TP=-6:LRA=10[bgm];[bgm][voice_sc]sidechaincompress=threshold=0.018:ratio=6:attack=18:release=360[ducked];[voice_mix][ducked]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95,loudnorm=I=-16:TP=-1.5:LRA=11[aout]'
    $SubtitleFilter = "subtitles=video/subtitles-zh-CN.srt:force_style='FontName=Microsoft YaHei UI,FontSize=12,Bold=-1,PrimaryColour=&H00FFFFFF,OutlineColour=&H30000000,BorderStyle=1,Outline=2,Shadow=0,Alignment=2,MarginV=46'"

    & ffmpeg.exe -y -hide_banner -loglevel warning `
        -i $VisualPath -i $VoicePath -i $BgmPath `
        -filter_complex $AudioFilter -map '0:v:0' -map '[aout]' `
        -vf $SubtitleFilter `
        -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -color_range tv `
        -c:a aac -b:a 192k -ar 48000 -t 45 -movflags +faststart `
        $OutputPath
    if ($LASTEXITCODE -ne 0) { throw 'Final video mix failed.' }

    Get-Item -LiteralPath $OutputPath | Select-Object FullName, Length, LastWriteTime
}
finally {
    Pop-Location
}
