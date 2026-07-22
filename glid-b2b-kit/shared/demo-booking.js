(function () {
  window.parseCustomerWhatsApp = function (phoneValue) {
    let digits = String(phoneValue || '').replace(/\D/g, '');
    if (digits.length === 11) digits = '55' + digits;
    if (digits.length === 10) digits = '55' + digits;
    return digits.length >= 12 ? digits : '';
  };

  window.getBookingWhatsAppDestination = function (state) {
    const bookingCfg = window.APP_CONFIG.booking || {};
    const customerPhone = window.parseCustomerWhatsApp(state && state.phoneValue);

    if (bookingCfg.demoPreviewToTypedPhone !== false && customerPhone) {
      return customerPhone;
    }

    const brandPhone = (window.APP_CONFIG.brand || {}).whatsapp;
    return typeof window.resolveWhatsAppNumber === 'function'
      ? window.resolveWhatsAppNumber(brandPhone)
      : String(brandPhone || '').replace(/\D/g, '');
  };

  /**
   * @param {object} state — estado do drawer de agendamento
   * @param {function} buildClientMessage — (state) => string — mensagem sem wrapper demo
   */
  window.wrapDemoBookingMessage = function (state, buildClientMessage) {
    const bookingCfg = window.APP_CONFIG.booking || {};
    const isDemo = bookingCfg.demoPreviewToTypedPhone !== false;
    const clientRequest = buildClientMessage(state);

    if (!isDemo) return clientRequest;

    const businessLabel =
      (window.APP_CONFIG.ownerGuide && window.APP_CONFIG.ownerGuide.businessLabel) ||
      'seu negócio';

    return (
      '👀 *DEMONSTRAÇÃO DO SISTEMA*\n' +
      'Veja como *você receberá* a mensagem do seu cliente no WhatsApp:\n\n' +
      '━━━━━━━━━━━━━━━━━━━━━\n\n' +
      clientRequest +
      '\n\n━━━━━━━━━━━━━━━━━━━━━\n' +
      '_No app ao vivo, esta mensagem chega direto no WhatsApp da ' +
      businessLabel +
      ' — com o número que você configurar no deploy._'
    );
  };
})();
