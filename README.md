# Tendência — Móveis Planejados

Landing page de alta conversão para **Tendência Móveis Planejados** — Chapecó, SC.
Design *premium* com Glassmorphism, micro-interações de nível *high-end*, banner de curadoria de paletas e integração direta com WhatsApp.

**Repositório:** [tiagograbski-crypto/Moveis-Planejados-03](https://github.com/tiagograbski-crypto/Moveis-Planejados-03)

---

## Índice

| Seção | Descrição |
|---|---|
| [Visão geral](#visão-geral) | O que é este projeto |
| [Estrutura](#estrutura-do-repositório) | Mapa de pastas |
| [Design System](#design-system) | Tokens, paletas e filosofia visual |
| [Início rápido](#início-rápido) | Servidor local em 30 segundos |
| [Configuração](#configuração-do-cliente) | WhatsApp, SEO, feature flags |
| [Imagens](#gestão-de-imagens) | Sync Desktop → site |
| [Validação](#validação) | Checagem pré-deploy |
| [Deploy](#deploy) | Vercel, Netlify, GitHub Actions |
| [Stack](#stack) | Tecnologias utilizadas |
| [Documentação](#documentação) | Guias em `docs/` |

---

## Visão geral

| Item | Detalhe |
|---|---|
| **Cliente** | Tendência Móveis Planejados — Chapecó, SC |
| **Tipo** | Site estático (zero build step) |
| **Pasta publicada** | `public/` |
| **Dev local** | `npm start` → http://localhost:3000 |
| **Crédito** | [gl.it.ya.br](https://gl.it.ya.br) |

---

## Estrutura do repositório

```
Moveis-Planejados-03/
│
├── public/                          # SITE — única pasta enviada ao ar
│   ├── index.html                   # Página principal (sem dependência de build)
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/
│       ├── css/
│       │   └── main.css             # Design system completo (tokens + componentes)
│       ├── js/
│       │   ├── main.js              # Runtime principal (modal, menu, FAQ, CRO)
│       │   ├── config.js            # ← Editar antes do deploy (WhatsApp, SEO)
│       │   ├── config.example.js    # Modelo comentado de configuração
│       │   ├── tracking.js          # GTM gate + dataLayer events
│       │   └── images.js            # Mapa de assets (gerado por script)
│       └── images/
│           ├── hero/                # Capa principal
│           ├── solucao/             # Seção "A Solução"
│           ├── anatomia/            # Diferenciais — fundo + 4 pilares
│           ├── execucoes/           # Portfólio de execuções
│           └── social/              # Open Graph / WhatsApp preview
│
├── docs/                            # Documentação interna (não publicada)
│   └── images/
│       ├── GUIA-IMAGENS-IA.md       # Direção visual + checklist de assets
│       ├── PROMPTS-BASICOS.md       # Prompts para Midjourney / DALL·E / Flux
│       └── manifest.json            # Mapa técnico imagem → seção HTML
│
├── scripts/
│   ├── dev-server.js                # Servidor local :3000 com auto-reload
│   ├── validate.js                  # Validação pré-deploy (estrutura + manifest)
│   ├── lib/project-paths.js         # Paths compartilhados entre scripts
│   └── portfolio/
│       ├── list-images.js
│       ├── sync-portfolio-images.ps1
│       └── reorganize-portfolio-desktop.ps1
│
├── .github/
│   └── workflows/validate.yml       # CI — roda validação a cada push/PR
├── project.config.json              # Paths e seções de imagem
├── vercel.json                      # Deploy Vercel (outputDirectory: public)
├── netlify.toml                     # Deploy Netlify
├── start.bat                        # Atalho Windows — duplo clique para iniciar
└── package.json
```

---

## Design System

O site usa **CSS puro com tokens** — zero dependência de framework externo.

### Paletas de cor (variáveis CSS)

| Paleta | Variável | Hex |
|---|---|---|
| Terra Orgânica | `--terracota` | `#9E6E56` |
| Terra Orgânica | `--areia` | `#D2B48C` |
| Terra Orgânica | `--marrom` | `#3E2A22` |
| Cinza Atemporal | `--grafite` | `#2C2C2C` |
| Cinza Atemporal | `--pedra` | `#707070` |
| Cinza Atemporal | `--salvia` | `#8A9A8B` |
| Sereno Essencial | `--creme` | `#F5F5DC` |
| Sereno Essencial | `--charcoal` | `#36454F` |
| Sereno Essencial | `--bronze` | `#CD7F32` |

### Princípios visuais

- **Glassmorphism unificado** — `backdrop-filter: blur(20px)` em cards, header, menu drawer e banner.
- **Tipografia fluida** — espaçamento via `clamp()` e `rem`, sem `px` em layout.
- **Micro-interações orgânicas** — `cubic-bezier(0.22, 1, 0.36, 1)` em todas as transições.
- **Banner de curadoria** — alterna as 3 paletas a cada 5s com fade suave via `@keyframes` CSS.
- **CRO nativo** — todos os CTAs rastreáveis via `data-track-*` sem alterar JS após deploy.

---

## Início rápido

```bash
git clone https://github.com/tiagograbski-crypto/Moveis-Planejados-03.git
cd Moveis-Planejados-03
npm install
npm start
```

| Ambiente | URL |
|---|---|
| Desktop | http://localhost:3000 |
| Mobile (mesma rede Wi-Fi) | http://SEU_IP_LOCAL:3000 |

> **Windows:** dê duplo clique em `start.bat` — inicia o servidor e abre o browser automaticamente.

---

## Configuração do cliente

Edite **apenas** o arquivo `public/assets/js/config.js` antes do deploy:

| Campo | Descrição | Exemplo |
|---|---|---|
| `whatsapp` | Número completo com DDI (só dígitos) | `5549999999999` |
| `phone` / `phoneDisplay` | Número para exibição no site | `(49) 9 9999-9999` |
| `siteUrl` | URL final de produção (SEO + OG) | `https://tendenciamoveis.com.br` |
| `gtmContainerId` | ID do Google Tag Manager | `GTM-XXXXXXX` |
| `menuEnabled` | Ativa/desativa menu sanduíche mobile | `true` |

> Nunca suba `config.js` com dados reais para repositório público. Use `config.example.js` como referência.

---

## Gestão de imagens

| Comando | Ação |
|---|---|
| `npm run images:list` | Lista todas as imagens atualmente no site |
| `npm run images:sync` | Copia pasta Desktop → `public/assets/images/` |
| `npm run images:organize-desktop` | Organiza exports de IA no Desktop por seção |

Guia completo de produção de assets: [`docs/images/GUIA-IMAGENS-IA.md`](docs/images/GUIA-IMAGENS-IA.md).

---

## Validação

```bash
npm run validate
```

Verifica estrutura de pastas, imagens listadas no manifest e alertas de configuração.
Executado automaticamente pelo GitHub Actions em cada push e pelo Netlify antes do deploy.

---

## Deploy

### Vercel *(recomendado)*

1. Acesse [vercel.com/new](https://vercel.com/new) → importe `Moveis-Planejados-03`
2. Framework preset: **Other**
3. `vercel.json` já configura `outputDirectory: public` — sem configuração adicional

### Netlify

| Campo | Valor |
|---|---|
| Build command | `npm run validate` |
| Publish directory | `public` |

### GitHub Actions

Workflow em `.github/workflows/validate.yml` — executa `npm run validate` em push e pull request na branch `main`. Falhas bloqueiam o merge.

---

## Stack

| Tecnologia | Uso |
|---|---|
| HTML5 semântico | Estrutura, acessibilidade (ARIA) e SEO |
| CSS3 puro com design tokens | Design system, animações, Glassmorphism |
| JavaScript vanilla (ES2020) | Runtime, CRO, menu drawer, modal, FAQ |
| Google Tag Manager | Coleta de dados via dataLayer |
| Montserrat + Playfair Display | Hierarquia tipográfica |
| Node.js ≥ 18 | Scripts de desenvolvimento e validação |

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`docs/images/GUIA-IMAGENS-IA.md`](docs/images/GUIA-IMAGENS-IA.md) | Direção visual, paleta, checklist de entrega |
| [`docs/images/PROMPTS-BASICOS.md`](docs/images/PROMPTS-BASICOS.md) | Prompts otimizados para Midjourney / Flux / DALL·E |
| [`docs/images/manifest.json`](docs/images/manifest.json) | Mapa técnico: imagem → dimensões → seção HTML |

---

## Licença

Projeto privado — Tendência Móveis Planejados. Todos os direitos reservados.
Desenvolvido por [gl.it.ya.br](https://gl.it.ya.br)