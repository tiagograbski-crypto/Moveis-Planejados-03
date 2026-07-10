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
    showcaseVideo: {
      enabled: true,
      poster: "sobre/equipe-tendencia-obra.jpg",
      youtubeId: ""
    },
    leadOffer: {
      headline: "Orçamento sem compromisso",
      responseSla: "Resposta em horário comercial"
    },
    tracking: {
      environment: "staging",
      gtmEnabled: true,
      gtmContainerId: ""
    }
  },
  window.APP_CONFIG || {}
);
