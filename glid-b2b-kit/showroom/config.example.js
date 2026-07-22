// Mesclar no APP_CONFIG — v2 landing pages (marcenarias)
window.APP_CONFIG = Object.assign(window.APP_CONFIG || {}, {
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
    acquireWhatsApp: "5549999084031",
    acquireContactName: "Tiago",
    acquireMessage:
      "Olá, Tiago. Naveguei no protótipo e decidi licenciar esta estrutura para a minha marcenaria por R$ 14.997. Estou de acordo com os prazos (no ar em até 10 dias úteis após envio do material) e com a forma de pagamento (50% de entrada / 50% na entrega). Entendi que o escopo não inclui tráfego ou gestão de anúncios. Pode me enviar a sua chave PIX e a lista exata do que preciso mandar para começarmos?"
  },
  bottomActionBar: {
    enabled: true,
    ownerAfterSection: "#faq",
    hideInSection: "#b2b-owner-guide"
  }
});
