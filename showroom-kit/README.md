# gl.id Showroom Kit

Painel lateral flutuante para ambientes de demonstração gl.id — pronto para colar em qualquer landing.

## Arquivos

| Arquivo | Uso |
|---|---|
| `snippet.html` | HTML para colar após `<body>` |
| `showroom-nav.css` | Estilos isolados (Dark Tech) |
| `showroom-nav.js` | Lógica do painel |
| `contact-utils.js` | Helpers opcionais de WhatsApp |
| `config.example.js` | Configuração por modelo |
| `demo.html` | Página de teste local |

## Instalação rápida

1. Copie os arquivos para o projeto do cliente:
   ```
   assets/css/showroom-nav.css
   assets/js/showroom-nav.js
   assets/js/contact-utils.js   (opcional)
   ```

2. No `<head>`:
   ```html
   <link rel="stylesheet" href="assets/css/showroom-nav.css">
   ```

3. Cole o conteúdo de `snippet.html` logo após `<body>`.

4. Antes de `</body>`:
   ```html
   <script src="assets/js/contact-utils.js"></script>
   <script src="assets/js/config.js"></script>
   <script src="assets/js/showroom-nav.js"></script>
   ```

5. Adicione `showroomNav` no `config.js` (use `config.example.js` como base).

## Configuração por modelo

```javascript
showroomNav: {
  enabled: true,
  statusLabel: "Disponível",
  modelLabel: "Modelo SEO Local (gl.id)",
  priceValue: "R$ 2.497",
  deliveryLabel: "Entrega em 72 horas",
  portfolioUrl: "https://www.glid.ia.br/",
  acquireWhatsApp: "5549999999999",
  acquireContactName: "Tiago",
  acquireMessage: "Olá, {contact}! ..."
}
```

- `{contact}` na mensagem é substituído por `acquireContactName`.
- `enabled: false` oculta o painel.

## Comportamento

- Fixo à esquerda, centralizado verticalmente (`z-index: 9999`).
- Botão lateral recolhe/expande o painel.
- Mobile inicia recolhido.
- Estado salvo em `sessionStorage` (`showroom-nav-collapsed`).
- Classe `is-available` = visual de modelo à venda.

## Testar localmente

Abra `demo.html` no navegador ou sirva a pasta:

```bash
npx serve showroom-kit
```

## Copy padrão (SEO Local)

- **Eyebrow:** Ambiente gl.id Showroom
- **Status:** Disponível
- **Modelo:** Modelo SEO Local (gl.id)
- **Preço:** R$ 2.497
- **Entrega:** Entrega em 72 horas
- **CTA 1:** Voltar ao Portfólio (gl.id)
- **CTA 2:** Adquirir esta Estrutura
