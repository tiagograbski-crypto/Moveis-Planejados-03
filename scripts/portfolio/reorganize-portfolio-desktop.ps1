# Organiza a pasta de portfólio no Desktop (executar após novos exports de IA)
$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$ConfigPath = Join-Path $ProjectRoot "project.config.json"
$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$Root = $Config.portfolio.desktopPath -replace '^~', $env:USERPROFILE

$dirs = @(
    "01-hero", "02-solucao", "03-anatomia", "04-execucoes", "05-social",
    "99-reserva", "_originais", "_referencia"
)
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Path (Join-Path $Root $d) -Force | Out-Null
}

$map = @{
    "RIPADO CAPA HERO.png" = @(
        @{ Folder = "01-hero"; Name = "hero-capa-marrom.png" },
        @{ Folder = "04-execucoes"; Name = "execucao-02-living-painel-ripado.png" },
        @{ Folder = "05-social"; Name = "social-og-compartilhamento.png" }
    )
    "GAVETA.jpg" = @(
        @{ Folder = "02-solucao"; Name = "solucao-detalhe-marcenaria-blum.jpg" },
        @{ Folder = "03-anatomia"; Name = "anatomia-02-ferragens-importadas.jpg" }
    )
    "OFICINA.jpg" = @(@{ Folder = "03-anatomia"; Name = "anatomia-bg-atelier-escuro.jpg" })
    "MADEIRA.jpg" = @(@{ Folder = "03-anatomia"; Name = "anatomia-01-chapas-premium.jpg" })
    "MONITOR PROJETANDO SEM ROSTO.jpg" = @(@{ Folder = "03-anatomia"; Name = "anatomia-03-projeto-tecnico-3d.jpg" })
    "MARCINEIRO AJUSTANDO.jpg" = @(@{ Folder = "03-anatomia"; Name = "anatomia-04-instalacao-premium.jpg" })
    "CONSUNTO SALA COIZINHA.jpg" = @(@{ Folder = "04-execucoes"; Name = "execucao-01-cozinha-gourmet-nogueira.jpg" })
    "CLOUSEP.jpg" = @(@{ Folder = "04-execucoes"; Name = "execucao-03-closet-minimalista-lacca.jpg" })
}

$reserve = @("COZINHA.jpg", "COZINHA MINI.jpg")
$ref = @("landing_page_m_veis_planejados.html")

Get-ChildItem $Root -File | ForEach-Object {
    $name = $_.Name
    if ($ref -contains $name) {
        Move-Item $_.FullName (Join-Path $Root "_referencia\$name") -Force
        return
    }
    if ($reserve -contains $name) {
        Move-Item $_.FullName (Join-Path $Root "99-reserva\$name") -Force
        return
    }
    if (-not $map.ContainsKey($name)) { return }
    Copy-Item $_.FullName (Join-Path $Root "_originais\$name") -Force
    foreach ($target in $map[$name]) {
        $dest = Join-Path $Root (Join-Path $target.Folder $target.Name)
        Copy-Item $_.FullName $dest -Force
        Write-Host "  $($target.Folder)/$($target.Name) <- $name"
    }
    Remove-Item $_.FullName -Force
}

Write-Host ""
Write-Host "Desktop organizado: $Root"
