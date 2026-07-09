window.APP_CONFIG = Object.assign(
  {
    whatsappNumber: "5549999508884",
    menuEnabled: true,
    menuItems: [
      { label: "Início", href: "#hero" },
      { label: "Método Tendência", href: "#solucao" },
      { label: "Diferenciais", href: "#diferenciais" },
      { label: "Jornada", href: "#jornada-execucao" },
      { label: "Sobre", href: "#sobre" },
      { label: "Materiais", href: "#estacao-materiais" },
      { label: "Projetos Executados", href: "#portfolio" },
      { label: "FAQ", href: "#faq" }
    ],
    tracking: {
      environment: "staging",
      gtmEnabled: true,
      gtmContainerId: ""
    }
  },
  window.APP_CONFIG || {}
);
