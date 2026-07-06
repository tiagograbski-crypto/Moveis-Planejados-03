# Guia de Imagens — Tendência Landing

Relatório para produção de assets com IA (Essentiel / glid.ia.br).  
Cada arquivo abaixo corresponde **exatamente** ao nome que deve ir na pasta indicada.

---

## Leitura da capa atual (referência aprovada)

A foto de hero (`photo-1600210492486`) funciona porque reúne:

| Elemento | Por que funciona |
|---|---|
| **Paleta marrom quente** | Alinha com `#3E3129` (contrast) e `#C49A6C` (accent) |
| **Luz lateral suave** | Cria profundidade sem estourar highlights — ideal com overlay `bg-contrast/40` |
| **Madeira + neutros** | Comunica marcenaria de alto padrão, não decoração genérica |
| **Ambiente habitado, não showroom vazio** | Sensação de “lar real” — coerente com depoimentos e consultoria privada |
| **Profundidade de campo** | Permite texto legível sobre o fundo (hero card glass) |

**Direção para TODAS as imagens:** manter essa assinatura — **marrom profundo, creme, terracota/dourado suave, luz natural premium, zero cores saturadas frias (azul/neon)**.

### Paleta oficial (usar nos prompts)

```
Creme base:     #E8E5E1
Marrom texto:   #3E3129
Terracota:      #C49A6C
Dourado claro:  #E8C99A
```

---

## Estrutura de pastas

```
public/assets/images/     → Assets publicados no site
├── 01-hero/              → Capa principal
├── 02-solucao/           → Aba "A Solução"
├── 03-anatomia/          → Aba "Diferenciais" (fundo + 4 pilares)
├── 04-execucoes/         → Aba "Execuções"
└── 05-social/            → Open Graph / compartilhamento

docs/images/
└── manifest.json         → Mapa técnico (dimensões, HTML alvo)
```

---

## Checklist de entrega

- [ ] Formato: **WebP** (qualidade 82–88) ou AVIF + WebP fallback
- [ ] Exportar também **2×** para retina onde indicado
- [ ] Sem logos de terceiros legíveis (Blum/Hafele — sugere-se detalhe genérico premium)
- [ ] Sem rostos identificáveis de pessoas reais (LGPD / direito de imagem)
- [ ] Sem texto dentro da imagem (títulos ficam no HTML)
- [ ] Comprimir: TinyPNG / Squoosh antes de subir na pasta

---

# Prompts por aba / seção

> **Como usar:** copie o bloco **Prompt principal** para Midjourney, DALL·E 3, Flux, Ideogram ou Gemini Imagen.  
> Ajuste `--ar` ou “aspect ratio” conforme a coluna **Proporção**.  
> Use **Prompt negativo** em todas as gerações.

### Prompt negativo (universal)

```
text, watermark, logo, brand name, oversaturated colors, neon, cold blue lighting, 
cheap furniture, IKEA style, cluttered mess, blurry, low resolution, cartoon, 
3D render look, fisheye, amateur photo, stock photo smile, people faces close-up, 
Chapecó text, city name, GPS coordinates
```

---

## 01 — HERO · Capa (`01-hero/`)

**Arquivo:** `hero-capa-marrom.webp`  
**Onde entra:** fundo da seção inicial + OG (versão crop separada em `05-social/`)  
**Proporção:** 3:2 · **2400 × 1600 px**

### Prompt principal

```
Editorial interior photography of a luxury custom kitchen and living integration, 
warm walnut and dark chocolate brown cabinetry, matte and wood veneer finishes, 
soft natural window light from the left, subtle golden hour warmth, cream limestone 
countertop, brushed brass hardware accents, depth of field, sophisticated Brazilian 
high-end joinery aesthetic, quiet luxury, earthy palette matching hex #3E3129 and 
#C49A6C, no people, immaculate craftsmanship, architectural digest style, 
shot on medium format camera, 35mm, f/2.8, photorealistic
```

### Sugestão profissional

- Deixar **lado esquerdo** ligeiramente mais escuro/simplificado — o card de texto do hero fica à esquerda no desktop.
- Evitar fogão/chama em destaque (distrai do CTA).
- Esta imagem define o tom de todo o site — gere **3 variações** e escolha a mais “marrom quente”.

---

## 02 — A SOLUÇÃO · Detalhe técnico (`02-solucao/`)

**Arquivo:** `solucao-detalhe-marcenaria-blum.webp`  
**Onde entra:** figura ao lado do texto “A beleza que você vê…”  
**Proporção:** 3:2 · **1600 × 1067 px**

