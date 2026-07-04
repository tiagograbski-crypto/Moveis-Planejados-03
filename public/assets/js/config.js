window.APP_CONFIG = Object.assign(
  {
    whatsappNumber: "5549999508884",
    menuEnabled: true,
    menuItems: [
      { label: "Início", href: "#inicio" },
      { label: "Método Tendência", href: "#solucao" },
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
