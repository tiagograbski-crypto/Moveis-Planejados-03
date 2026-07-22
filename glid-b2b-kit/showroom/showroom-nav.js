(function () {
  const appConfig = window.APP_CONFIG || {};
  const navConfig = appConfig.showroomNav || {};
  const nav = document.getElementById("showroom-nav");

  if (navConfig.enabled === false) {
    if (nav) {
      nav.hidden = true;
    }
    const b2bGuide = document.getElementById("b2b-owner-guide");
    if (b2bGuide) {
      b2bGuide.hidden = true;
    }
    return;
  }

  const toggle = document.getElementById("showroom-nav-toggle");
  const panel = document.getElementById("showroom-nav-panel");
  const eyebrowNode = document.getElementById("showroom-nav-eyebrow");
  const statusValue = document.getElementById("showroom-nav-status");
  const priceLabel = document.getElementById("showroom-nav-price-label");
  const anchorPriceValue = document.getElementById("showroom-nav-price-anchor");
  const priceValue = document.getElementById("showroom-nav-price-value");
  const priceNote = document.getElementById("showroom-nav-price-note");
  const deliveryNode = document.getElementById("showroom-nav-delivery");
  const portfolioLink = document.getElementById("showroom-nav-portfolio");
  const acquireLink = document.getElementById("showroom-nav-acquire");
  const guideLink = document.getElementById("showroom-nav-guide");
  const b2bGuideAcquire = document.getElementById("b2b-owner-guide-acquire");
  const b2bGuideAnchorPrice = document.getElementById("b2b-guide-anchor-price");
  const b2bGuidePrice = document.getElementById("b2b-guide-price");
  const b2bGuidePriceInline = document.getElementById("b2b-guide-price-inline");

  if (!nav || !toggle || !panel || !statusValue || !priceLabel || !priceValue) {
    return;
  }

  const eyebrowLabel = navConfig.eyebrowLabel || "Ambiente de Homologação";
  const statusLabel = navConfig.statusLabel || "Licenciamento exclusivo na região";
  const modelLabel = navConfig.modelLabel || "Site pronto para sua marcenaria";
  const anchorPriceText = navConfig.anchorPriceValue || "R$ 24.997";
  const priceText = navConfig.priceValue || "R$ 14.997";
  const priceNoteText = navConfig.priceNote || "pagamento único · 50% entrada · 50% na entrega";
  const deliveryLabel =
    navConfig.deliveryLabel || "No ar em 7 a 10 dias úteis após envio do material";
  const portfolioUrl = navConfig.portfolioUrl || "https://www.glid.ia.br/";
  const portfolioButtonLabel = navConfig.portfolioButtonLabel || "Ver portfólio GLID";
  const acquireButtonLabel =
    navConfig.acquireButtonLabel || "Quero licenciar esta estrutura para a minha marcenaria";
  const guideButtonLabel = navConfig.guideButtonLabel || "Ver o que está incluso ↓";
  const acquireWhatsApp =
    typeof window.resolveWhatsAppNumber === "function"
      ? window.resolveWhatsAppNumber(navConfig.acquireWhatsApp)
      : String(navConfig.acquireWhatsApp || "5549999999999").replace(/\D/g, "");
  const acquireContactName = navConfig.acquireContactName || "Tiago";
  const acquireMessageTemplate =
    navConfig.acquireMessage ||
    "Olá, Tiago. Naveguei no protótipo e decidi licenciar esta estrutura para a minha marcenaria por R$ 14.997. Estou de acordo com os prazos (no ar em até 10 dias úteis após envio do material) e com a forma de pagamento (50% de entrada / 50% na entrega). Entendi que o escopo não inclui tráfego ou gestão de anúncios. Pode me enviar a sua chave PIX e a lista exata do que preciso mandar para começarmos?";
  const storageKey = "showroom-nav-collapsed";

  function buildAcquireWhatsAppUrl() {
    const message = window.sanitizeWhatsAppMessage
      ? window.sanitizeWhatsAppMessage(acquireMessageTemplate)
      : acquireMessageTemplate;

    return "https://wa.me/" + acquireWhatsApp + "?text=" + encodeURIComponent(message);
  }

  function trackAcquireClick(source) {
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "showroom_acquire_click",
        acquire_source: source,
        model_label: modelLabel,
        anchor_price_value: anchorPriceText,
        price_value: priceText,
        contact_name: acquireContactName
      });
    }
  }

  const acquireUrl = buildAcquireWhatsAppUrl();

  nav.classList.add("is-available");
  nav.setAttribute("aria-label", eyebrowLabel);

  if (eyebrowNode) {
    eyebrowNode.textContent = eyebrowLabel;
  }

  statusValue.textContent = statusLabel;
  priceLabel.textContent = modelLabel;

  if (anchorPriceValue) {
    anchorPriceValue.textContent = anchorPriceText;
    anchorPriceValue.hidden = !anchorPriceText;
  }

  priceValue.textContent = priceText;

  if (priceNote) {
    priceNote.textContent = priceNoteText;
    priceNote.hidden = !priceNoteText;
  }

  if (deliveryNode) {
    deliveryNode.textContent = deliveryLabel;
  }

  if (b2bGuideAnchorPrice) {
    b2bGuideAnchorPrice.textContent = anchorPriceText;
  }

  if (b2bGuidePrice) {
    b2bGuidePrice.textContent = priceText;
  }

  if (b2bGuidePriceInline) {
    b2bGuidePriceInline.textContent = priceText;
  }

  if (portfolioLink) {
    portfolioLink.href = portfolioUrl;
    portfolioLink.textContent = portfolioButtonLabel;
  }

  if (guideLink) {
    guideLink.textContent = guideButtonLabel;
    guideLink.addEventListener("click", function () {
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: "showroom_guide_scroll_click",
          model_label: modelLabel,
          price_value: priceText
        });
      }
    });
  }

  if (acquireLink) {
    acquireLink.href = acquireUrl;
    acquireLink.textContent = acquireButtonLabel;
    acquireLink.addEventListener("click", function () {
      trackAcquireClick("showroom_nav");
    });
  }

  if (b2bGuideAcquire) {
    b2bGuideAcquire.href = acquireUrl;
    b2bGuideAcquire.addEventListener("click", function () {
      trackAcquireClick("b2b_owner_guide");
    });
  }

  document.querySelectorAll("[data-b2b-acquire]").forEach(function (node) {
    if (node === b2bGuideAcquire) {
      return;
    }

    node.href = acquireUrl;
    node.addEventListener("click", function () {
      trackAcquireClick("b2b_owner_guide_mid");
    });
  });

  function setCollapsed(collapsed) {
    nav.classList.toggle("is-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    toggle.setAttribute(
      "aria-label",
      collapsed ? "Expandir painel de homologação" : "Recolher painel de homologação"
    );

    try {
      sessionStorage.setItem(storageKey, collapsed ? "1" : "0");
    } catch (error) {
      /* ignore */
    }
  }

  toggle.addEventListener("click", function () {
    setCollapsed(!nav.classList.contains("is-collapsed"));
  });

  let savedCollapsed = false;

  try {
    savedCollapsed = sessionStorage.getItem(storageKey) === "1";
  } catch (error) {
    savedCollapsed = false;
  }

  if (savedCollapsed || window.matchMedia("(max-width: 47.9375em)").matches) {
    setCollapsed(true);
  }
})();
