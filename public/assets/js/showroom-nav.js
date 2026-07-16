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
  const countdownWrap = document.getElementById("showroom-nav-countdown");
  const timerNode = document.getElementById("showroom-nav-timer");
  const portfolioLink = document.getElementById("showroom-nav-portfolio");
  const acquireLink = document.getElementById("showroom-nav-acquire");

  if (!nav || !toggle || !panel || !statusValue || !countdownWrap || !timerNode) {
    return;
  }

  const expiryHour = Number.isFinite(navConfig.expiryHour) ? navConfig.expiryHour : 20;
  const expiryMinute = Number.isFinite(navConfig.expiryMinute) ? navConfig.expiryMinute : 0;
  const exclusiveLabel = navConfig.exclusiveLicenseLabel || "Tendência Móveis";
  const portfolioUrl = navConfig.portfolioUrl || "https://www.glid.ia.br/";
  const acquireWhatsApp = String(navConfig.acquireWhatsApp || "5549999084031").replace(/\D/g, "");
  const acquireContactName = navConfig.acquireContactName || "Tiago";
  const acquireMessageTemplate =
    navConfig.acquireMessage ||
    "Olá, {contact}! Acessei o ambiente showroom gl.id da {client} e tenho interesse em adquirir esta estrutura. Podemos conversar?";
  const storageKey = "showroom-nav-collapsed";

  function buildAcquireWhatsAppUrl() {
    const message = acquireMessageTemplate
      .replace(/\{contact\}/g, acquireContactName)
      .replace(/\{client\}/g, exclusiveLabel);

    return "https://wa.me/" + acquireWhatsApp + "?text=" + encodeURIComponent(message);
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
          client_label: exclusiveLabel,
          contact_name: acquireContactName
        });
      }
    });
  }

  statusValue.textContent = "Licença Exclusiva: " + exclusiveLabel;

  function getExpiryDate() {
    const expiry = new Date();
    expiry.setHours(expiryHour, expiryMinute, 0, 0);
    return expiry;
  }

  function padTime(value) {
    return String(value).padStart(2, "0");
  }

  function setExpiredState() {
    nav.classList.add("is-expired");
    statusValue.textContent = "Licença Disponível para Aquisição";
    countdownWrap.hidden = true;
    timerNode.removeAttribute("datetime");
  }

  function updateCountdown() {
    const now = Date.now();
    const expiry = getExpiryDate().getTime();
    const remaining = expiry - now;

    if (remaining <= 0) {
      setExpiredState();
      return false;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    timerNode.textContent = padTime(hours) + "h " + padTime(minutes) + "m " + padTime(seconds) + "s";
    timerNode.setAttribute("datetime", new Date(expiry).toISOString());
    return true;
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

  let countdownIntervalId = 0;

  if (updateCountdown()) {
    countdownIntervalId = window.setInterval(function () {
      if (!updateCountdown()) {
        window.clearInterval(countdownIntervalId);
      }
    }, 1000);
  }
})();
