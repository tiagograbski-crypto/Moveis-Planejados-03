window.APP_CONFIG = Object.assign(
  {
    whatsappNumber: "5549999508884",
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
        "https://www.google.com/maps/search/?api=1&query=Tend%C3%AAncia+M%C3%B3veis+Planejados+Chapec%C3%B3"
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
      "https://www.google.com/maps/search/?api=1&query=Tend%C3%AAncia+M%C3%B3veis+Planejados+Chapec%C3%B3",
    showcaseVideo: {
      enabled: true,
      poster: "sobre/equipe-tendencia-obra.jpg",
      youtubeId: ""
    },
    leadOffer: {
      headline: "Orçamento sem compromisso",
      responseSla: "Resposta em horário comercial"
    },
    // Mobile — intensidade da iluminação ao rolar (cards sempre legíveis; 1–4 só muda o foco ativo)
    featureHighlightLevel: 3,
    tracking: {
      environment: "staging",
      gtmEnabled: true,
      gtmContainerId: ""
    }
  },
  window.APP_CONFIG || {}
);
