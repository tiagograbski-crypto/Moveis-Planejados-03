window.APP_CONFIG = Object.assign(
  {
    brandName: "Sua Marca",
    siteUrl: "https://www.seusite.com.br",
    whatsappNumber: "5549999999999",
    phoneDisplay: "(49) 99999-9999",
    phoneTel: "+5549999999999",
    email: "contato@seusite.com.br",
    menuEnabled: true,
    menuItems: [
      { label: "Início", href: "#hero" },
      { label: "Abordagem", href: "#solucao" },
      { label: "Diferenciais", href: "#diferenciais" },
      { label: "Processo", href: "#jornada-execucao" },
      { label: "Garantia", href: "#garantia" },
      { label: "Sobre", href: "#sobre" },
      { label: "Materiais", href: "#estacao-materiais" },
      { label: "Projetos", href: "#portfolio" },
      { label: "FAQ", href: "#faq" }
    ],
    clientAvatars: [
      { src: "assets/images/clientes/cliente-01.jpg", alt: "" },
      { src: "assets/images/clientes/cliente-02.jpg", alt: "" },
      { src: "assets/images/clientes/cliente-03.jpg", alt: "" },
      { src: "assets/images/clientes/cliente-04.jpg", alt: "" }
    ],
    clientPlaceholders: {
      city: "Sua cidade",
      stateCode: "SC",
      region: "Sua região",
      cityState: "Sua cidade · SC",
      cityAndRegion: "Sua cidade e região",
      heroEyebrow: "Sua cidade · Residencial & Comercial",
      serviceArea:
        "Atendemos sua cidade e região de atuação — residencial e comercial.",
      footerTagline:
        "Móveis planejados na sua região. Residencial e comercial — projeto, produção e instalação."
    },
    googleReviews: {
      enabled: true,
      rating: 4.9,
      reviewCount: 87,
      profileUrl:
        "https://www.google.com/maps/search/?api=1&query=M%C3%B3veis+Planejados"
    },
    guarantee: {
      structureYears: 5,
      hardwareYears: 2,
      contractNote: "Termos, prazos e coberturas definidos em contrato antes da produção."
    },
    footerTrust: {
      projectCount: "+2.000 projetos",
      projectRegion: "Sua região",
      guaranteeLabel: "5 anos garantia",
      googleRating: "4,9 Google",
      location: "Sua cidade · SC"
    },
    mapsEmbedUrl:
      "https://maps.google.com/maps?q=Brasil&hl=pt-BR&z=4&output=embed",
    mapsLinkUrl:
      "https://www.google.com/maps/search/?api=1&query=M%C3%B3veis+Planejados",
    showcaseVideo: {
      enabled: true,
      poster: "sobre/equipe-obra.jpg",
      youtubeId: ""
    },
    leadOffer: {
      headline: "Orçamento sem compromisso",
      responseSla: "Resposta em horário comercial"
    },
    // Mobile — intensidade da iluminação ao rolar (cards sempre legíveis; 1–4 só muda o foco ativo)
    featureHighlightLevel: 3,
    showroomNav: {
      enabled: true,
      eyebrowLabel: "Ambiente de Homologação",
      statusLabel: "Licenciamento exclusivo na região",
      modelLabel: "Site pronto para sua marcenaria",
      anchorPriceValue: "R$ 24.997",
      priceValue: "R$ 14.997",
      priceNote: "pagamento único · 50% entrada · 50% na entrega",
      deliveryLabel: "No ar em 7 a 10 dias úteis após envio do material",
      portfolioUrl: "https://www.glid.ia.br/",
      portfolioButtonLabel: "Ver portfólio GLID",
      acquireButtonLabel: "Quero licenciar esta estrutura para a minha marcenaria",
      guideButtonLabel: "Ver o que está incluso ↓",
      acquireWhatsApp: "5549999999999",
      acquireContactName: "Tiago",
      acquireMessage:
        "Olá, Tiago. Naveguei no protótipo e decidi licenciar esta estrutura para a minha marcenaria por R$ 14.997. Estou de acordo com os prazos (no ar em até 10 dias úteis após envio do material) e com a forma de pagamento (50% de entrada / 50% na entrega). Entendi que o escopo não inclui tráfego ou gestão de anúncios. Pode me enviar a sua chave PIX e a lista exata do que preciso mandar para começarmos?"
    },
    tracking: {
      environment: "staging",
      gtmEnabled: true,
      gtmContainerId: ""
    }
  },
  window.APP_CONFIG || {}
);

(function () {
  const PLACEHOLDER_WHATSAPP = "5549999999999";
  const PLACEHOLDER_PHONE_DISPLAY = "(49) 99999-9999";
  const BLOCKED_SAMPLE_WHATSAPP = new Set([
    "5549999508884",
    "5549999084031",
    "5500000000000"
  ]);

  const BLOCKED_SAMPLE_PHONE_REPLACEMENTS = [
    [/\+?55\s*49\s*99950[-\s]?8884/gi, PLACEHOLDER_PHONE_DISPLAY],
    [/\(49\)\s*99950[-\s]?8884/gi, PLACEHOLDER_PHONE_DISPLAY],
    [/5549999508884/g, PLACEHOLDER_WHATSAPP]
  ];

  const BLOCKED_SAMPLE_PHONE_PATTERNS = [
    /\+?55\s*49\s*99908[-\s]?4031/gi,
    /\(49\)\s*99908[-\s]?4031/gi,
    /5549999084031/g
  ];

  window.resolveWhatsAppNumber = function (value) {
    const digits = String(value || "").replace(/\D/g, "");

    if (!digits || BLOCKED_SAMPLE_WHATSAPP.has(digits)) {
      return PLACEHOLDER_WHATSAPP;
    }

    return digits;
  };

  window.sanitizeWhatsAppMessage = function (message) {
    let text = String(message || "");

    BLOCKED_SAMPLE_PHONE_REPLACEMENTS.forEach(function (entry) {
      text = text.replace(entry[0], entry[1]);
    });

    BLOCKED_SAMPLE_PHONE_PATTERNS.forEach(function (pattern) {
      text = text.replace(pattern, "");
    });

    return text.replace(/\n{3,}/g, "\n\n").trim();
  };
})();
