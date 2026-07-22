/**
 * Bottom Action Bar — zonas de scroll (vitrine / proprietário / oculto).
 *
 * Regra padrão:
 * 1. Vitrine (até o FAQ): CTAs do cliente final.
 * 2. Após o FAQ (rodapé): CTAs do proprietário (portfólio gl.id + WhatsApp de aquisição).
 * 3. Dentro de #b2b-owner-guide: barra oculta — o guia tem CTA próprio.
 */
(function () {
  const DEFAULTS = {
    enabled: true,
    ownerAfterSection: "#faq",
    hideInSection: "#b2b-owner-guide",
    hideVisibleRatio: 0.1,
    ownerAfterViewportRatio: 0.72,
    modes: {
      client: {
        secondaryLabel: "Ver projetos",
        secondaryHref: "#portfolio",
        secondaryAriaLabel: "Ver projetos executados",
        primaryLabel: "Iniciar projeto",
        primaryAriaLabel: "Iniciar projeto",
        primaryAction: "lead-modal",
        presenceLabel: null
      },
      owner: {
        secondaryLabel: "Portfólio gl.id",
        secondaryHref: "https://www.glid.ia.br/",
        secondaryAriaLabel: "Ver cases e projetos no site gl.id",
        secondaryExternal: true,
        primaryLabel: "Licenciar estrutura",
        primaryAriaLabel: "Licenciar esta estrutura via WhatsApp",
        primaryAction: "acquire-whatsapp",
        presenceLabel: "WhatsApp · Tiago"
      }
    }
  };

  function getConfig() {
    const userConfig = (window.APP_CONFIG || {}).bottomActionBar || {};
    return {
      enabled: userConfig.enabled !== false,
      ownerAfterSection: userConfig.ownerAfterSection || DEFAULTS.ownerAfterSection,
      hideInSection: userConfig.hideInSection || DEFAULTS.hideInSection,
      hideVisibleRatio:
        typeof userConfig.hideVisibleRatio === "number"
          ? userConfig.hideVisibleRatio
          : DEFAULTS.hideVisibleRatio,
      ownerAfterViewportRatio:
        typeof userConfig.ownerAfterViewportRatio === "number"
          ? userConfig.ownerAfterViewportRatio
          : DEFAULTS.ownerAfterViewportRatio,
      modes: {
        client: Object.assign({}, DEFAULTS.modes.client, userConfig.modes && userConfig.modes.client),
        owner: Object.assign({}, DEFAULTS.modes.owner, userConfig.modes && userConfig.modes.owner)
      }
    };
  }

  function getAcquireWhatsAppUrl() {
    if (typeof window.buildAcquireWhatsAppUrl === "function") {
      return window.buildAcquireWhatsAppUrl();
    }

    const navConfig = ((window.APP_CONFIG || {}).showroomNav) || {};
    const digits =
      typeof window.resolveB2bAcquireWhatsApp === "function"
        ? window.resolveB2bAcquireWhatsApp(navConfig.acquireWhatsApp)
        : String(navConfig.acquireWhatsApp || "5549999084031").replace(/\D/g, "");
    const message = window.sanitizeWhatsAppMessage
      ? window.sanitizeWhatsAppMessage(navConfig.acquireMessage || "")
      : navConfig.acquireMessage || "";

    return "https://wa.me/" + digits + "?text=" + encodeURIComponent(message);
  }

  function getSectionRatioInViewport(section) {
    if (!section) {
      return 0;
    }

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);

    if (visibleHeight <= 0) {
      return 0;
    }

    return visibleHeight / viewportHeight;
  }

  function isPastOwnerThreshold(section, viewportRatio) {
    if (!section) {
      return false;
    }

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom <= viewportHeight * viewportRatio;
  }

  function isInsideHiddenZone(section, visibleRatio) {
    if (!section) {
      return false;
    }

    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (rect.bottom <= 0 || rect.top >= viewportHeight) {
      return false;
    }

    return getSectionRatioInViewport(section) >= visibleRatio;
  }

  window.evaluateBottomActionZone = function () {
    const config = getConfig();

    if (!config.enabled) {
      return { visible: true, mode: "client", suppressed: false };
    }

    const ownerAfterSection = document.querySelector(config.ownerAfterSection);
    const hideSection = document.querySelector(config.hideInSection);

    if (isInsideHiddenZone(hideSection, config.hideVisibleRatio)) {
      return { visible: false, mode: "owner", suppressed: true };
    }

    if (isPastOwnerThreshold(ownerAfterSection, config.ownerAfterViewportRatio)) {
      return { visible: true, mode: "owner", suppressed: false };
    }

    return { visible: true, mode: "client", suppressed: false };
  };

  window.initBottomActionZones = function () {
    const config = getConfig();
    const bar = document.querySelector("[data-bottom-action-bar]");

    if (!config.enabled || !bar) {
      return;
    }

    const secondary = bar.querySelector("[data-bottom-action-secondary]");
    let primaryNode = bar.querySelector("[data-bottom-action-primary]");
    let activeMode = "";

    function getPrimaryParts(node) {
      return {
        label: node ? node.querySelector(".cta-main-text") : null,
        presenceLine: node ? node.querySelector(".cta-presence-line") : null,
        presenceCopy: node ? node.querySelector(".presence-copy") : null
      };
    }

    function setPrimaryAsModal(trigger) {
      let node = trigger;

      if (node && node.tagName === "A") {
        const button = document.createElement("button");
        button.className = node.className;
        button.id = node.id;
        button.setAttribute("data-bottom-action-primary", "");
        button.innerHTML = node.innerHTML;
        node.replaceWith(button);
        node = button;
      }

      if (!node) {
        return null;
      }

      node.removeAttribute("href");
      node.removeAttribute("target");
      node.removeAttribute("rel");
      node.setAttribute("type", "button");
      node.setAttribute("data-open-modal", "");
      node.setAttribute("data-primary-action", "");
      node.setAttribute("data-cta-location", "bottom-bar-primary");
      return node;
    }

    function setPrimaryAsWhatsApp(trigger, modeConfig) {
      let node = trigger;

      if (!node) {
        return null;
      }

      node.removeAttribute("data-open-modal");
      node.removeAttribute("data-primary-action");
      node.setAttribute("data-cta-location", "bottom-bar-acquire");
      node.setAttribute("href", getAcquireWhatsAppUrl());
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
      node.setAttribute("aria-label", modeConfig.primaryAriaLabel || modeConfig.primaryLabel);

      if (node.tagName === "BUTTON") {
        const anchor = document.createElement("a");
        anchor.className = node.className;
        anchor.id = node.id;
        anchor.setAttribute("data-bottom-action-primary", "");
        anchor.innerHTML = node.innerHTML;
        node.replaceWith(anchor);
        node = anchor;
      }

      node.removeAttribute("type");
      return node;
    }

    function applyMode(mode) {
      if (mode === activeMode) {
        return primaryNode;
      }

      const modeConfig = config.modes[mode] || config.modes.client;
      activeMode = mode;

      if (secondary) {
        secondary.href = modeConfig.secondaryHref || "#portfolio";
        secondary.setAttribute(
          "aria-label",
          modeConfig.secondaryAriaLabel || modeConfig.secondaryLabel
        );

        if (modeConfig.secondaryExternal) {
          secondary.setAttribute("target", "_blank");
          secondary.setAttribute("rel", "noopener noreferrer");
        } else {
          secondary.removeAttribute("target");
          secondary.removeAttribute("rel");
        }

        const secondaryText = secondary.querySelector("span");
        if (secondaryText) {
          secondaryText.textContent = modeConfig.secondaryLabel;
        }
      }

      if (modeConfig.primaryAction === "acquire-whatsapp") {
        primaryNode = setPrimaryAsWhatsApp(primaryNode, modeConfig);
      } else {
        primaryNode = setPrimaryAsModal(primaryNode);
      }

      const primaryParts = getPrimaryParts(primaryNode);

      if (primaryNode && primaryParts.label) {
        primaryParts.label.textContent = modeConfig.primaryLabel;
        primaryNode.setAttribute("aria-label", modeConfig.primaryAriaLabel || modeConfig.primaryLabel);
      }

      if (primaryParts.presenceLine && primaryParts.presenceCopy) {
        if (modeConfig.presenceLabel) {
          primaryParts.presenceCopy.textContent = modeConfig.presenceLabel;
          primaryParts.presenceCopy.classList.remove("presence-copy--demo");
          primaryParts.presenceLine.hidden = false;
        } else {
          primaryParts.presenceLine.hidden = false;
        }
      }

      bar.setAttribute("data-bottom-bar-mode", mode);
      document.body.classList.toggle("bottom-bar-mode-owner", mode === "owner");
      document.body.classList.toggle("bottom-bar-mode-client", mode === "client");

      return primaryNode;
    }

    window.evaluateBottomActionBar = function (chromeEligible) {
      const zone = window.evaluateBottomActionZone();
      applyMode(zone.mode);

      const shouldShow = Boolean(chromeEligible && zone.visible);
      bar.classList.toggle("is-active", shouldShow);
      document.body.classList.toggle("bottom-bar-visible", shouldShow);
      document.body.classList.toggle("bottom-bar-suppressed", zone.suppressed);

      return shouldShow;
    };

    applyMode("client");
  };
})();
