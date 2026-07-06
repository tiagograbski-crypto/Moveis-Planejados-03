# Copia imagens organizadas do Desktop -> public/assets/images/
$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ConfigPath = Join-Path $ProjectRoot "project.config.json"
$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json

$DesktopPath = $Config.portfolio.desktopPath -replace '^~', $env:USERPROFILE
$PortfolioRoot = $DesktopPath
$SiteImages = Join-Path $ProjectRoot "public"
$Sections = @($Config.images.sections)

if (-not (Test-Path $PortfolioRoot)) {
    Write-Error "Pasta do portfólio não encontrada: $PortfolioRoot"
    exit 1
}

$count = 0
foreach ($section in $Sections) {
    $srcDir = Join-Path $PortfolioRoot $section
    $dstDir = Join-Path $SiteImages $section
    if (-not (Test-Path $srcDir)) { continue }
    if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir -Force | Out-Null }
    Get-ChildItem $srcDir -File | Where-Object { $_.Extension -match '^\.(jpe?g|png|webp|avif)$' } | ForEach-Object {
        Copy-Item $_.FullName (Join-Path $dstDir $_.Name) -Force
        Write-Host "  OK $section/$($_.Name)"
        $count++
    }
}

Write-Host ""
Write-Host "Sincronizadas $count imagem(ns) -> $SiteImages"
exit 0
