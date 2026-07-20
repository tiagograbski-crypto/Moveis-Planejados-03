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
    googleReviews: {
      enabled: true,
      rating: 4.9,
      reviewCount: 87,
      profileUrl:
        "https://www.google.com/maps/search/?api=1&query=M%C3%B3veis+Planejados+Chapec%C3%B3"
    },
    guarantee: {
      structureYears: 5,
      hardwareYears: 2,
      contractNote: "Termos, prazos e coberturas definidos em contrato antes da produção."
    },
    footerTrust: {
      projectCount: "+2.000 projetos",
      projectRegion: "Oeste de SC",
      guaranteeLabel: "5 anos garantia",
      googleRating: "4,9 Google",
      location: "Chapecó · SC"
    },
    mapsEmbedUrl:
      "https://maps.google.com/maps?q=Av.+Get%C3%BAlio+Vargas,+1200,+Chapec%C3%B3+-+SC,+89800-000&hl=pt-BR&z=15&output=embed",
    mapsLinkUrl:
      "https://www.google.com/maps/search/?api=1&query=M%C3%B3veis+Planejados+Chapec%C3%B3",
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
      statusLabel: "Disponível",
      modelLabel: "Modelo SEO Local (gl.id)",
      priceValue: "R$ 2.497",
      deliveryLabel: "Entrega em 72 horas",
      portfolioUrl: "https://www.glid.ia.br/",
      acquireWhatsApp: "5549999999999",
      acquireContactName: "Tiago",
      acquireMessage:
        "Olá, {contact}! Acessei o ambiente showroom gl.id e tenho interesse em adquirir esta estrutura (Modelo SEO Local — R$ 2.497). Podemos conversar?"
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
  const BLOCKED_SAMPLE_WHATSAPP = new Set([
    "5549999508884",
    "5549999084031",
    "5500000000000"
  ]);

  const BLOCKED_SAMPLE_PHONE_PATTERNS = [
    /\+?55\s*49\s*99950[-\s]?8884/gi,
    /\+?55\s*49\s*99908[-\s]?4031/gi,
    /\(49\)\s*99950[-\s]?8884/gi,
    /\(49\)\s*99908[-\s]?4031/gi,
    /5549999508884/g,
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

    BLOCKED_SAMPLE_PHONE_PATTERNS.forEach(function (pattern) {
      text = text.replace(pattern, "");
    });

    return text.replace(/\n{3,}/g, "\n\n").trim();
  };
})();
