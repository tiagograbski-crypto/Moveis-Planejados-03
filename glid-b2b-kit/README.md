# gl.id B2B Kit

Kit reutilizável para **vender landing pages** a donos de negócio (showroom + guia do proprietário).

> **Referência v2 (marcenarias):** `../public/` em Moveis-Planejados-03  
> **Referência v1 (web apps com abas):** `snippet-tabs-legacy.html` + `owner-guide.css`

## Estrutura

```
glid-b2b-kit/
├── showroom/              # Painel lateral v2 (preço, CTA, scroll ao guia)
│   ├── snippet.html
│   ├── showroom-nav.css
│   ├── showroom-nav.js
│   └── config.example.js
├── owner-guide/           # Guia do Proprietário v2 (landing pages)
│   ├── snippet.html       # Seção #b2b-owner-guide completa
│   ├── b2b-owner-guide.css
│   ├── images/thiago-grabski.webp
│   ├── snippet-tabs-legacy.html   # v1 — abas Agilidade · Preços · Domínio · Entrega
│   ├── owner-guide.css            # CSS v1 (abas)
│   └── owner-guide.js             # JS v1 (abas + demo cards)
├── shared/                # Helpers: WhatsApp, Maps, core B2B
├── templates/
│   ├── marcenaria.md      # Copy e preços — móveis planejados
│   ├── automotive.md
│   └── facial.md
├── INSTALL.md
└── PLAYBOOK-B2B.md
```

## Qual versão usar?

| Vertical | Guia B2B | Painel |
|---|---|---|
| **Landing page** (marcenaria, portfólio) | `owner-guide/snippet.html` + `b2b-owner-guide.css` | `showroom/` v2 |
| **Web app** (automotive, clínica) | `snippet-tabs-legacy.html` + `owner-guide.css` + `owner-guide.js` | `showroom/` v1 ou v2 |

## Início rápido (marcenarias)

1. Copie `showroom/*` e `owner-guide/b2b-owner-guide.css` → `assets/css/` e `assets/js/`
2. Cole `showroom/snippet.html` após `<body>`
3. Cole `owner-guide/snippet.html` após `</footer>`
4. Copie `owner-guide/images/thiago-grabski.webp` → `assets/images/`
5. Mescle `showroom/config.example.js` no `config.js`
6. Carregue `contact-utils.js` + `showroom-nav.js` antes do `config.js`

Ver `INSTALL.md` e `templates/marcenaria.md`.

## Legado

- `showroom-kit/` — só painel lateral antigo
- `owner-guide/snippet-tabs-legacy.html` — guia com abas (AUTOMOTIVE / apps)
