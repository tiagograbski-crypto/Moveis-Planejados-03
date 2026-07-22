// Mesclar no APP_CONFIG — textos e seletores do guia B2B
window.APP_CONFIG = Object.assign(window.APP_CONFIG || {}, {
  booking: {
    /** true = showroom (mensagem vai pro WhatsApp digitado). false = produção do cliente. */
    demoPreviewToTypedPhone: true,
  },
  ownerGuide: {
    domainExample: 'suamarca.com.br',
    domainExamples: ['souamarca.com.br', 'suaclinica.com.br', 'seunegocio.com.br'],
    /** Seletor CSS dos cards de serviço que recebem o selo "demonstração" */
    serviceCardSelector: '.solid-card[data-base-price]',
    demoCardCopy:
      'Clique aqui e veja como a mensagem chegará no <strong>WhatsApp do seu negócio</strong>',
    protocolsHint:
      'Versão demonstração — toque em qualquer serviço, informe seu WhatsApp e veja a mensagem que chegará no <strong>seu negócio</strong>.',
    jumpLinkLabel: 'Dono do negócio? Veja preços, domínio e entrega ↓',
    /** ID do container scrollável da página (ex.: scroll-container) */
    scrollContainerId: 'scroll-container',
    /** Função global para voltar aos serviços ao clicar "Testar de novo" */
    scrollToServicesGlobal: 'scrollToProtocols',
  },
});