### Prompt principal

```
Macro editorial close-up of premium cabinet drawer soft-close hardware and 
precision joinery gap, warm brown MDF edge banding perfectly aligned, 
soft-close hinge detail, luxury custom furniture craftsmanship, shallow depth 
of field, warm studio lighting with brown shadows, cream and walnut tones, 
technical precision mood, photorealistic product photography, no visible brand 
logos, matching palette #3E3129 #E8E5E1 #C49A6C
```

### Sugestão profissional

- Deve comunicar **“o que você não vê”** — encaixe milimétrico, ferragem, borda de chapa.
- Funciona bem com legenda atual: *“Detalhe Amortecimento Blum”* (no HTML, não na imagem).

---

## 03 — DIFERENCIAIS · Anatomia da Perfeição (`03-anatomia/`)

### 3A — Fundo da seção

**Arquivo:** `anatomia-bg-atelier-escuro.webp`  
**Onde entra:** background de `#diferenciais` (com overlay escuro 80%)  
**Proporção:** 16:9 · **2400 × 1350 px**

### Prompt principal

```
Dark woodworking atelier background texture, stacked premium MDF boards, 
wood dust particles in volumetric light beam, deep brown and charcoal atmosphere, 
subtle golden accent light, cinematic moody workshop, out of focus, abstract 
industrial luxury carpentry environment, very dark overall exposure, 
photorealistic, no people, no text
```

### Sugestão profissional

- Imagem **intencionalmente escura** — o site aplica `mix-blend-multiply`. Evite áreas claras grandes.

---

### 3B — Card 01 · Chapas Premium

**Arquivo:** `anatomia-01-chapas-premium.webp`  
**Proporção:** 3:4 · **800 × 1067 px**

```
Close-up texture of premium melamine-coated MDF board stack, high-density panel 
cross-section edge, warm brown woodgrain pattern, matte finish, studio lighting, 
luxury material sample, photorealistic, earthy tones #3E3129 #C49A6C, no text
```

---

### 3C — Card 02 · Ferragens Importadas

**Arquivo:** `anatomia-02-ferragens-importadas.webp`  
**Proporção:** 3:4 · **800 × 1067 px**

```
Opened luxury kitchen drawer interior showing full-extension soft-close slides 
and organized compartments, brushed steel hardware, warm cabinet interior lighting, 
premium joinery detail, brown walnut drawer boxes, photorealistic, no brand logos, 
warm color grading
```

---

### 3D — Card 03 · Projeto Técnico 3D

**Arquivo:** `anatomia-03-projeto-tecnico-3d.webp`  
**Proporção:** 3:4 · **800 × 1067 px**

```
Photorealistic 3D render of a planned living room on a designer monitor in a 
dark studio, screen glow illuminating desk, brown and cream interior design on 
display, technical floor plan papers nearby, professional architect workspace, 
cinematic, ultra realistic, warm tones, no readable UI text on screen
```

---

### 3E — Card 04 · Instalação Premium

**Arquivo:** `anatomia-04-instalacao-premium.webp`  
**Proporção:** 3:4 · **800 × 1067 px**

```
Professional carpentry installation team hands adjusting custom built-in wardrobe 
panel alignment, floor protection film visible, precision spirit level, premium 
white glove service mood, warm natural light, brown cabinetry, photorealistic 
documentary style, no faces visible, no company uniforms with logos
```

### Sugestão profissional (anatomia)

- Os 4 cards devem parecer **mesma sessão fotográfica** — mesma temperatura de cor e contraste.
- Funcionam com efeito “x-ray reveal” — prefira imagens com **textura legível** mesmo em opacity reduzida.

---

## 04 — EXECUÇÕES · Portfólio (`04-execucoes/`)

### 4A — Destaque grande · Cozinha Gourmet

**Arquivo:** `execucao-01-cozinha-gourmet-nogueira.webp`  
**Projeto:** Residência Viena · Lâmina de Nogueira & Vidro Reflecta  
**Proporção:** 4:3 · **1600 × 1200 px** (card hero do grid)

```
Luxury gourmet kitchen interior, walnut wood veneer cabinets, integrated 
refrigerator paneling, reflective glass backsplash, warm under-cabinet lighting, 
cream ceiling, wide angle architectural photography, Brazilian high-end residential, 
brown and gold palette, evening ambient light, no people, photorealistic, 
magazine quality
```

---

### 4B — Living · Painel Ripado

**Arquivo:** `execucao-02-living-painel-ripado.webp`  
**Projeto:** Painel Acústico Ripado · MDF Freijó  
**Proporção:** 4:3 · **1200 × 900 px**

