(function () {
  const appConfig = window.APP_CONFIG || {};
  const navConfig = appConfig.showroomNav || {};
  const nav = document.getElementById("showroom-nav");

  if (navConfig.enabled === false) {
    if (nav) {
      nav.hidden = true;
    }
    return;
  }

  const toggle = document.getElementById("showroom-nav-toggle");
  const panel = document.getElementById("showroom-nav-panel");
  const statusValue = document.getElementById("showroom-nav-status");
  const priceLabel = document.getElementById("showroom-nav-price-label");
  const priceValue = document.getElementById("showroom-nav-price-value");
  const deliveryNode = document.getElementById("showroom-nav-delivery");
  const portfolioLink = document.getElementById("showroom-nav-portfolio");
  const acquireLink = document.getElementById("showroom-nav-acquire");

  if (!nav || !toggle || !panel || !statusValue || !priceLabel || !priceValue) {
    return;
  }

  const statusLabel = navConfig.statusLabel || "Disponível";
  const modelLabel = navConfig.modelLabel || "Modelo SEO Local (gl.id)";
  const priceText = navConfig.priceValue || "R$ 2.497";
  const deliveryLabel = navConfig.deliveryLabel || "Entrega em 72 horas";
  const portfolioUrl = navConfig.portfolioUrl || "https://www.glid.ia.br/";
  const acquireWhatsApp =
    typeof window.resolveWhatsAppNumber === "function"
      ? window.resolveWhatsAppNumber(navConfig.acquireWhatsApp)
      : String(navConfig.acquireWhatsApp || "5549999999999").replace(/\D/g, "");
  const acquireContactName = navConfig.acquireContactName || "Tiago";
  const acquireMessageTemplate =
    navConfig.acquireMessage ||
    "Olá, {contact}! Acessei o ambiente showroom gl.id e tenho interesse em adquirir esta estrutura (Modelo SEO Local — R$ 2.497). Podemos conversar?";
  const storageKey = "showroom-nav-collapsed";

  function buildAcquireWhatsAppUrl() {
    const rawMessage = acquireMessageTemplate.replace(/\{contact\}/g, acquireContactName);
    const message = window.sanitizeWhatsAppMessage
      ? window.sanitizeWhatsAppMessage(rawMessage)
      : rawMessage;

    return "https://wa.me/" + acquireWhatsApp + "?text=" + encodeURIComponent(message);
  }

  nav.classList.add("is-available");
  statusValue.textContent = statusLabel;
  priceLabel.textContent = modelLabel;
  priceValue.textContent = priceText;
  if (deliveryNode) {
    deliveryNode.textContent = deliveryLabel;
  }

  if (portfolioLink) {
    portfolioLink.href = portfolioUrl;
  }

  if (acquireLink) {
    acquireLink.href = buildAcquireWhatsAppUrl();
    acquireLink.addEventListener("click", function () {
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: "showroom_acquire_click",
          model_label: modelLabel,
          price_value: priceText,
          contact_name: acquireContactName
        });
      }
    });
  }

  function setCollapsed(collapsed) {
    nav.classList.toggle("is-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    toggle.setAttribute(
      "aria-label",
      collapsed ? "Expandir painel do showroom" : "Recolher painel do showroom"
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
