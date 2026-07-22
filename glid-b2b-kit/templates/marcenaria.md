# Template B2B — Móveis Planejados / Marcenarias

Referência implementada: `Moveis-Planejados-03/public/`

## Kit usado

- `showroom/` — painel lateral v2
- `owner-guide/snippet.html` — Guia do Proprietário v2 (landing page)
- `owner-guide/b2b-owner-guide.css`
- `shared/contact-utils.js` — sanitização de WhatsApp

## Copy principal (já no snippet)

| Bloco | Mensagem |
|---|---|
| Demarcação | Área exclusiva do proprietário — não vai no site final |
| Pilares | Velocidade · WhatsApp organizado · Base pronta |
| Escopo | Incluso vs. fora (sem ads, sem social, sem pixels) |
| Fotos | Até 15 fotos com engenharia de performance |
| Pós-entrega | Pacotes avulsos ou manutenção opcional |
| FAQ | Mensalidade · Propriedade · Exclusividade regional |

## Preço padrão showroom

- Âncora: R$ 24.997
- Fechamento: R$ 14.997
- 50% entrada (trava região) · 50% na entrega

## Placeholders da vitrine demo

Use `clientPlaceholders` no config para "Sua cidade" em vez de cidade fixa.

## Entrega ao cliente final

```javascript
showroomNav: { enabled: false }
```

Remova ou oculte `#b2b-owner-guide` e substitua placeholders pela cidade real.
