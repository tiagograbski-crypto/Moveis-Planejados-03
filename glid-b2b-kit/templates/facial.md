# Template — Estética facial

Adapte os textos ao colar `owner-guide/snippet.html` e `owner-guide.config.example.js`.

## showroomNav

```javascript
modelLabel: 'Modelo Estética Facial (gl.id)',
acquireMessage:
  'Olá, {contact}! Acessei o demo de Estética Facial (gl.id) e quero adquirir esta estrutura ({priceValue}). Podemos conversar?',
```

## ownerGuide

```javascript
ownerGuide: {
  businessLabel: 'sua clínica',
  domainExample: 'suaclinicaestetica.com.br',
  domainExamples: [
    'harmonizacaoja.com.br',
    'esteticafacialjs.com.br',
    'clinicabeauty.com.br',
  ],
  protocolsHint:
    'Versão demonstração — escolha um procedimento, informe seu WhatsApp e veja a mensagem que chegará na <strong>sua clínica</strong>.',
  demoCardCopy:
    'Clique aqui e veja como a mensagem chegará no <strong>WhatsApp da sua clínica</strong>',
}
```

## Painel "Seus preços" (HTML)

Substitua o parágrafo por:

> Cada procedimento (Limpeza de pele, Peeling, Microagulhamento, etc.) tem o **valor que você definir**. O app calcula por tipo de pele ou pacote de sessões.

## Painel "Entrega" — lista

- Marca, cidade e WhatsApp da sua clínica
- Procedimentos com os preços que você definir
- Domínio .com.br apontando para o app
- Link para bio e Google Meu Negócio
- App instalável no celular (PWA)

## O que remover do vertical facial

- Ignição / Start de motor
- `carDatabase` — substituir por tipo de pele ou área do rosto
- Depoimentos com modelos de carro

## Entrada sugerida (em vez da ignição)

Preloader suave com nome da clínica + 3 estrelas (já existe no AUTOMOTIVE).
