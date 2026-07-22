# Bottom Action Bar — modelo de zonas

Módulo reutilizável para sites com barra fixa inferior (`glid-b2b-kit/shared/bottom-action-zones.js`).

## Três zonas de scroll

| Zona | Quando | Barra | Botões |
|------|--------|-------|--------|
| **Vitrine** | Hero → FAQ | Visível | Cliente final |
| **Rodapé pós-FAQ** | Após `#faq` | Visível | Proprietário (B2B) |
| **Guia do proprietário** | Dentro de `#b2b-owner-guide` | **Oculta** | — (CTA do guia assume) |

## Hierarquia de conversão

1. **Primário (direita)** — ação de maior valor: `Licenciar estrutura` → WhatsApp do fundador com mensagem pré-formatada.
2. **Secundário (esquerda)** — prova de autoridade: `Portfólio gl.id` → site da GLID em nova aba.

Na vitrine, o padrão inverte o foco para o cliente final: `Iniciar projeto` (modal) + `Ver projetos` (âncora).

## Configuração (`APP_CONFIG.bottomActionBar`)

```js
bottomActionBar: {
  enabled: true,
  ownerAfterSection: "#faq",      // após esta seção → modo proprietário
  hideInSection: "#b2b-owner-guide", // dentro desta → ocultar barra
  hideVisibleRatio: 0.1,          // % da viewport com B2B visível para ocultar
  ownerAfterViewportRatio: 0.72,  // FAQ “passou” quando bottom < 72% da tela
  modes: {
    owner: {
      secondaryLabel: "Portfólio gl.id",
      secondaryHref: "https://www.glid.ia.br/",
      primaryLabel: "Licenciar estrutura",
      presenceLabel: "WhatsApp · Tiago"
    }
  }
}
```

## Instalação

1. Copiar `shared/bottom-action-zones.js` para `assets/js/`.
2. Adicionar `data-bottom-action-bar`, `data-bottom-action-secondary`, `data-bottom-action-primary` no HTML da barra.
3. Carregar **após** `config.js` e **antes** de `main.js`.
4. Em `main.js`, chamar `initBottomActionZones()` e delegar `setPersistentChrome` a `evaluateBottomActionBar`.
5. Definir `resolveB2bAcquireWhatsApp` em `config.js` (número real do fundador, separado do WhatsApp demo da vitrine).

## Por que ocultar no guia B2B?

O guia já tem CTA principal (`#b2b-owner-guide-acquire`). Duas barras competindo reduzem conversão e quebram a sensação de “área exclusiva”.
