(function () {
  window.scrollToOwnerGuide = function () {
    const guideCfg = (window.APP_CONFIG || {}).ownerGuide || {};
    const containerId = guideCfg.scrollContainerId || 'scroll-container';
    const container = document.getElementById(containerId);
    const target = document.getElementById('owner-guide-section');
    if (!container || !target || target.hidden) return;

    const header = document.querySelector('.fixed-top-header');
    const headerHeight = header ? header.offsetHeight : 130;
    const containerTop = container.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const offset = container.scrollTop + (targetTop - containerTop) - headerHeight - 12;

    container.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
  };

  window.initProtocolDemoHints = function () {
    const isDemo = window.isShowroomDemoMode();
    const guideCfg = (window.APP_CONFIG || {}).ownerGuide || {};
    const sectionHint = document.getElementById('protocols-demo-hint');
    const jump = document.getElementById('owner-guide-jump');
    const demoCopy =
      guideCfg.demoCardCopy ||
      'Clique aqui e veja como a mensagem chegará no <strong>WhatsApp do seu negócio</strong>';
    const selector = guideCfg.serviceCardSelector || '.solid-card[data-base-price]';

    if (sectionHint) {
      sectionHint.hidden = !isDemo;
      if (guideCfg.protocolsHint) sectionHint.innerHTML = guideCfg.protocolsHint;
    }

    if (jump) {
      jump.hidden = !isDemo;
      if (guideCfg.jumpLinkLabel) jump.textContent = guideCfg.jumpLinkLabel;
      jump.onclick = function () {
        window.scrollToOwnerGuide();
      };
    }

    document.querySelectorAll(selector).forEach(function (card) {
      var demoCta = card.querySelector('.card-demo-cta');

      if (!isDemo) {
        if (demoCta) demoCta.remove();
        return;
      }

      if (!demoCta) {
        demoCta = document.createElement('div');
        demoCta.className = 'card-demo-cta';
        demoCta.setAttribute('aria-hidden', 'true');
        demoCta.innerHTML =
          '<span class="card-demo-cta__icon" aria-hidden="true">💬</span>' +
          '<div class="card-demo-cta__body">' +
          '<span class="card-demo-cta__badge">Versão demonstração</span>' +
          '<p class="card-demo-cta__text"></p>' +
          '</div>' +
          '<span class="card-demo-cta__arrow" aria-hidden="true">→</span>';
        card.appendChild(demoCta);
      }

      var textNode = demoCta.querySelector('.card-demo-cta__text');
      if (textNode) textNode.innerHTML = demoCopy;
    });
  };

  window.initOwnerGuide = function () {
    const isDemo = window.isShowroomDemoMode();
    const section = document.getElementById('owner-guide-section');
    const footerNote = document.getElementById('footer-bottom-note');
    const guideCfg = (window.APP_CONFIG || {}).ownerGuide || {};
    const navConfig = (window.APP_CONFIG || {}).showroomNav || {};

    if (section) section.hidden = !isDemo;
    if (!isDemo) return;

    const acquireUrl = window.buildAcquireWhatsAppUrl();

    const domainPrimary = document.getElementById('owner-guide-domain-primary');
    const domainAlts = document.getElementById('owner-guide-domain-alts');
    const priceTag = document.getElementById('owner-guide-price');
    const acquireLink = document.getElementById('owner-guide-acquire');
    const retryBtn = document.getElementById('owner-guide-retry');

    if (domainPrimary) domainPrimary.textContent = guideCfg.domainExample || 'suamarca.com.br';
    if (domainAlts && Array.isArray(guideCfg.domainExamples)) {
      domainAlts.textContent = 'Exemplos: ' + guideCfg.domainExamples.join(' · ');
    }
    if (priceTag) priceTag.textContent = navConfig.priceValue || 'R$ 2.497';
    if (acquireLink) acquireLink.href = acquireUrl;

    if (retryBtn) {
      const fnName = guideCfg.scrollToServicesGlobal || 'scrollToProtocols';
      retryBtn.onclick = function () {
        if (typeof window[fnName] === 'function') window[fnName]();
      };
    }

    if (footerNote && guideCfg.footerAcquireHtml) {
      footerNote.innerHTML = guideCfg.footerAcquireHtml.replace(/\{acquireUrl\}/g, acquireUrl);
    } else if (footerNote) {
      footerNote.innerHTML =
        'Demonstração gl.id · <a href="' +
        acquireUrl +
        '" target="_blank" rel="noopener noreferrer" style="color:#b8860b;text-decoration:underline;">Adquirir com seu domínio</a>';
    }

    const stickyAcquire = document.getElementById('sticky-acquire');
    if (stickyAcquire) {
      stickyAcquire.href = acquireUrl;
      stickyAcquire.hidden = false;
    }

    const tabs = section ? section.querySelectorAll('[data-owner-tab]') : [];
    const panels = {
      agility: document.getElementById('owner-panel-agility'),
      pricing: document.getElementById('owner-panel-pricing'),
      domain: document.getElementById('owner-panel-domain'),
      delivery: document.getElementById('owner-panel-delivery'),
    };

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const key = tab.getAttribute('data-owner-tab');
        tabs.forEach(function (t) {
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        Object.keys(panels).forEach(function (id) {
          const panel = panels[id];
          if (!panel) return;
          const show = id === key;
          panel.classList.toggle('is-active', show);
          panel.hidden = !show;
        });
      });
    });
  };

  window.initGlidB2bKit = function () {
    if (typeof window.initProtocolDemoHints === 'function') window.initProtocolDemoHints();
    if (typeof window.initOwnerGuide === 'function') window.initOwnerGuide();
  };
})();