```
Modern living room feature wall with vertical slatted wood panel in light freijó 
tone, acoustic ripado design, integrated hidden doors, warm floor lamp glow, 
minimalist sofa silhouette blurred in foreground, brown cream and terracotta 
palette, architectural interior photo, no people
```

---

### 4C — Closet · Minimalista Lacca

**Arquivo:** `execucao-03-closet-minimalista-lacca.webp`  
**Projeto:** Closet Minimalista · Lacca Fosca + LED  
**Proporção:** 4:3 · **1200 × 900 px**

```
Walk-in closet minimalist design, matte white lacca built-in wardrobes, 
integrated LED profile lighting warm 3000K, open hanging section with wood drawer 
interior, clean lines, luxury organization, soft brown ambient reflection on floor, 
photorealistic interior, no people
```

### Sugestão profissional (execuções)

- Três ambientes **distintos** (cozinha / living / closet) mas **mesma linguagem** de luz quente.
- A cozinha (4A) é a mais importante — aparece maior no grid desktop e no carrossel mobile.

---

## 05 — SOCIAL · Compartilhamento (`05-social/`)

**Arquivo:** `social-og-compartilhamento.webp`  
**Onde entra:** `og:image`, WhatsApp link preview  
**Proporção:** 1.91:1 · **1200 × 630 px**

### Prompt principal

```
Wide cinematic crop of luxury brown kitchen interior same style as hero cover, 
warm walnut cabinetry, soft golden light, negative space on left third for 
optional text overlay, premium joinery brand aesthetic, photorealistic, 
no text, no logo, earthy palette #3E3129 #C49A6C #E8E5E1
```

### Sugestão profissional

- Pode ser **crop central** da `hero-capa-marrom.webp` reexportada em 1200×630.
- Testar preview no [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) após deploy.

---

## Abas sem imagem própria (não gerar)

| Aba | Motivo |
|---|---|
| **Experiências** (`#depoimentos`) | Tipografia + cards — sem foto de cliente |
| **Dúvidas** (`#faq`) | Accordion textual |
| **Rodapé** | Selo SVG + ícones Font Awesome |
| **Modal / formulário** | UI only |

Opcional futuro: foto ambiente desfocada em `#depoimentos` — **não prioritário**.

---

## Ordem de produção recomendada

1. `hero-capa-marrom.webp` — ancora visual  
2. `social-og-compartilhamento.webp` — crop do hero  
3. Três `execucao-*.webp` — prova social visual  
4. Quatro `anatomia-0*.webp` + fundo  
5. `solucao-detalhe-marcenaria-blum.webp` — detalhe técnico  

---

## Depois de gerar — como instalar no site

1. Salve cada arquivo **com o nome exato** na pasta correspondente.  
2. Avise para trocar URLs Unsplash no `index.html` por:

```html
<!-- Exemplo hero -->
style="background-image: url('/assets/images/01-hero/hero-capa-marrom.webp');"

<!-- Exemplo card -->
<img src="/assets/images/03-anatomia/anatomia-01-chapas-premium.webp" ...>
```

3. Consulte `manifest.json` para dimensões e alvos HTML.

---

## Resumo de arquivos (11 imagens)

| # | Pasta | Nome do arquivo | Seção do site |
|---|---|---|---|
| 1 | `01-hero` | `hero-capa-marrom.webp` | Capa |
| 2 | `02-solucao` | `solucao-detalhe-marcenaria-blum.webp` | A Solução |
| 3 | `03-anatomia` | `anatomia-bg-atelier-escuro.webp` | Diferenciais (fundo) |
| 4 | `03-anatomia` | `anatomia-01-chapas-premium.webp` | Pilar Material |
| 5 | `03-anatomia` | `anatomia-02-ferragens-importadas.webp` | Pilar Ferragens |
| 6 | `03-anatomia` | `anatomia-03-projeto-tecnico-3d.webp` | Pilar Projeto 3D |
| 7 | `03-anatomia` | `anatomia-04-instalacao-premium.webp` | Pilar Instalação |
| 8 | `04-execucoes` | `execucao-01-cozinha-gourmet-nogueira.webp` | Execução destaque |
| 9 | `04-execucoes` | `execucao-02-living-painel-ripado.webp` | Execução living |
| 10 | `04-execucoes` | `execucao-03-closet-minimalista-lacca.webp` | Execução closet |
| 11 | `05-social` | `social-og-compartilhamento.webp` | Redes / WhatsApp |

---

*Projeto Essentiel · glid.ia.br · Tendência Landing*
