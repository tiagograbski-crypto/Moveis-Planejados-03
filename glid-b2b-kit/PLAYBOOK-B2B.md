# Playbook B2B — gl.id

## Objetivo

O link do showroom **vende a estrutura** para o dono da marcenaria.  
Depois da compra, reconfiguramos para o **cliente final** (B2C).

## Funil v2 — landing pages (marcenarias)

```
Entra na demo
  → Navega o site como cliente final (modal, portfólio, WhatsApp)
  → Abre painel lateral ou rola ao Guia do Proprietário
  → Lê escopo blindado + FAQ
  → Clica "Quero licenciar" (mensagem WhatsApp pré-formatada)
```

## Blocos do Guia do Proprietário v2

| Bloco | Função |
|---|---|
| Demarcação ⚠️ | Separa vitrine B2C do guia B2B |
| Trust strip | Contrato · Pagamento · Propriedade · Exclusividade regional |
| 3 pilares | Velocidade · WhatsApp organizado · Base pronta |
| Escopo blindado | Incluso vs. fora (sem ads, social, pixels) |
| Fotos | Até 15 imagens com engenharia de performance |
| Pós-entrega | Pacotes avulsos ou manutenção opcional |
| FAQ | Mensalidade · Propriedade · Concorrente na região |
| Preço + CTA | Âncora R$ 24.997 → R$ 14.997 |

## Showroom lateral v2

Alterar só no `config.js`:

- `modelLabel`, `anchorPriceValue`, `priceValue`
- `statusLabel` (ex.: exclusividade regional)
- `acquireMessage` — texto exato do WhatsApp
- `acquireWhatsApp`

## Preço e mensagem padrão (marcenarias)

- **Âncora:** R$ 24.997
- **Fechamento:** R$ 14.997
- **Entrada 50%** trava exclusividade na região
- Mensagem inclui aceite de prazo, pagamento e escopo sem tráfego/ads

## Funil v1 — web apps (legado)

Ver `owner-guide/snippet-tabs-legacy.html` — abas Agilidade · Preços · Domínio · Entrega.

## Checklist por novo vertical landing

- [ ] Duplicar pasta do app
- [ ] Copiar `glid-b2b-kit/showroom/` + `owner-guide/b2b-owner-guide.css` + `snippet.html`
- [ ] Adaptar copy do escopo (nicho no bullet de conversão)
- [ ] `clientPlaceholders` para demo ("Sua cidade")
- [ ] Foto do fundador em `assets/images/`
- [ ] Na entrega: `showroomNav.enabled: false` + cidade real

## O que NÃO prometer no escopo

- Gestão de redes sociais
- Meta / Google Ads
- Configuração de pixels ou analytics de terceiros

Entregar **pontes prontas no código** — tráfego é responsabilidade do cliente.

## Métricas (dataLayer)

- `showroom_acquire_click` — painel ou guia (`acquire_source`)
- `showroom_guide_scroll_click` — clique em "Ver o que está incluso"
