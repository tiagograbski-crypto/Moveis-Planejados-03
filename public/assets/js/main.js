    (function () {
      const pageProgress = document.getElementById("page-progress");
      const siteHeader = document.getElementById("site-header");
      const faqItems = document.querySelectorAll(".faq-item");
      const sensoryVisualTargets = Array.from(document.querySelectorAll(".sensory-visual-target"));
      const modal = document.getElementById("lead-modal");
      const modalPanel = document.querySelector("#lead-modal .modal-panel");
      const modalBody = document.querySelector("#lead-modal .modal-body");
      const leadSummary = document.getElementById("lead-summary");
      const premiumClickAudio = document.getElementById("premium-click");
      const modalProgressFill = document.getElementById("modal-progress-fill");
      const stepIndicator = document.getElementById("step-indicator");
      const menuToggle = document.getElementById("menu-toggle");
      const menuBackdrop = document.getElementById("menu-backdrop");
      const menuDrawer = document.getElementById("site-menu-drawer");
      const desktopMenuNav = document.getElementById("site-nav-desktop");
      const drawerMenuNav = document.getElementById("site-nav-drawer");
      const steps = Array.from(document.querySelectorAll(".step"));
      const environmentButtons = Array.from(document.querySelectorAll("#environment-options .chip"));
      const urgencyButtons = Array.from(document.querySelectorAll("#urgency-options .radio-card"));
      const featureCards = Array.from(document.querySelectorAll(".feature-item"));
      const solucaoSection = document.getElementById("solucao");
      const solucaoMediaFrame = solucaoSection
        ? solucaoSection.querySelector(".media-frame.sensory-visual-target")
        : null;
      const leadName = document.getElementById("lead-name");
      const leadPhone = document.getElementById("lead-phone");
      const leadCity = document.getElementById("lead-city");
      const areaOptions = document.getElementById("area-options");
      const budgetOptions = document.getElementById("budget-options");
      const areaButtons = Array.from(document.querySelectorAll("#area-options .chip"));
      const budgetButtons = Array.from(document.querySelectorAll("#budget-options .radio-card"));
      const submitLeadButton = document.getElementById("submit-lead");
      const stepErrors = {
        1: document.getElementById("step-1-error"),
        2: document.getElementById("step-2-error"),
        3: document.getElementById("step-3-error"),
        4: document.getElementById("step-4-error")
      };
      const appConfig = window.APP_CONFIG || {};
      const whatsappNumber =
        typeof window.resolveWhatsAppNumber === "function"
          ? window.resolveWhatsAppNumber(appConfig.whatsappNumber)
          : String(appConfig.whatsappNumber || "5549999999999").replace(/\D/g, "");
      const menuEnabled = Boolean(appConfig.menuEnabled);
      const menuItems = Array.isArray(appConfig.menuItems) ? appConfig.menuItems : [];
      const TOTAL_MODAL_STEPS = 4;

      function initFeatureHighlightLevel() {
        const level = Number(appConfig.featureHighlightLevel);
        const safeLevel = level >= 1 && level <= 4 ? level : 3;
        document.body.setAttribute("data-feature-highlight", String(safeLevel));
      }

      initFeatureHighlightLevel();

      const formState = {
        environments: [],
        urgency: "",
        city: "",
        area: "",
        budget: "",
        name: "",
        phone: ""
      };

      let currentStep = 1;
      let releaseModalFocusTrap = null;
      let releaseMenuFocusTrap = null;
      let modalLastFocusedElement = null;
      let menuLastFocusedElement = null;
      let activeFeatureCard = null;
      const FEATURE_ACTIVATION_HYSTERESIS_DESKTOP_PX = 32;
      let scrollFrameId = 0;
      let heroScrollHandoffApply = null;
      let resizeReflowTimerId = 0;
      let isSubmittingLead = false;
      let featureCardObserver = null;
      let sensoryVisualObserver = null;
      let galleryFocusObserver = null;
      const portfolioFocusCards = Array.from(
        document.querySelectorAll("#portfolio .portfolio-card.sensory-visual-target")
      );

      function getObserverCenterRootMargin() {
        const centerBand = Math.max(120, Math.round(window.innerHeight * 0.4));
        return "-" + centerBand + "px 0px -" + centerBand + "px";
      }

      // Focus trap do modal principal para manter a navegacao por teclado dentro do dialog.
      function enableFocusTrap(container) {
        const selectors = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(container.querySelectorAll(selectors))
          .filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);

        if (focusableElements.length === 0) {
          return function () {};
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        function onKeyDown(event) {
          if (event.key !== "Tab") {
            return;
          }

          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
            return;
          }

          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }

        container.addEventListener("keydown", onKeyDown);
        return function () {
          container.removeEventListener("keydown", onKeyDown);
        };
      }

      function isDesktopScrollLighting() {
        return window.matchMedia("(min-width: 64em)").matches;
      }

      function getFeatureActivationHysteresis() {
        return FEATURE_ACTIVATION_HYSTERESIS_DESKTOP_PX;
      }

      function getMobileFeatureActivationY() {
        if (window.visualViewport) {
          return window.visualViewport.offsetTop + (window.visualViewport.height * 0.48);
        }

        return window.innerHeight * 0.48;
      }

      function pickMobileFeatureCard(activationY) {
        for (let i = 0; i < featureCards.length; i++) {
          const rect = featureCards[i].getBoundingClientRect();

          if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
            continue;
          }

          if (rect.top <= activationY && rect.bottom >= activationY) {
            return featureCards[i];
          }
        }

        for (let i = 0; i < featureCards.length - 1; i++) {
          const currentRect = featureCards[i].getBoundingClientRect();
          const nextRect = featureCards[i + 1].getBoundingClientRect();
          const gapTop = currentRect.bottom;
          const gapBottom = nextRect.top;

          if (activationY >= gapTop && activationY <= gapBottom) {
            const midpoint = gapTop + ((gapBottom - gapTop) / 2);
            return activationY < midpoint ? featureCards[i] : featureCards[i + 1];
          }
        }

        let fallbackCard = null;

        featureCards.forEach(function (card) {
          const rect = card.getBoundingClientRect();
          if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
            return;
          }

          fallbackCard = card;
        });

        return fallbackCard;
      }

      function isSolucaoInLightingZone() {
        if (!solucaoSection) {
          return false;
        }

        const rect = solucaoSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        return rect.top < viewportHeight * 0.9 && rect.bottom > viewportHeight * 0.1;
      }

      function setSolucaoPanelLit(isLit) {
        if (!solucaoMediaFrame) {
          return;
        }

        solucaoMediaFrame.classList.toggle("is-in-view", isLit);
        solucaoMediaFrame.classList.toggle("is-panel-lit", isLit);
      }

      function setActiveFeatureCard(nextCard) {
        if (nextCard === activeFeatureCard) {
          return;
        }

        activeFeatureCard = nextCard;
        featureCards.forEach((card) => {
          card.classList.toggle("is-active", card === nextCard);
        });
      }

      function clearActiveFeatureCard() {
        if (!activeFeatureCard) {
          return;
        }

        activeFeatureCard = null;
        featureCards.forEach((card) => {
          card.classList.remove("is-active");
        });
      }

      function updateMobileFeatureScrollSpotlight() {
        const activationY = getMobileFeatureActivationY();
        const candidate = pickMobileFeatureCard(activationY);

        if (candidate) {
          setActiveFeatureCard(candidate);
        } else {
          clearActiveFeatureCard();
        }
      }

      function getFeatureCardLayoutRect(card) {
        const list = card.parentElement;
        if (!list) {
          const fallback = card.getBoundingClientRect();
          return {
            top: fallback.top,
            bottom: fallback.bottom,
            centerY: fallback.top + (card.offsetHeight / 2)
          };
        }

        const listTop = list.getBoundingClientRect().top;
        const top = listTop + card.offsetTop;
        const height = card.offsetHeight;

        return {
          top: top,
          bottom: top + height,
          centerY: top + (height / 2)
        };
      }

      function shouldHoldActiveFeatureInGap(activeCard, activationY, viewportHeight) {
        const activeIndex = featureCards.indexOf(activeCard);
        const activeRect = getFeatureCardLayoutRect(activeCard);
        const nextCard = featureCards[activeIndex + 1];
        const prevCard = featureCards[activeIndex - 1];

        if (activeRect.bottom > activationY && activeRect.top < viewportHeight) {
          if (nextCard) {
            const nextRect = getFeatureCardLayoutRect(nextCard);
            if (activationY < nextRect.top) {
              return true;
            }
          } else {
            return true;
          }
        }

        if (prevCard && activationY < activeRect.top) {
          const prevRect = getFeatureCardLayoutRect(prevCard);
          if (activationY > prevRect.bottom) {
            const gapMidpoint = prevRect.bottom + ((activeRect.top - prevRect.bottom) / 2);
            return activationY >= gapMidpoint;
          }
        }

        return false;
      }

      function resolveFeatureCardCandidate(spanningCard, nearestCard, activationY, viewportHeight) {
        const candidate = spanningCard || nearestCard;

        if (!candidate) {
          return activeFeatureCard;
        }

        if (activeFeatureCard) {
          if (!spanningCard && shouldHoldActiveFeatureInGap(activeFeatureCard, activationY, viewportHeight)) {
            return activeFeatureCard;
          }

          if (candidate !== activeFeatureCard) {
            const activeCenterY = getFeatureCardLayoutRect(activeFeatureCard).centerY;
            const candidateCenterY = getFeatureCardLayoutRect(candidate).centerY;
            const activeDistance = Math.abs(activeCenterY - activationY);
            const candidateDistance = Math.abs(candidateCenterY - activationY);

            if (candidateDistance + getFeatureActivationHysteresis() > activeDistance) {
              return activeFeatureCard;
            }
          }
        }

        return candidate;
      }

      function updateActiveFeatureFromViewportCenter() {
        if (featureCards.length === 0) {
          return;
        }

        if (!isSolucaoInLightingZone()) {
          clearActiveFeatureCard();
          return;
        }

        if (!isDesktopScrollLighting()) {
          updateMobileFeatureScrollSpotlight();
          return;
        }

        const viewportHeight = window.innerHeight;
        const activationY = viewportHeight * 0.4;
        let spanningCard = null;
        let spanningDistance = Infinity;
        let nearestCard = null;
        let nearestDistance = Infinity;

        featureCards.forEach((card) => {
          const rect = getFeatureCardLayoutRect(card);

          if (rect.bottom <= 0 || rect.top >= viewportHeight) {
            return;
          }

          const distance = Math.abs(rect.centerY - activationY);
          const spansActivationLine = rect.top <= activationY && rect.bottom >= activationY;

          if (spansActivationLine && distance < spanningDistance) {
            spanningDistance = distance;
            spanningCard = card;
          }

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestCard = card;
          }
        });

        const candidate = resolveFeatureCardCandidate(
          spanningCard,
          nearestCard,
          activationY,
          viewportHeight
        );

        if (candidate) {
          setActiveFeatureCard(candidate);
        }
      }

      function shouldExcludeFromSensoryLighting(target) {
        if (target === solucaoMediaFrame) {
          return true;
        }

        if (portfolioFocusCards.indexOf(target) !== -1) {
          return true;
        }

        return false;
      }

      function updateSensoryVisualLighting() {
        const scrollLitTargets = sensoryVisualTargets.filter((target) => {
          return !shouldExcludeFromSensoryLighting(target);
        });

        if (scrollLitTargets.length === 0) {
          return;
        }

        const viewportHeight = window.innerHeight;
        const focusTop = viewportHeight * 0.14;
        const focusBottom = viewportHeight * 0.86;
        const desktopMinFocusRatio = 0.18;
        const mobileMinFocusRatio = 0.34;
        const mobileMediaMinFocusRatio = 0.22;

        function applyFocusLighting(target, minFocusRatio) {
          const rect = target.getBoundingClientRect();
          const visibleInFocus = Math.min(rect.bottom, focusBottom) - Math.max(rect.top, focusTop);
          const focusRatio = Math.max(0, visibleInFocus) / Math.max(rect.height, 1);
          const inFocus = focusRatio >= minFocusRatio && rect.bottom > focusTop && rect.top < focusBottom;

          target.classList.toggle("is-in-view", inFocus);
          target.classList.toggle("is-scroll-lit", inFocus);

          if (target === solucaoMediaFrame && !isDesktopScrollLighting()) {
            target.classList.remove("is-panel-lit");
          }
        }

        scrollLitTargets.forEach((target) => {
          const minFocusRatio = target === solucaoMediaFrame
            ? mobileMediaMinFocusRatio
            : (isDesktopScrollLighting() ? desktopMinFocusRatio : mobileMinFocusRatio);

          applyFocusLighting(target, minFocusRatio);
        });
      }

      function resetPortfolioFocusClasses() {
        portfolioFocusCards.forEach((card) => {
          card.classList.remove("is-in-view", "is-scroll-lit");
        });
      }

      function getPortfolioGrid() {
        return document.querySelector("#portfolio .portfolio-grid");
      }

      function isPortfolioHoverFocusActive() {
        const grid = getPortfolioGrid();
        return Boolean(grid && grid.classList.contains("portfolio-grid--hover-focus"));
      }

      function setPortfolioHoverLit(card) {
        const grid = getPortfolioGrid();

        if (!grid || !card) {
          return;
        }

        grid.classList.add("portfolio-grid--hover-focus");
        portfolioFocusCards.forEach(function (item) {
          const focused = item === card;
          item.classList.toggle("is-hover-lit", focused);
          item.classList.toggle("is-in-view", focused);
          item.classList.toggle("is-scroll-lit", focused);
        });
      }

      function clearPortfolioHoverFocus() {
        const grid = getPortfolioGrid();

        if (grid) {
          grid.classList.remove("portfolio-grid--hover-focus");
        }

        portfolioFocusCards.forEach(function (card) {
          card.classList.remove("is-hover-lit", "is-in-view", "is-scroll-lit");
        });
      }

      function updateGalleryFocusLighting() {
        if (!isDesktopScrollLighting() || portfolioFocusCards.length === 0 || isPortfolioHoverFocusActive()) {
          return;
        }

        portfolioFocusCards.forEach(function (card) {
          card.classList.remove("is-in-view", "is-scroll-lit", "is-hover-lit");
        });
      }

      function initPortfolioHoverFocus() {
        const grid = getPortfolioGrid();
        const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 64em)");

        if (!grid || portfolioFocusCards.length === 0 || !finePointerQuery.matches) {
          return;
        }

        portfolioFocusCards.forEach(function (card) {
          card.addEventListener("pointerenter", function () {
            if (!finePointerQuery.matches) {
              return;
            }

            setPortfolioHoverLit(card);
          });

          card.addEventListener("focusin", function () {
            if (!finePointerQuery.matches) {
              return;
            }

            setPortfolioHoverLit(card);
          });
        });

        grid.addEventListener("pointerleave", function () {
          clearPortfolioHoverFocus();
          scheduleScrollUpdate();
        });

        grid.addEventListener("focusout", function (event) {
          if (!grid.contains(event.relatedTarget)) {
            clearPortfolioHoverFocus();
            scheduleScrollUpdate();
          }
        });
      }

      function updateScrollLighting() {
        if (isDesktopScrollLighting() && solucaoSection) {
          const inLightingZone = isSolucaoInLightingZone();
          setSolucaoPanelLit(inLightingZone);

          if (inLightingZone) {
            updateActiveFeatureFromViewportCenter();
          }

          updateSensoryVisualLighting();
          updateGalleryFocusLighting();
          return;
        }

        updateActiveFeatureFromViewportCenter();

        if (isDesktopScrollLighting()) {
          updateSensoryVisualLighting();
          updateGalleryFocusLighting();
        }
      }

      function scheduleScrollUpdate() {
        if (scrollFrameId) {
          return;
        }

        scrollFrameId = window.requestAnimationFrame(function () {
          scrollFrameId = 0;

          if (typeof heroScrollHandoffApply === "function") {
            heroScrollHandoffApply();
          }

          updateScrollLighting();
          updateScrollUI();
        });
      }

      function requestFeatureActivationUpdate() {
        scheduleScrollUpdate();
      }

      function runPrimaryActionTelemetry(target) {
        triggerHapticFeedback();
        playPremiumSound();

        if (window.AppTracking && typeof window.AppTracking.trackPrimaryClick === "function") {
          const ctaLocation = target.getAttribute("data-cta-location") || "unspecified";
          const destination = target.tagName === "A" ? (target.getAttribute("href") || "") : "lead_modal";
          window.AppTracking.trackPrimaryClick({
            ctaLabel: (target.textContent || "").trim(),
            ctaLocation: ctaLocation,
            destination: destination
          });
        }
      }

      function lockPrimaryActionTarget(target) {
        target.classList.add("primary-action-throttled");
        if (target.tagName === "BUTTON") {
          target.disabled = true;
        } else {
          target.setAttribute("aria-disabled", "true");
        }

        window.setTimeout(function () {
          target.classList.remove("primary-action-throttled");
          if (target.tagName === "BUTTON") {
            target.disabled = false;
          } else {
            target.removeAttribute("aria-disabled");
          }
        }, 2500);
      }

      function triggerHapticFeedback() {
        try {
          if (window.navigator && typeof window.navigator.vibrate === "function") {
            window.navigator.vibrate(50);
          }
        } catch (error) {
          // Falha silenciosa intencional para navegadores sem suporte/permissao.
        }
      }

      function playPremiumSound() {
        if (!premiumClickAudio) {
          return;
        }

        try {
          premiumClickAudio.currentTime = 0;
          const playPromise = premiumClickAudio.play();

          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
              // Navegadores podem bloquear audio sem gesto permitido; falha silenciosa intencional.
            });
          }
        } catch (error) {
          // Falha silenciosa intencional para manter a interface responsiva.
        }
      }

      function updateScrollUI() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (pageProgress) {
          pageProgress.style.width = progress + "%";
        }

        if (siteHeader) {
          const onHero = siteHeader.classList.contains("site-header--hero");
          siteHeader.classList.toggle("scrolled", scrollTop > 12 && !onHero);
        }
        if (window.AppTracking && typeof window.AppTracking.trackScrollDepth === "function") {
          window.AppTracking.trackScrollDepth(progress);
        }
      }

      function clearStepError(step) {
        const errorNode = stepErrors[step];
        if (errorNode) {
          errorNode.hidden = true;
        }

        if (step === 3) {
          if (leadCity) {
            leadCity.classList.remove("is-invalid");
          }
          if (areaOptions) {
            areaOptions.classList.remove("is-invalid-group");
          }
          if (budgetOptions) {
            budgetOptions.classList.remove("is-invalid-group");
          }
        }

        if (step === 4) {
          leadName.classList.remove("is-invalid");
          leadPhone.classList.remove("is-invalid");
        }
      }

      function showStepError(step, message) {
        const errorNode = stepErrors[step];
        if (!errorNode) {
          return;
        }

        if (message) {
          errorNode.textContent = message;
        }

        errorNode.hidden = false;
      }

      function clearAllStepErrors() {
        Object.keys(stepErrors).forEach(function (step) {
          clearStepError(Number(step));
        });
      }

      function isValidLeadPhone(value) {
        const digits = String(value || "").replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 13;
      }

      function updateLeadSummary() {
        if (!leadSummary) {
          return;
        }

        const summaryItems = [
          { label: "Escopo", value: formState.environments.join(", ") },
          { label: "Prazo", value: formState.urgency },
          { label: "Cidade", value: formState.city },
          { label: "Metragem", value: formState.area },
          { label: "Investimento", value: formState.budget }
        ].filter((item) => item.value);

        leadSummary.innerHTML = summaryItems.map(function (item) {
          return (
            "<div class=\"lead-summary__row\">" +
            "<span class=\"lead-summary__label\">" + item.label + "</span>" +
            "<span class=\"lead-summary__value\">" + item.value + "</span>" +
            "</div>"
          );
        }).join("");
      }

      function focusStepEntry(step) {
        const activeStep = steps.find(function (item) {
          return Number(item.dataset.step) === step;
        });

        if (!activeStep) {
          return;
        }

        const focusTarget = activeStep.querySelector(
          "#submit-lead, input:not([disabled]), button[data-next-step], .chip, .radio-card"
        );

        if (focusTarget && typeof focusTarget.focus === "function") {
          focusTarget.focus({ preventScroll: true });
        }
      }

      function setStep(step) {
        currentStep = step;
        clearAllStepErrors();
        steps.forEach((item) => {
          item.classList.toggle("active", Number(item.dataset.step) === step);
        });

        modalProgressFill.style.width = (step / TOTAL_MODAL_STEPS) * 100 + "%";
        stepIndicator.textContent = "Passo " + step + " de " + TOTAL_MODAL_STEPS;

        if (modalBody) {
          modalBody.scrollTop = 0;
        }

        if (step === 4) {
          formState.city = leadCity ? leadCity.value.trim() : formState.city;
          updateLeadSummary();
        }

        window.requestAnimationFrame(function () {
          focusStepEntry(step);
        });
      }

      function resetForm() {
        formState.environments = [];
        formState.urgency = "";
        formState.city = "";
        formState.area = "";
        formState.budget = "";
        formState.name = "";
        formState.phone = "";
        leadName.value = "";
        leadPhone.value = "";
        if (leadCity) {
          leadCity.value = "";
        }
        isSubmittingLead = false;
        if (submitLeadButton) {
          submitLeadButton.disabled = false;
        }
        clearAllStepErrors();
        environmentButtons.forEach((button) => {
          button.classList.remove("active");
          button.setAttribute("aria-pressed", "false");
        });
        urgencyButtons.forEach((button) => {
          button.classList.remove("active");
          button.setAttribute("aria-checked", "false");
        });
        areaButtons.forEach((button) => {
          button.classList.remove("active");
          button.setAttribute("aria-pressed", "false");
        });
        budgetButtons.forEach((button) => {
          button.classList.remove("active");
          button.setAttribute("aria-checked", "false");
        });
      }

      function openModal() {
        resetForm();
        modalLastFocusedElement = document.activeElement;
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        setStep(1);
        releaseModalFocusTrap = enableFocusTrap(modalPanel);
        const modalCloseButton = modalPanel.querySelector(".modal-close");
        if (modalCloseButton) {
          modalCloseButton.focus();
        }
        if (window.AppTracking && typeof window.AppTracking.trackModalOpen === "function") {
          window.AppTracking.trackModalOpen({
            source: (modalLastFocusedElement && modalLastFocusedElement.getAttribute && modalLastFocusedElement.getAttribute("data-cta-location")) || "unspecified"
          });
        }
      }

      function closeModal() {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (releaseModalFocusTrap) {
          releaseModalFocusTrap();
          releaseModalFocusTrap = null;
        }
        if (modalLastFocusedElement && typeof modalLastFocusedElement.focus === "function") {
          modalLastFocusedElement.focus();
        }
      }

      function buildMenuLinks() {
        if (!desktopMenuNav || !drawerMenuNav) {
          return;
        }

        desktopMenuNav.textContent = "";
        drawerMenuNav.textContent = "";

        menuItems.forEach((item) => {
          if (!item || typeof item.href !== "string" || typeof item.label !== "string") {
            return;
          }

          const desktopLink = document.createElement("a");
          desktopLink.className = "site-nav-link";
          desktopLink.href = item.href;
          desktopLink.textContent = item.label;
          desktopMenuNav.appendChild(desktopLink);

          const drawerLink = document.createElement("a");
          drawerLink.className = "site-nav-link";
          drawerLink.href = item.href;
          drawerLink.textContent = item.label;
          drawerLink.setAttribute("data-menu-link", "");
          drawerLink.setAttribute("data-track-component", "menu-drawer");
          drawerLink.setAttribute("data-track-element", "menu-link");
          drawerMenuNav.appendChild(drawerLink);
        });
      }

      function openMenu() {
        if (!menuEnabled || !menuDrawer || !menuToggle) {
          return;
        }

        menuLastFocusedElement = document.activeElement;
        document.body.classList.add("menu-open");
        menuDrawer.setAttribute("aria-hidden", "false");
        menuToggle.setAttribute("aria-expanded", "true");
        releaseMenuFocusTrap = enableFocusTrap(menuDrawer);

        const closeButton = menuDrawer.querySelector(".menu-close");
        if (closeButton) {
          closeButton.focus();
        }
        if (window.AppTracking && typeof window.AppTracking.trackMenuToggle === "function") {
          window.AppTracking.trackMenuToggle({
            menu_state: "open"
          });
        }
      }

      function closeMenu() {
        if (!menuEnabled || !menuDrawer || !menuToggle) {
          return;
        }

        document.body.classList.remove("menu-open");
        menuDrawer.setAttribute("aria-hidden", "true");
        menuToggle.setAttribute("aria-expanded", "false");

        if (releaseMenuFocusTrap) {
          releaseMenuFocusTrap();
          releaseMenuFocusTrap = null;
        }

        if (menuLastFocusedElement && typeof menuLastFocusedElement.focus === "function") {
          menuLastFocusedElement.focus();
        }
        if (window.AppTracking && typeof window.AppTracking.trackMenuToggle === "function") {
          window.AppTracking.trackMenuToggle({
            menu_state: "closed"
          });
        }
      }

      function setupMenu() {
        if (!menuEnabled || !menuToggle || !menuDrawer || !desktopMenuNav || !drawerMenuNav) {
          return;
        }

        document.body.classList.add("menu-enabled");
        buildMenuLinks();

        menuToggle.addEventListener("click", function () {
          if (document.body.classList.contains("menu-open")) {
            closeMenu();
            return;
          }
          openMenu();
        });

        if (menuBackdrop) {
          menuBackdrop.addEventListener("click", closeMenu);
        }

        menuDrawer.querySelectorAll("[data-close-menu]").forEach((button) => {
          button.addEventListener("click", closeMenu);
        });

        menuDrawer.addEventListener("click", function (event) {
          const target = event.target;
          if (target && target.matches("[data-menu-link]")) {
            closeMenu();
          }
        });
      }

      function validateStep(step) {
        clearStepError(step);

        if (step === 1 && formState.environments.length === 0) {
          showStepError(1);
          return false;
        }

        if (step === 2 && !formState.urgency) {
          showStepError(2);
          return false;
        }

        if (step === 3) {
          formState.city = leadCity ? leadCity.value.trim() : "";
          const missing = [];

          if (!formState.city) {
            if (leadCity) {
              leadCity.classList.add("is-invalid");
            }
            missing.push("cidade");
          }

          if (!formState.area) {
            if (areaOptions) {
              areaOptions.classList.add("is-invalid-group");
            }
            missing.push("metragem");
          }

          if (!formState.budget) {
            if (budgetOptions) {
              budgetOptions.classList.add("is-invalid-group");
            }
            missing.push("faixa de investimento");
          }

          if (missing.length > 0) {
            showStepError(3, "Complete: " + missing.join(", ") + ".");
            return false;
          }
        }

        if (step === 4) {
          formState.name = leadName.value.trim();
          formState.phone = leadPhone.value.trim();

          if (!formState.name) {
            leadName.classList.add("is-invalid");
            showStepError(4, "Informe seu nome completo.");
            return false;
          }

          if (!isValidLeadPhone(formState.phone)) {
            leadPhone.classList.add("is-invalid");
            showStepError(4, "Informe um WhatsApp válido com DDD.");
            return false;
          }
        }

        return true;
      }

      function submitLead() {
        if (isSubmittingLead) {
          return;
        }

        if (!validateStep(4)) {
          if (modalBody && stepErrors[4]) {
            stepErrors[4].scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
          return;
        }

        isSubmittingLead = true;
        if (submitLeadButton) {
          submitLeadButton.disabled = true;
        }

        const message = window.sanitizeWhatsAppMessage
          ? window.sanitizeWhatsAppMessage(
              [
                "Olá. Quero iniciar um projeto de móveis planejados.",
                "",
                "Nome: " + formState.name,
                "WhatsApp: " + formState.phone,
                "Cidade: " + formState.city,
                "Escopo: " + formState.environments.join(", "),
                "Metragem: " + formState.area,
                "Investimento: " + formState.budget,
                "Prazo: " + formState.urgency
              ].join("\n")
            )
          : [
              "Olá. Quero iniciar um projeto de móveis planejados.",
              "",
              "Nome: " + formState.name,
              "WhatsApp: " + formState.phone,
              "Cidade: " + formState.city,
              "Escopo: " + formState.environments.join(", "),
              "Metragem: " + formState.area,
              "Investimento: " + formState.budget,
              "Prazo: " + formState.urgency
            ].join("\n");

        const url = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
        if (window.AppTracking && typeof window.AppTracking.trackModalSubmitWhatsapp === "function") {
          window.AppTracking.trackModalSubmitWhatsapp({
            destination: url,
            selected_environments: formState.environments.length,
            urgency: formState.urgency,
            city: formState.city,
            area: formState.area,
            budget: formState.budget
          });
        }
        window.open(url, "_blank", "noopener");
        closeModal();
      }

      function setupFeatureCardScrollTelling() {
        if (featureCards.length === 0) {
          return;
        }

        if (!("IntersectionObserver" in window)) {
          requestFeatureActivationUpdate();
          return;
        }

        if (featureCardObserver) {
          featureCardObserver.disconnect();
        }

        featureCardObserver = new IntersectionObserver(function (entries) {
          const hasIntersectingEntry = entries.some((entry) => entry.isIntersecting);
          if (hasIntersectingEntry) {
            requestFeatureActivationUpdate();
          }
        }, {
          root: null,
          threshold: [0, 0.25, 0.5, 0.75, 1],
          rootMargin: isDesktopScrollLighting() ? "-4% 0px -4% 0px" : getObserverCenterRootMargin()
        });

        if (solucaoSection) {
          featureCardObserver.observe(solucaoSection);
        }

        if (isDesktopScrollLighting()) {
          featureCards.forEach((card) => featureCardObserver.observe(card));
        }

        requestFeatureActivationUpdate();
      }

      function setupSensoryVisualObserver() {
        const desktopLighting = isDesktopScrollLighting();
        const scrollLitTargets = sensoryVisualTargets.filter((target) => {
          return !shouldExcludeFromSensoryLighting(target);
        });

        if (scrollLitTargets.length === 0) {
          return;
        }

        if (!("IntersectionObserver" in window)) {
          scrollLitTargets.forEach((target) => target.classList.add("is-in-view"));
          return;
        }

        if (sensoryVisualObserver) {
          sensoryVisualObserver.disconnect();
        }

        sensoryVisualObserver = new IntersectionObserver(function () {
          requestFeatureActivationUpdate();
        }, {
          root: null,
          threshold: desktopLighting ? [0, 0.08, 0.18, 0.32, 0.5] : 0.5,
          rootMargin: desktopLighting ? "0px" : getObserverCenterRootMargin()
        });

        scrollLitTargets.forEach((target) => sensoryVisualObserver.observe(target));
      }

      function setupGalleryFocusObserver() {
        if (galleryFocusObserver) {
          galleryFocusObserver.disconnect();
          galleryFocusObserver = null;
        }

        if (!isDesktopScrollLighting() || portfolioFocusCards.length === 0) {
          if (!isDesktopScrollLighting()) {
            resetPortfolioFocusClasses();
            requestFeatureActivationUpdate();
          }
          return;
        }

        if (!("IntersectionObserver" in window)) {
          updateGalleryFocusLighting();
          return;
        }

        galleryFocusObserver = new IntersectionObserver(function () {
          requestFeatureActivationUpdate();
        }, {
          root: null,
          rootMargin: "-30% 0px -30% 0px",
          threshold: [0.1, 0.5]
        });

        portfolioFocusCards.forEach((card) => galleryFocusObserver.observe(card));
        updateGalleryFocusLighting();
      }

      const HERO_THEME_POOL = [
        {
          poolIndex: 0,
          id: "ripado",
          label: "Living",
          images: [
            {
              src: "hero/hero-capa-marrom.webp",
              alt: "Living com painel ripado e marcenaria integrada",
              focus: "ripado"
            }
          ]
        },
        {
          poolIndex: 1,
          id: "ripado-png",
          label: "Living",
          images: [
            {
              src: "hero/hero-capa-marrom.png",
              alt: "Living com painel ripado e marcenaria integrada",
              focus: "ripado"
            }
          ]
        }
      ];

      function isHeroMobileViewport() {
        return window.matchMedia("(max-width: 47.9375em)").matches;
      }

      function getHeroThemes() {
        const mobile = isHeroMobileViewport();

        return HERO_THEME_POOL.filter(function (theme) {
          return !theme.mobileOnly || mobile;
        }).map(function (theme, index) {
          return {
            id: theme.id,
            label: theme.label,
            poolIndex: theme.poolIndex,
            themeIndex: index,
            images: theme.images
          };
        });
      }

      function initHeroCinema() {
        const cinema = document.getElementById("hero-cinema");
        const themeLines = document.getElementById("hero-theme-lines");
        if (!cinema || !themeLines || HERO_THEME_POOL.length === 0) {
          return;
        }

        const layers = Array.from(cinema.querySelectorAll(".hero-cinema__layer"));
        const themeButtons = Array.from(themeLines.querySelectorAll(".hero-theme-line"));
        const loadedSources = new Set();
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let activeThemeIndex = 0;
        let slideTimerId = 0;
        let isTransitioning = false;
        let resizeTimerId = 0;
        let autoAdvancePaused = false;

        if (layers.length < 2) {
          return;
        }

        loadedSources.add(HERO_THEME_POOL[0].images[0].src);

        function updateThemeLines() {
          const themes = getHeroThemes();
          const activeTheme = themes[activeThemeIndex];
          const activePoolIndex = activeTheme ? activeTheme.poolIndex : 0;

          themeButtons.forEach(function (button) {
            const poolIndex = Number(button.getAttribute("data-theme-index"));
            const isAvailable = themes.some(function (theme) {
              return theme.poolIndex === poolIndex;
            });

            button.hidden = !isAvailable;
            button.classList.toggle("is-active", poolIndex === activePoolIndex);
            button.setAttribute("aria-selected", poolIndex === activePoolIndex ? "true" : "false");
          });
        }

        function preloadImage(imageData) {
          if (loadedSources.has(imageData.src)) {
            return Promise.resolve(imageData);
          }

          return new Promise(function (resolve, reject) {
            const loader = new Image();
            loader.decoding = "async";
            loader.onload = function () {
              loadedSources.add(imageData.src);
              resolve(imageData);
            };
            loader.onerror = function () {
              reject(new Error("hero_image_load_failed"));
            };
            loader.src = imageData.src;
          });
        }

        function getInactiveLayer() {
          return layers.find(function (layer) {
            return !layer.classList.contains("is-active");
          }) || layers[1];
        }

        function getActiveLayer() {
          return layers.find(function (layer) {
            return layer.classList.contains("is-active");
          }) || layers[0];
        }

        function applySlide(themeIndex) {
          const themes = getHeroThemes();
          const theme = themes[themeIndex];
          if (!theme) {
            return;
          }

          const imageData = theme.images[0];
          const activeLayer = getActiveLayer();
          const inactiveLayer = getInactiveLayer();
          const inactiveImage = inactiveLayer.querySelector("img");

          if (!inactiveImage) {
            return;
          }

          inactiveImage.src = imageData.src;
          inactiveImage.alt = imageData.alt;

          if (imageData.focus) {
            inactiveImage.setAttribute("data-hero-focus", imageData.focus);
          } else {
            inactiveImage.removeAttribute("data-hero-focus");
          }

          inactiveLayer.classList.add("is-active");
          activeLayer.classList.remove("is-active");
          activeThemeIndex = themeIndex;
          updateThemeLines();
        }

        function showSlide(themeIndex) {
          const themes = getHeroThemes();
          const theme = themes[themeIndex];
          const imageData = theme && theme.images[0];

          if (!imageData || isTransitioning) {
            return Promise.resolve();
          }

          isTransitioning = true;

          return preloadImage(imageData).then(function () {
            applySlide(themeIndex);
            window.setTimeout(function () {
              isTransitioning = false;
            }, prefersReducedMotion ? 0 : 1500);
          }).catch(function () {
            isTransitioning = false;
          });
        }

        function scheduleAutoAdvance() {
          if (prefersReducedMotion || autoAdvancePaused) {
            return;
          }

          if (slideTimerId) {
            window.clearInterval(slideTimerId);
          }

          slideTimerId = window.setInterval(function () {
            const themes = getHeroThemes();
            if (themes.length === 0) {
              return;
            }

            const nextThemeIndex = (activeThemeIndex + 1) % themes.length;
            showSlide(nextThemeIndex);
          }, 6500);
        }

        function pauseAutoAdvance() {
          autoAdvancePaused = true;
          if (slideTimerId) {
            window.clearInterval(slideTimerId);
            slideTimerId = 0;
          }
        }

        function selectThemeByPoolIndex(poolIndex) {
          const themes = getHeroThemes();
          const themeIndex = themes.findIndex(function (theme) {
            return theme.poolIndex === poolIndex;
          });

          if (themeIndex < 0) {
            return;
          }

          if (themeIndex === activeThemeIndex) {
            return;
          }

          showSlide(themeIndex).then(function () {
            scheduleAutoAdvance();
          });
        }

        function preloadSecondaryImages() {
          getHeroThemes().forEach(function (theme) {
            theme.images.forEach(function (imageData) {
              const schedulePreload = window.requestIdleCallback || function (callback) {
                return window.setTimeout(callback, 120);
              };

              schedulePreload(function () {
                preloadImage(imageData).catch(function () {});
              });
            });
          });
        }

        function onHeroResize() {
          if (resizeTimerId) {
            window.clearTimeout(resizeTimerId);
          }

          resizeTimerId = window.setTimeout(function () {
            const themes = getHeroThemes();
            const currentTheme = themes[activeThemeIndex];

            if (!currentTheme || activeThemeIndex >= themes.length) {
              showSlide(0);
            } else {
              updateThemeLines();
            }

            resizeTimerId = 0;
          }, 140);
        }

        themeButtons.forEach(function (button) {
          button.addEventListener("click", function () {
            pauseAutoAdvance();
            const poolIndex = Number(button.getAttribute("data-theme-index"));
            if (Number.isNaN(poolIndex)) {
              return;
            }

            selectThemeByPoolIndex(poolIndex);
          });
        });

        cinema.addEventListener("pointerdown", pauseAutoAdvance, { passive: true });
        themeLines.addEventListener("pointerdown", pauseAutoAdvance, { passive: true });

        updateThemeLines();
        preloadSecondaryImages();
        scheduleAutoAdvance();

        window.addEventListener("resize", onHeroResize);

        window.addEventListener("pagehide", function () {
          window.removeEventListener("resize", onHeroResize);
          if (slideTimerId) {
            window.clearInterval(slideTimerId);
            slideTimerId = 0;
          }
          if (resizeTimerId) {
            window.clearTimeout(resizeTimerId);
            resizeTimerId = 0;
          }
        });
      }

      function initJourneyTimeline() {
        const section = document.getElementById("jornada-execucao");
        const timeline = document.getElementById("journey-timeline");
        if (!section || !timeline) {
          return;
        }

        const steps = Array.from(timeline.querySelectorAll(".journey-step"));
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let stepThresholds = [];
        let journeyFrameId = 0;
        let journeyObserver = null;

        function measureThresholds() {
          const track = timeline.querySelector(".journey-track");
          if (!track || steps.length === 0) {
            stepThresholds = [];
            return;
          }

          const trackTop = track.offsetTop;
          const trackHeight = track.offsetHeight || 1;

          stepThresholds = steps.map((step) => {
            const node = step.querySelector(".journey-node");
            if (!node) {
              return 1;
            }

            const nodeCenter = step.offsetTop + node.offsetTop + (node.offsetHeight / 2);
            return Math.max(0, Math.min(1, (nodeCenter - trackTop) / trackHeight));
          });
        }

        function applyJourneyProgress(progress) {
          const clamped = Math.max(0, Math.min(1, progress));
          timeline.style.setProperty("--journey-progress", String(clamped));

          steps.forEach((step, index) => {
            const threshold = stepThresholds[index] ?? 1;
            if (clamped >= threshold - 0.12) {
              step.classList.add("is-revealed");
            }
          });
        }

        function getTimelineScrollProgress() {
          const rect = timeline.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const startLine = viewportHeight * 0.94;
          const endLine = viewportHeight * 0.38;
          const totalDistance = rect.height + (startLine - endLine);

          if (totalDistance <= 0) {
            return 0;
          }

          const traveled = startLine - rect.top;
          return Math.max(0, Math.min(1, traveled / totalDistance));
        }

        function updateJourneyTimeline() {
          journeyFrameId = 0;

          if (prefersReducedMotion) {
            applyJourneyProgress(1);
            steps.forEach((step) => step.classList.add("is-revealed"));
            return;
          }

          const scrollProgress = getTimelineScrollProgress();
          applyJourneyProgress(scrollProgress);
        }

        function requestJourneyUpdate() {
          if (journeyFrameId) {
            window.cancelAnimationFrame(journeyFrameId);
          }

          journeyFrameId = window.requestAnimationFrame(updateJourneyTimeline);
        }

        function setupJourneyObserver() {
          if (prefersReducedMotion) {
            applyJourneyProgress(1);
            steps.forEach((step) => step.classList.add("is-revealed"));
            return;
          }

          if (!("IntersectionObserver" in window)) {
            updateJourneyTimeline();
            return;
          }

          if (journeyObserver) {
            journeyObserver.disconnect();
          }

          journeyObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (!entry.target.classList.contains("journey-step") || !entry.isIntersecting) {
                return;
              }

              entry.target.classList.add("is-revealed");

              const stepIndex = steps.indexOf(entry.target);
              if (stepIndex < 0) {
                return;
              }

              const stepThreshold = stepThresholds[stepIndex] ?? 1;
              const currentProgress = parseFloat(
                getComputedStyle(timeline).getPropertyValue("--journey-progress")
              ) || 0;

              if (stepThreshold > currentProgress) {
                timeline.style.setProperty("--journey-progress", String(stepThreshold));
              }
            });

            requestJourneyUpdate();
          }, {
            root: null,
            threshold: 0.2,
            rootMargin: "-10% 0px -10% 0px"
          });

          journeyObserver.observe(timeline);
          steps.forEach((step) => journeyObserver.observe(step));
        }

        function onResize() {
          measureThresholds();
          requestJourneyUpdate();
        }

        measureThresholds();
        setupJourneyObserver();
        updateJourneyTimeline();

        window.addEventListener("scroll", requestJourneyUpdate, { passive: true });
        window.addEventListener("resize", onResize);

        window.addEventListener("pagehide", function () {
          window.removeEventListener("scroll", requestJourneyUpdate);
          window.removeEventListener("resize", onResize);
          if (journeyObserver) {
            journeyObserver.disconnect();
            journeyObserver = null;
          }
          if (journeyFrameId) {
            window.cancelAnimationFrame(journeyFrameId);
            journeyFrameId = 0;
          }
        });
      }

      function initMaterialStation() {
        const section = document.getElementById("estacao-materiais");
        const grid = document.getElementById("material-station-grid");
        if (!section || !grid) {
          return;
        }

        const swatches = Array.from(grid.querySelectorAll(".material-swatch"));
        let inviteObserver = null;
        let absorptionTimerId = 0;
        let absorptionObserver = null;
        const absorptionStorageKey = "showroom_brand_absorption_material_station";

        function setActiveSwatch(activeSwatch) {
          swatches.forEach((swatch) => {
            const isActive = swatch === activeSwatch;
            swatch.classList.toggle("is-active", isActive);
            swatch.setAttribute("aria-expanded", isActive ? "true" : "false");
          });
        }

        function pushBrandAbsorptionEvent() {
          if (sessionStorage.getItem(absorptionStorageKey) === "1") {
            return;
          }

          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "brand_absorption",
            component: "material_station",
            time_viewed: "4_seconds_plus"
          });
          sessionStorage.setItem(absorptionStorageKey, "1");
        }

        function setupInviteObserver() {
          if (section.classList.contains("is-invited")) {
            return;
          }

          if (!("IntersectionObserver" in window)) {
            section.classList.add("is-invited");
            return;
          }

          inviteObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.target !== section || !entry.isIntersecting) {
                return;
              }

              section.classList.add("is-invited");
              if (inviteObserver) {
                inviteObserver.disconnect();
                inviteObserver = null;
              }
            });
          }, {
            root: null,
            threshold: 0.2,
            rootMargin: "-10% 0px -10% 0px"
          });

          inviteObserver.observe(section);
        }

        function setupBrandAbsorptionObserver() {
          if (!("IntersectionObserver" in window)) {
            return;
          }

          if (sessionStorage.getItem(absorptionStorageKey) === "1") {
            return;
          }

          absorptionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.target !== section) {
                return;
              }

              if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                if (!absorptionTimerId) {
                  absorptionTimerId = window.setTimeout(function () {
                    pushBrandAbsorptionEvent();
                    absorptionTimerId = 0;
                    if (absorptionObserver) {
                      absorptionObserver.disconnect();
                      absorptionObserver = null;
                    }
                  }, 4000);
                }
                return;
              }

              if (absorptionTimerId) {
                window.clearTimeout(absorptionTimerId);
                absorptionTimerId = 0;
              }
            });
          }, {
            root: null,
            threshold: [0, 0.5, 1]
          });

          absorptionObserver.observe(section);
        }

        swatches.forEach(function (swatch) {
          swatch.addEventListener("click", function () {
            if (swatch.classList.contains("is-active")) {
              setActiveSwatch(null);
              return;
            }

            setActiveSwatch(swatch);
          });
        });

        grid.addEventListener("keydown", function (event) {
          if (event.key !== "Escape") {
            return;
          }

          setActiveSwatch(null);
        });

        function onDocumentClick(event) {
          if (!grid.contains(event.target)) {
            setActiveSwatch(null);
          }
        }

        document.addEventListener("click", onDocumentClick);

        setupInviteObserver();
        setupBrandAbsorptionObserver();

        window.addEventListener("pagehide", function () {
          document.removeEventListener("click", onDocumentClick);
          if (inviteObserver) {
            inviteObserver.disconnect();
            inviteObserver = null;
          }
          if (absorptionTimerId) {
            window.clearTimeout(absorptionTimerId);
            absorptionTimerId = 0;
          }
          if (absorptionObserver) {
            absorptionObserver.disconnect();
            absorptionObserver = null;
          }
        });
      }

      function initHeroScrollHandoff() {
        const heroSection = document.getElementById("hero");
        const persistentNodes = Array.from(document.querySelectorAll(".persistent-ui"));
        const desktopHandoffQuery = window.matchMedia("(min-width: 48em)");
        let heroHeaderOverlayMode = true;
        let persistentChromeVisible = false;

        if (!heroSection || persistentNodes.length === 0) {
          return;
        }

        function isDesktopHeroHandoff() {
          return desktopHandoffQuery.matches;
        }

        function getViewportHeight() {
          return window.visualViewport ? window.visualViewport.height : window.innerHeight;
        }

        function getHeroExitProgress(rect, viewportHeight) {
          const fadeStart = viewportHeight * 0.88;
          const fadeEnd = viewportHeight * 0.16;

          if (rect.bottom >= fadeStart) {
            return 0;
          }

          if (rect.bottom <= fadeEnd) {
            return 1;
          }

          return 1 - ((rect.bottom - fadeEnd) / (fadeStart - fadeEnd));
        }

        function setPersistentChrome(isVisible) {
          document.body.classList.toggle("bottom-bar-visible", isVisible);

          persistentNodes.forEach(function (node) {
            if (node.classList.contains("persistent-ui--top")) {
              return;
            }

            node.classList.toggle("is-active", isVisible);
          });
        }

        heroScrollHandoffApply = function applyHeroScrollHandoff() {
          const viewportHeight = getViewportHeight();
          const rect = heroSection.getBoundingClientRect();
          const exitProgress = getHeroExitProgress(rect, viewportHeight);
          const heroPassed = rect.bottom <= 0;
          const heroReleased = heroPassed || exitProgress >= 0.92;
          let useHeroHeader;
          let showPersistentChrome;

          if (isDesktopHeroHandoff()) {
            const headerOffY = viewportHeight * 0.3;
            const headerOnY = viewportHeight * 0.36;

            if (heroHeaderOverlayMode) {
              if (rect.bottom <= headerOffY) {
                heroHeaderOverlayMode = false;
              }
            } else if (rect.bottom > headerOnY) {
              heroHeaderOverlayMode = true;
            }

            useHeroHeader = heroHeaderOverlayMode;

            const chromeOnY = viewportHeight * 0.26;
            const chromeOffY = viewportHeight * 0.32;

            if (persistentChromeVisible) {
              if (!heroReleased || rect.bottom >= chromeOffY) {
                persistentChromeVisible = false;
              }
            } else if (heroReleased && rect.bottom < chromeOnY) {
              persistentChromeVisible = true;
            }

            showPersistentChrome = persistentChromeVisible;
          } else {
            useHeroHeader = rect.bottom > viewportHeight * 0.34;
            showPersistentChrome = heroReleased && rect.bottom < viewportHeight * 0.28;
          }

          heroSection.style.setProperty("--hero-exit", exitProgress.toFixed(4));
          heroSection.classList.toggle("hero--handoff", exitProgress > 0.02);
          heroSection.classList.toggle("hero--passed", heroPassed);

          document.body.classList.toggle("hero-active", !heroPassed);
          document.body.classList.toggle("hero-released", heroReleased);
          document.body.classList.toggle("scrolled-past-hero", !useHeroHeader);

          if (siteHeader) {
            siteHeader.classList.toggle("site-header--hero", useHeroHeader);
            siteHeader.classList.add("is-active");
          }

          setPersistentChrome(showPersistentChrome);
        };

        if ("IntersectionObserver" in window) {
          const heroObserver = new IntersectionObserver(function () {
            scheduleScrollUpdate();
          }, {
            root: null,
            threshold: [0, 0.15, 0.35, 0.55, 0.75, 1]
          });

          heroObserver.observe(heroSection);

          window.addEventListener("pagehide", function () {
            heroObserver.disconnect();
          });
        }

        window.addEventListener("resize", scheduleScrollUpdate);
        heroScrollHandoffApply();
      }

      function initPortfolioLightbox() {
        const lightbox = document.getElementById("portfolio-lightbox");
        const lightboxPanel = lightbox ? lightbox.querySelector(".lightbox-panel") : null;
        const lightboxImage = document.getElementById("lightbox-image");
        const lightboxTitle = document.getElementById("lightbox-title");
        const lightboxCaption = document.getElementById("lightbox-caption");
        const prevButton = document.getElementById("lightbox-prev");
        const nextButton = document.getElementById("lightbox-next");
        const cards = Array.from(document.querySelectorAll("#portfolio .portfolio-card[data-lightbox-src]"));
        let currentIndex = 0;
        let releaseLightboxTrap = null;
        let lightboxLastFocused = null;

        if (!lightbox || !lightboxPanel || !lightboxImage || cards.length === 0) {
          return;
        }

        function getPayload(card) {
          return {
            src: card.getAttribute("data-lightbox-src") || "",
            alt: card.getAttribute("data-lightbox-alt") || "",
            title: card.getAttribute("data-lightbox-title") || "",
            caption: card.getAttribute("data-lightbox-caption") || ""
          };
        }

        function render(index) {
          const card = cards[index];
          if (!card) {
            return;
          }

          const data = getPayload(card);
          lightboxImage.src = data.src;
          lightboxImage.alt = data.alt;
          lightboxTitle.textContent = data.title;
          lightboxCaption.textContent = data.caption;
          currentIndex = index;
        }

        function open(index) {
          if (index < 0 || index >= cards.length) {
            return;
          }

          lightboxLastFocused = document.activeElement;
          render(index);
          lightbox.classList.add("open");
          lightbox.setAttribute("aria-hidden", "false");
          document.body.style.overflow = "hidden";
          releaseLightboxTrap = enableFocusTrap(lightboxPanel);
          lightbox.querySelector(".lightbox-close").focus();
        }

        function close() {
          lightbox.classList.remove("open");
          lightbox.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
          lightboxImage.removeAttribute("src");
          if (releaseLightboxTrap) {
            releaseLightboxTrap();
            releaseLightboxTrap = null;
          }
          if (lightboxLastFocused && typeof lightboxLastFocused.focus === "function") {
            lightboxLastFocused.focus();
          }
        }

        function showRelative(step) {
          const nextIndex = (currentIndex + step + cards.length) % cards.length;
          render(nextIndex);
        }

        cards.forEach(function (card, index) {
          card.addEventListener("click", function () {
            open(index);
          });

          card.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              open(index);
            }
          });
        });

        lightbox.querySelectorAll("[data-close-lightbox]").forEach(function (node) {
          node.addEventListener("click", close);
        });

        if (prevButton) {
          prevButton.addEventListener("click", function () {
            showRelative(-1);
          });
        }

        if (nextButton) {
          nextButton.addEventListener("click", function () {
            showRelative(1);
          });
        }

        document.addEventListener("keydown", function (event) {
          if (!lightbox.classList.contains("open")) {
            return;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            close();
            return;
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            showRelative(-1);
            return;
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            showRelative(1);
          }
        });
      }

      function initPortfolioCarousel() {
        const carousel = document.getElementById("portfolio-carousel");
        const grid = document.querySelector("#portfolio .portfolio-grid");
        const hint = document.getElementById("portfolio-carousel-hint");
        const dotsContainer = document.getElementById("portfolio-carousel-dots");
        const cards = Array.from(document.querySelectorAll("#portfolio .portfolio-card"));
        const mobileQuery = window.matchMedia("(max-width: 47.9375em)");
        let dotsBuilt = false;

        if (!carousel || !grid || cards.length === 0) {
          return;
        }

        function buildDots() {
          if (!dotsContainer || !mobileQuery.matches) {
            if (dotsContainer) {
              dotsContainer.textContent = "";
            }
            dotsBuilt = false;
            return;
          }

          dotsContainer.textContent = "";
          cards.forEach(function (_card, index) {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "portfolio-carousel__dot" + (index === 0 ? " is-active" : "");
            dot.setAttribute("aria-label", "Projeto " + (index + 1));
            dot.addEventListener("click", function () {
              const card = cards[index];
              if (!card) {
                return;
              }
              grid.scrollTo({
                left: card.offsetLeft - grid.offsetLeft,
                behavior: "smooth"
              });
            });
            dotsContainer.appendChild(dot);
          });
          dotsBuilt = true;
        }

        function updateCarouselState() {
          if (!mobileQuery.matches) {
            carousel.classList.remove("is-scrolled", "is-end");
            cards.forEach(function (card) {
              card.classList.remove("is-in-view", "is-scroll-lit");
            });
            return;
          }

          const maxScroll = grid.scrollWidth - grid.clientWidth;
          carousel.classList.toggle("is-scrolled", grid.scrollLeft > 24);
          carousel.classList.toggle("is-end", maxScroll > 0 && grid.scrollLeft >= maxScroll - 24);

          if (!dotsBuilt) {
            buildDots();
          }

          if (!dotsContainer) {
            return;
          }

          let activeIndex = 0;
          let nearestDistance = Infinity;
          const gridCenter = grid.scrollLeft + (grid.clientWidth / 2);

          cards.forEach(function (card, index) {
            const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
            const distance = Math.abs(cardCenter - gridCenter);
            if (distance < nearestDistance) {
              nearestDistance = distance;
              activeIndex = index;
            }
          });

          dotsContainer.querySelectorAll(".portfolio-carousel__dot").forEach(function (dot, index) {
            dot.classList.toggle("is-active", index === activeIndex);
          });

          cards.forEach(function (card, index) {
            const focused = index === activeIndex;
            card.classList.toggle("is-in-view", focused);
            card.classList.toggle("is-scroll-lit", focused);
          });
        }

        grid.addEventListener("scroll", function () {
          if (hint && mobileQuery.matches) {
            hint.classList.add("is-hidden");
          }
          updateCarouselState();
          requestFeatureActivationUpdate();
        }, { passive: true });

        window.addEventListener("resize", function () {
          buildDots();
          updateCarouselState();
        });

        buildDots();
        updateCarouselState();
      }

      function initHeroClientAvatars() {
        const container = document.getElementById("hero-client-avatars");
        const avatars = Array.isArray(appConfig.clientAvatars) ? appConfig.clientAvatars : [];

        if (!container || avatars.length === 0) {
          return;
        }

        container.textContent = "";

        avatars.forEach(function (avatar) {
          if (!avatar || typeof avatar.src !== "string") {
            return;
          }

          const image = document.createElement("img");
          image.className = "trust-avatar";
          image.src = avatar.src;
          image.alt = typeof avatar.alt === "string" ? avatar.alt : "";
          image.width = 40;
          image.height = 40;
          image.loading = "lazy";
          image.decoding = "async";
          container.appendChild(image);
        });
      }

      function initGoogleReviews() {
        const reviewsConfig = appConfig.googleReviews || {};
        if (!reviewsConfig.enabled) {
          return;
        }

        const rating = Number(reviewsConfig.rating);
        const reviewCount = Number(reviewsConfig.reviewCount);
        const profileUrl = typeof reviewsConfig.profileUrl === "string" ? reviewsConfig.profileUrl : "";
        const ratingLabel = Number.isFinite(rating) ? rating.toFixed(1).replace(".", ",") : "";
        const countLabel = Number.isFinite(reviewCount)
          ? reviewCount + " avalia" + (reviewCount === 1 ? "ção" : "ções") + " no Google"
          : "";

        const heroProof = document.getElementById("hero-google-proof");
        const heroRating = document.getElementById("hero-google-rating");
        const heroCount = document.getElementById("hero-google-count");
        const modalProof = document.getElementById("modal-google-proof");
        const modalRating = document.getElementById("modal-google-rating");
        const modalCount = document.getElementById("modal-google-count");

        if (heroProof && ratingLabel && countLabel && profileUrl) {
          heroProof.href = profileUrl;
          if (heroRating) {
            heroRating.textContent = ratingLabel;
          }
          if (heroCount) {
            heroCount.textContent = countLabel;
          }
          heroProof.hidden = false;
        }

        if (modalProof && ratingLabel && countLabel && profileUrl) {
          modalProof.href = profileUrl;
          if (modalRating) {
            modalRating.textContent = ratingLabel;
          }
          if (modalCount) {
            modalCount.textContent = countLabel;
          }
          modalProof.hidden = false;
        }
      }

      function initGuarantee() {
        const guaranteeConfig = appConfig.guarantee || {};
        const structureNode = document.getElementById("guarantee-structure-years");
        const hardwareNode = document.getElementById("guarantee-hardware-years");
        const contractNode = document.getElementById("guarantee-contract-note");

        if (structureNode && guaranteeConfig.structureYears) {
          structureNode.textContent = guaranteeConfig.structureYears + " anos";
        }

        if (hardwareNode && guaranteeConfig.hardwareYears) {
          hardwareNode.textContent = guaranteeConfig.hardwareYears + " anos";
        }

        if (contractNode && guaranteeConfig.contractNote) {
          contractNode.textContent = guaranteeConfig.contractNote;
        }
      }

      function initLeadOffer() {
        const offerConfig = appConfig.leadOffer || {};
        const heroOffer = document.getElementById("hero-offer-line");
        const modalOffer = document.getElementById("modal-offer-line");
        const modalSla = document.getElementById("modal-response-sla");

        if (heroOffer && offerConfig.headline) {
          heroOffer.textContent = offerConfig.headline;
        }

        if (modalOffer && offerConfig.headline) {
          modalOffer.textContent = offerConfig.headline;
        }

        if (modalSla && offerConfig.responseSla) {
          modalSla.textContent = offerConfig.responseSla + ".";
        }
      }

      function initShowcaseVideo() {
        const videoConfig = appConfig.showcaseVideo || {};
        const section = document.getElementById("entrega");
        const trigger = document.getElementById("showcase-video-trigger");
        const poster = document.getElementById("showcase-video-poster");
        const caption = document.getElementById("showcase-video-caption");

        if (!section || !trigger) {
          return;
        }

        if (!videoConfig.enabled) {
          section.hidden = true;
          return;
        }

        if (poster && videoConfig.poster) {
          poster.src = videoConfig.poster;
        }

        const youtubeId = typeof videoConfig.youtubeId === "string" ? videoConfig.youtubeId.trim() : "";

        if (!youtubeId) {
          trigger.disabled = true;
          trigger.classList.add("is-disabled");
          if (caption) {
            caption.textContent = "Vídeo em breve.";
          }
          return;
        }

        if (caption) {
          caption.textContent = "Toque para assistir.";
        }

        trigger.addEventListener("click", function () {
          const embedUrl = "https://www.youtube.com/watch?v=" + encodeURIComponent(youtubeId);
          window.open(embedUrl, "_blank", "noopener,noreferrer");
        });
      }

      function initClientPlaceholders() {
        const placeholders = appConfig.clientPlaceholders || {};
        const city = placeholders.city || "Sua cidade";
        const stateCode = placeholders.stateCode || "SC";
        const region = placeholders.region || "Sua região";
        const cityState = placeholders.cityState || city + " · " + stateCode;
        const cityAndRegion = placeholders.cityAndRegion || city + " e região";
        const heroEyebrow =
          placeholders.heroEyebrow || city + " · Residencial & Comercial";
        const serviceArea =
          placeholders.serviceArea ||
          "Atendemos " + cityAndRegion + " — residencial e comercial.";
        const footerTagline =
          placeholders.footerTagline ||
          "Móveis planejados na sua região. Residencial e comercial — projeto, produção e instalação.";

        document.querySelectorAll(".presence-copy").forEach(function (node) {
          node.textContent = city;
          node.classList.add("presence-copy--demo");
        });

        const heroEyebrowNode = document.getElementById("demo-hero-eyebrow");
        if (heroEyebrowNode) {
          heroEyebrowNode.textContent = heroEyebrow;
        }

        const portfolioRegionNode = document.getElementById("demo-portfolio-region");
        if (portfolioRegionNode) {
          portfolioRegionNode.textContent =
            "Residencial e comercial · " + cityAndRegion + ".";
        }

        const faqServiceAreaNode = document.getElementById("demo-faq-service-area");
        if (faqServiceAreaNode) {
          faqServiceAreaNode.textContent = serviceArea;
        }

        const footerTaglineNode = document.getElementById("demo-footer-tagline");
        if (footerTaglineNode) {
          footerTaglineNode.textContent = footerTagline;
        }

        const footerCityNode = document.getElementById("demo-footer-city");
        if (footerCityNode) {
          footerCityNode.textContent = city + " - " + stateCode;
        }

        const geoMeta = document.querySelector('meta[name="geo.placename"]');
        if (geoMeta) {
          geoMeta.setAttribute("content", city);
        }
      }

      function initFooterTrust() {
        const container = document.getElementById("footer-trust");
        const trustConfig = appConfig.footerTrust || {};

        if (!container) {
          return;
        }

        const seals = [
          {
            value: trustConfig.projectCount || "+2.000 projetos",
            label: trustConfig.projectRegion || "Sua região"
          },
          {
            value: trustConfig.guaranteeLabel || "5 anos garantia",
            label: "Em contrato"
          },
          {
            value: trustConfig.googleRating || "4,9 Google",
            label: "Avaliações"
          },
          {
            value: trustConfig.location || "Sua cidade · SC",
            label: "Residencial & comercial"
          }
        ];

        container.textContent = "";

        seals.forEach(function (seal) {
          const item = document.createElement("div");
          item.className = "footer-seal";

          const value = document.createElement("strong");
          value.className = "footer-seal__value";
          value.textContent = seal.value;

          const label = document.createElement("span");
          label.className = "footer-seal__label";
          label.textContent = seal.label;

          item.appendChild(value);
          item.appendChild(label);
          container.appendChild(item);
        });
      }

      function initFooterMap() {
        const mapSlot = document.getElementById("footer-map-slot");
        const mapLink = document.getElementById("footer-map-link");
        const mapsLinkUrl = appConfig.mapsLinkUrl || "";
        const mapsEmbedUrl = appConfig.mapsEmbedUrl || "";

        if (mapLink && mapsLinkUrl) {
          mapLink.href = mapsLinkUrl;
        }

        if (!mapSlot || !mapsEmbedUrl) {
          return;
        }

        if (!window.matchMedia("(min-width: 48em)").matches) {
          return;
        }

        const iframe = document.createElement("iframe");
        const placeholders = appConfig.clientPlaceholders || {};
        const mapCity = placeholders.city || "Sua cidade";
        const mapState = placeholders.stateCode || "SC";
        iframe.title = "Mapa — Sua Marca, " + mapCity + " " + mapState;
        iframe.src = mapsEmbedUrl;
        iframe.loading = "lazy";
        iframe.referrerPolicy = "no-referrer-when-downgrade";
        iframe.setAttribute("allowfullscreen", "");

        mapSlot.appendChild(iframe);
        mapSlot.removeAttribute("aria-hidden");
      }

      initHeroCinema();
      initJourneyTimeline();
      initMaterialStation();
      initHeroScrollHandoff();
      initPortfolioLightbox();
      initPortfolioCarousel();
      initPortfolioHoverFocus();
      initGoogleReviews();
      initHeroClientAvatars();
      initGuarantee();
      initLeadOffer();
      initClientPlaceholders();
      initShowcaseVideo();
      initFooterTrust();
      initFooterMap();

      window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });

      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", scheduleScrollUpdate, { passive: true });
        window.visualViewport.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
      }

      window.addEventListener("resize", function () {
        if (resizeReflowTimerId) {
          window.clearTimeout(resizeReflowTimerId);
        }

        if (menuEnabled && window.innerWidth >= 1024 && document.body.classList.contains("menu-open")) {
          closeMenu();
        }

        resizeReflowTimerId = window.setTimeout(function () {
          setupFeatureCardScrollTelling();
          setupSensoryVisualObserver();
          setupGalleryFocusObserver();
          requestFeatureActivationUpdate();
          updateScrollUI();
          resizeReflowTimerId = 0;
        }, 140);
      });

      window.addEventListener("pagehide", function () {
        if (scrollFrameId) {
          window.cancelAnimationFrame(scrollFrameId);
          scrollFrameId = 0;
        }
        if (resizeReflowTimerId) {
          window.clearTimeout(resizeReflowTimerId);
          resizeReflowTimerId = 0;
        }
      });
      setupMenu();
      setupFeatureCardScrollTelling();
      setupSensoryVisualObserver();
      setupGalleryFocusObserver();
      scheduleScrollUpdate();

      const portfolioGrid = document.querySelector("#portfolio .portfolio-grid");
      if (portfolioGrid) {
        portfolioGrid.addEventListener("scroll", requestFeatureActivationUpdate, { passive: true });
      }

      document.querySelectorAll("[data-primary-action]").forEach((button) => {
        button.addEventListener("click", function (event) {
          if (button.classList.contains("primary-action-throttled")) {
            event.preventDefault();
            return;
          }

          runPrimaryActionTelemetry(button);
          lockPrimaryActionTarget(button);
        });
      });

      faqItems.forEach((item) => {
        const button = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        button.addEventListener("click", function () {
          const isOpen = item.classList.contains("open");
          faqItems.forEach((entry) => {
            entry.classList.remove("open");
            const entryButton = entry.querySelector(".faq-question");
            const entryAnswer = entry.querySelector(".faq-answer");
            entryButton.querySelector("span:last-child").textContent = "+";
            entryButton.setAttribute("aria-expanded", "false");
            entryAnswer.setAttribute("aria-hidden", "true");
          });

          if (!isOpen) {
            item.classList.add("open");
            button.querySelector("span:last-child").textContent = "−";
            button.setAttribute("aria-expanded", "true");
            answer.setAttribute("aria-hidden", "false");
          }
        });
      });

      document.querySelectorAll("[data-open-modal]").forEach((button) => {
        button.addEventListener("click", openModal);
      });

      document.querySelectorAll("[data-close-modal]").forEach((button) => {
        button.addEventListener("click", closeModal);
      });

      environmentButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const value = button.dataset.value;
          const index = formState.environments.indexOf(value);

          if (index >= 0) {
            formState.environments.splice(index, 1);
            button.classList.remove("active");
            button.setAttribute("aria-pressed", "false");
          } else {
            formState.environments.push(value);
            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");
          }

          clearStepError(1);
        });
      });

      urgencyButtons.forEach((button) => {
        button.addEventListener("click", function () {
          formState.urgency = button.dataset.value;
          urgencyButtons.forEach((entry) => {
            entry.classList.remove("active");
            entry.setAttribute("aria-checked", "false");
          });
          button.classList.add("active");
          button.setAttribute("aria-checked", "true");
          clearStepError(2);
        });
      });

      areaButtons.forEach((button) => {
        button.addEventListener("click", function () {
          formState.area = button.dataset.value;
          areaButtons.forEach((entry) => {
            entry.classList.remove("active");
            entry.setAttribute("aria-pressed", "false");
          });
          button.classList.add("active");
          button.setAttribute("aria-pressed", "true");
          if (areaOptions) {
            areaOptions.classList.remove("is-invalid-group");
          }
          clearStepError(3);
        });
      });

      budgetButtons.forEach((button) => {
        button.addEventListener("click", function () {
          formState.budget = button.dataset.value;
          budgetButtons.forEach((entry) => {
            entry.classList.remove("active");
            entry.setAttribute("aria-checked", "false");
          });
          button.classList.add("active");
          button.setAttribute("aria-checked", "true");
          if (budgetOptions) {
            budgetOptions.classList.remove("is-invalid-group");
          }
          clearStepError(3);
        });
      });

      if (leadCity) {
        leadCity.addEventListener("input", function () {
          leadCity.classList.remove("is-invalid");
          clearStepError(3);
        });
      }

      if (leadName) {
        leadName.addEventListener("input", function () {
          leadName.classList.remove("is-invalid");
          clearStepError(4);
        });
      }

      if (leadPhone) {
        leadPhone.addEventListener("input", function () {
          leadPhone.classList.remove("is-invalid");
          clearStepError(4);
        });
      }

      document.querySelectorAll("[data-next-step]").forEach((button) => {
        button.addEventListener("click", function () {
          if (!validateStep(currentStep)) {
            if (modalBody) {
              const errorNode = stepErrors[currentStep];
              if (errorNode && typeof errorNode.scrollIntoView === "function") {
                errorNode.scrollIntoView({ block: "nearest", behavior: "smooth" });
              }
            }
            return;
          }

          setStep(Math.min(TOTAL_MODAL_STEPS, currentStep + 1));
        });
      });

      document.querySelectorAll("[data-prev-step]").forEach((button) => {
        button.addEventListener("click", function () {
          setStep(Math.max(1, currentStep - 1));
        });
      });

      document.getElementById("submit-lead").addEventListener("click", submitLead);

      if (leadPhone) {
        leadPhone.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            submitLead();
          }
        });
      }

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && menuEnabled && document.body.classList.contains("menu-open")) {
          closeMenu();
          return;
        }

        if (event.key === "Escape" && modal.classList.contains("open")) {
          closeModal();
        }
      });
    })();
  
