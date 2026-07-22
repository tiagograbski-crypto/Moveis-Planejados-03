(function () {
  window.isShowroomDemoMode = function () {
    return (window.APP_CONFIG.booking || {}).demoPreviewToTypedPhone !== false;
  };

  window.buildAcquireWhatsAppUrl = function () {
    const navConfig = (window.APP_CONFIG || {}).showroomNav || {};
    const acquireWhatsApp =
      typeof window.resolveB2bAcquireWhatsApp === 'function'
        ? window.resolveB2bAcquireWhatsApp(navConfig.acquireWhatsApp)
        : String(navConfig.acquireWhatsApp || '5549999084031').replace(/\D/g, '');
    const acquireContactName = navConfig.acquireContactName || 'Tiago';
    const modelLabel = navConfig.modelLabel || 'Modelo Web App (gl.id)';
    const priceValue = navConfig.priceValue || 'R$ 2.497';
    let acquireMessageTemplate =
      navConfig.acquireMessage ||
      'Olá, {contact}! Acessei o ambiente showroom gl.id e tenho interesse em adquirir esta estrutura. Podemos conversar?';

    acquireMessageTemplate = acquireMessageTemplate
      .replace(/\{modelLabel\}/g, modelLabel)
      .replace(/\{priceValue\}/g, priceValue)
      .replace(/\{contact\}/g, acquireContactName);

    const message = window.sanitizeWhatsAppMessage
      ? window.sanitizeWhatsAppMessage(acquireMessageTemplate)
      : acquireMessageTemplate;

    return 'https://wa.me/' + acquireWhatsApp + '?text=' + encodeURIComponent(message);
  };

  window.initGlidB2bAcquireLinks = function (selector) {
    const url = window.buildAcquireWhatsAppUrl();
    document.querySelectorAll(selector || '[data-glid-acquire]').forEach(function (el) {
      if (el.tagName === 'A') el.href = url;
    });
    return url;
  };
})();
