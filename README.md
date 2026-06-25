# Sartoria — Móveis Planejados

Landing page de alta conversão para **Sartoria Móveis Planejados** (Chapecó, SC).  
Design autoral, formulário multi-step, portfólio visual e integração com WhatsApp.

**Repositório:** [tiagograbski-crypto/Moveis-Planejados-03](https://github.com/tiagograbski-crypto/Moveis-Planejados-03)

---

## Índice

| Seção | Descrição |
|---|---|
| [Visão geral](#visão-geral) | O que é este projeto |
| [Estrutura](#estrutura-do-repositório) | Mapa de pastas |
| [Início rápido](#início-rápido) | Rodar em localhost:3000 |
| [Configuração](#configuração-do-cliente) | WhatsApp, SEO, contato |
| [Imagens](#gestão-de-imagens) | Sync Desktop → site |
| [Validação](#validação) | Checagem pré-deploy |
| [Deploy](#deploy) | Vercel, Netlify, GitHub Actions |
| [Stack](#stack) | Tecnologias |
| [Documentação](#documentação) | Guias em `docs/` |

---

## Visão geral

| Item | Detalhe |
|---|---|
| **Cliente** | Sartoria Móveis Planejados |
| **Tipo** | Site estático (sem build step) |
| **Pasta publicada** | `public/` |
| **Dev local** | `npm start` → http://localhost:3000 |
| **Produção prevista** | https://www.sartoriamoveis.com.br |
| **Crédito** | ESSENTIEL / [glid.ia.br](https://glid.ia.br) |

---

## Estrutura do repositório

```
Moveis-Planejados-03/
│
├── public/                         # SITE — única pasta que vai ao ar
│   ├── index.html                  # Página principal
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/
│       ├── css/main.css
│       ├── js/
│       │   ├── config.js           # Dados do cliente (editar antes do deploy)
│       │   ├── config.example.js
│       │   ├── images.js
│       │   ├── main.js
│       │   └── tailwind-config.js
│       └── images/
│           ├── 01-hero/
│           ├── 02-solucao/
│           ├── 03-anatomia/
│           ├── 04-execucoes/
│           └── 05-social/
│
├── docs/                           # Documentação (não publicada)
│   └── images/
│       ├── GUIA-IMAGENS-IA.md
│       ├── PROMPTS-BASICOS.md
│       └── manifest.json
│
├── scripts/
│   ├── dev-server.js               # Servidor local :3000
│   ├── validate.js                 # Validação pré-deploy
│   ├── lib/project-paths.js
│   └── portfolio/
│       ├── list-images.js
│       ├── sync-portfolio-images.ps1
│       └── reorganize-portfolio-desktop.ps1
│
├── .github/workflows/validate.yml    # CI — valida a cada push
├── project.config.json             # Caminhos e seções de imagem
├── vercel.json                     # Deploy Vercel
├── netlify.toml                    # Deploy Netlify
└── package.json
```

---

## Início rápido

```bash
git clone https://github.com/tiagograbski-crypto/Moveis-Planejados-03.git
cd Moveis-Planejados-03
npm start
```

| Ambiente | URL |
|---|---|
| Desktop | http://localhost:3000 |
| Mobile (mesma Wi-Fi) | http://SEU_IP:3000 |

Windows: dê duplo clique em `start.bat`.

---

## Configuração do cliente

Arquivo: `public/assets/js/config.js`

| Campo | Descrição |
|---|---|
| `whatsapp` | Número com DDI, só dígitos |
| `phone` / `phoneDisplay` | Telefone e exibição |
| `email` | E-mail de contato |
| `address` | Endereço no rodapé |
| `siteUrl` | URL final (SEO / Open Graph) |

Caminho da pasta de imagens no Desktop: `project.config.json` → `portfolio.desktopPath`.

---

## Gestão de imagens

| Comando | Ação |
|---|---|
| `npm run images:list` | Lista imagens no site |
| `npm run images:sync` | Copia Desktop → `public/assets/images/` |
| `npm run images:organize-desktop` | Organiza exports de IA no Desktop |

Guia completo: [`docs/images/`](docs/images/).

---

## Validação

```bash
npm run validate
```

Verifica estrutura, imagens do manifest e alertas de configuração.  
Executado automaticamente no GitHub Actions e antes do deploy (Vercel/Netlify).

---

## Deploy

### Vercel (recomendado)

1. [Importar repositório](https://vercel.com/new) → `Moveis-Planejados-03`
2. Framework: **Other**
3. `vercel.json` já configura `outputDirectory: public`

### Netlify

| Campo | Valor |
|---|---|
| Build command | `npm run validate` |
| Publish directory | `public` |

### GitHub Actions

Workflow em `.github/workflows/validate.yml` — roda `npm run validate` em push/PR na branch `main`.

---

## Stack

- HTML semântico + Tailwind CSS (CDN)
- JavaScript vanilla
- Fontes: Montserrat + Playfair Display
- Ícones: Font Awesome 6

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`docs/images/GUIA-IMAGENS-IA.md`](docs/images/GUIA-IMAGENS-IA.md) | Direção visual e checklist |
| [`docs/images/PROMPTS-BASICOS.md`](docs/images/PROMPTS-BASICOS.md) | Prompts para geração de assets |
| [`docs/images/manifest.json`](docs/images/manifest.json) | Mapa técnico imagem → seção HTML |

---

## Licença

Projeto privado — Sartoria Móveis Planejados. Todos os direitos reservados.
