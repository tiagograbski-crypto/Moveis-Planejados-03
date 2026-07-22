# Instalação — gl.id B2B Kit

## A) Landing pages (marcenarias) — v2

### 1. CSS no `<head>`

```html
<link rel="stylesheet" href="assets/css/showroom-nav.css">
<link rel="stylesheet" href="assets/css/b2b-owner-guide.css">
```

Copie:
- `glid-b2b-kit/showroom/showroom-nav.css` → `assets/css/`
- `glid-b2b-kit/owner-guide/b2b-owner-guide.css` → `assets/css/`

O CSS do guia usa variáveis do site (`--bg`, `--accent`, `--marrom`…). Se não existirem, há fallbacks no arquivo.

### 2. HTML

| Snippet | Onde colar |
|---|---|
| `showroom/snippet.html` | Logo após `<body>` |
| `owner-guide/snippet.html` | Após `</footer>` (antes de barras fixas) |

### 3. Imagem do fundador

```bash
cp glid-b2b-kit/owner-guide/images/thiago-grabski.webp public/assets/images/
```

### 4. JavaScript antes de `</body>`

```html
<script src="assets/js/contact-utils.js"></script>
<script src="assets/js/showroom-nav.js"></script>
<script src="assets/js/config.js"></script>
```

Copie `shared/contact-utils.js` e `showroom/showroom-nav.js` → `assets/js/`.

### 5. Config

Mescle `showroom/config.example.js` no `APP_CONFIG` do projeto.

### 6. Modo showroom vs. produção

| Modo | `showroomNav.enabled` | Comportamento |
|---|---|---|
| Showroom (vender) | `true` | Painel + guia B2B visíveis |
| Cliente final | `false` | Esconde painel e `#b2b-owner-guide` |

Substitua `clientPlaceholders.city` pela cidade real do cliente.

---

## B) Web apps (automotive, facial) — v1 abas

Siga o fluxo legado com:
- `owner-guide/snippet-tabs-legacy.html`
- `owner-guide/owner-guide.css` + `demo-hints.css`
- `owner-guide/owner-guide.js` + `shared/demo-booking.js`
- `owner-guide/owner-guide.config.example.js`

---

## Checklist pós-instalação

- [ ] Preços sincronizam no painel e no guia (`#b2b-guide-price`)
- [ ] Botão WhatsApp abre com mensagem de `acquireMessage`
- [ ] Link "Ver o que está incluso ↓" faz scroll para `#b2b-owner-guide`
- [ ] Guia B2B oculto na entrega ao cliente final
