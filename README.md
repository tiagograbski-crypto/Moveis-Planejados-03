# Sartoria Landing

Landing page de alta conversão para **Sartoria Móveis Planejados** — design autoral, formulário multi-step e integração com WhatsApp.

## Estrutura do projeto

```
sartoria-landing/
├── public/                      # Deploy (Vercel, Netlify, estático)
│   ├── index.html
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/
│       ├── css/main.css
│       ├── js/
│       │   ├── config.js          ← dados do cliente
│       │   ├── config.example.js  ← template
│       │   ├── images.js
│       │   ├── main.js
│       │   └── tailwind-config.js
│       └── images/                ← fotos do site (01-hero … 05-social)
├── docs/
│   └── images/                    ← guias de produção (não vai pro deploy)
│       ├── GUIA-IMAGENS-IA.md
│       ├── PROMPTS-BASICOS.md
│       └── manifest.json
├── scripts/
│   ├── dev-server.js              ← localhost:3000
│   ├── validate.js                ← checagem pré-deploy
│   ├── lib/project-paths.js
│   └── portfolio/                 ← sync com pasta do Desktop
│       ├── list-images.js
│       ├── sync-portfolio-images.ps1
│       └── reorganize-portfolio-desktop.ps1
├── .github/workflows/validate.yml
├── project.config.json            ← caminhos e seções de imagem
├── vercel.json
├── netlify.toml
├── package.json
└── start.bat
```

## Configuração

Edite `public/assets/js/config.js` antes do deploy:

| Campo | Descrição |
|---|---|
| `whatsapp` | Número com DDI, só dígitos (`5549999999999`) |
| `phone` / `phoneDisplay` | Telefone para link `tel:` e exibição |
| `email` | E-mail de contato |
| `address` | Endereço no rodapé |
| `siteUrl` | URL final do site (SEO/Open Graph) |

Caminho da pasta de imagens no Desktop: `project.config.json` → `portfolio.desktopPath`.

## Desenvolvimento local

```bash
npm start
```

| Ambiente | URL |
|---|---|
| Desktop | http://localhost:3000 |
| Mobile (mesma Wi-Fi) | http://SEU_IP:3000 |

No Windows, também pode usar `start.bat`.

## Imagens

| Comando | Ação |
|---|---|
| `npm run images:list` | Lista arquivos em `public/assets/images/` |
| `npm run images:sync` | Copia Desktop → site |
| `npm run images:organize-desktop` | Renomeia/organiza exports de IA no Desktop |

Documentação de produção: `docs/images/`.

## Validação e deploy

```bash
npm run validate
```

### GitHub

1. Crie um repositório vazio no GitHub.
2. Na raiz do projeto:

```bash
git remote add origin https://github.com/SEU_USUARIO/sartoria-landing.git
git push -u origin main
```

O workflow `.github/workflows/validate.yml` roda `npm run validate` em cada push.

### Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. Framework Preset: **Other** (site estático, sem build).
3. O `vercel.json` já define `outputDirectory: public` e `buildCommand: npm run validate`.
4. Deploy.

### Netlify

- Publish directory: `public`
- Build command: `npm run validate` (já em `netlify.toml`)

## Stack

- HTML semântico + Tailwind CSS (CDN)
- JavaScript vanilla (sem build step)
- Fontes: Montserrat + Playfair Display
- Ícones: Font Awesome 6

## Licença

Projeto privado — Sartoria Móveis Planejados.
