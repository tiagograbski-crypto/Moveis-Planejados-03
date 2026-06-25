# Sartoria Landing

Landing page de alta conversão para **Sartoria Móveis Planejados** — design autoral, formulário multi-step e integração com WhatsApp.

## Estrutura do projeto

```
sartoria-landing/
├── public/                 # Arquivos publicáveis (deploy)
│   ├── index.html
│   ├── favicon.svg
│   ├── robots.txt
│   └── assets/
│       ├── css/main.css
│       ├── js/
│       │   ├── config.js          ← dados do cliente
│       │   ├── config.example.js  ← template
│       │   ├── main.js
│       │   └── tailwind-config.js
│       └── images/                ← fotos locais (futuro)
├── scripts/
│   └── dev-server.js       # Servidor local (desktop + mobile)
├── package.json
├── netlify.toml
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

## Desenvolvimento local

```bash
npm start
```

| Ambiente | URL |
|---|---|
| Desktop | http://localhost:3000 |
| Mobile (mesma Wi-Fi) | http://SEU_IP:3000 |

No Windows, também pode usar `start.bat`.

## Deploy

- **Netlify / Vercel**: aponte o diretório de publicação para `public/`
- **Firebase Hosting**: `firebase init hosting` → pasta `public`
- **Qualquer hospedagem estática**: faça upload do conteúdo de `public/`

## Stack

- HTML semântico + Tailwind CSS (CDN)
- JavaScript vanilla (sem build step)
- Fontes: Montserrat + Playfair Display
- Ícones: Font Awesome 6

## Licença

Projeto privado — Sartoria Móveis Planejados.
