    (function () {
      const pageProgress = document.getElementById("page-progress");
      const siteHeader = document.getElementById("site-header");
      const faqItems = document.querySelectorAll(".faq-item");
      const sensoryVisualTargets = Array.from(document.querySelectorAll(".sensory-visual-target"));
      const modal = document.getElementById("lead-modal");
      const modalPanel = document.querySelector("#lead-modal .modal-panel");
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
      const submitLeadButton = document.getElementById("submit-lead");
      const stepErrors = {
        1: document.getElementById("step-1-error"),
        2: document.getElementById("step-2-error"),
        3: document.getElementById("step-3-error")
      };
      const appConfig = window.APP_CONFIG || {};
      const whatsappNumber = appConfig.whatsappNumber || "5549999508884";
      const menuEnabled = Boolean(appConfig.menuEnabled);
      const menuItems = Array.isArray(appConfig.menuItems) ? appConfig.menuItems : [];

      const formState = {
        environments: [],
        urgency: "",
        name: "",
        phone: ""
      };

      let currentStep = 1;
      let releaseModalFocusTrap = null;
      let releaseMenuFocusTrap = null;
      let modalLastFocusedElement = null;
      let menuLastFocusedElement = null;
      let activeFeatureCard = null;
      const FEATURE_ACTIVATION_HYSTERESIS_PX = 32;
      let featureActivationFrameId = 0;
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

      function resolveFeatureCardCandidate(spanningCard, nearestCard, activationY, viewportHeight) {
        if (spanningCard) {
          return spanningCard;
        }

        if (activeFeatureCard) {
          const activeIndex = featureCards.indexOf(activeFeatureCard);
          const activeRect = getFeatureCardLayoutRect(activeFeatureCard);
          const nextCard = featureCards[activeIndex + 1];
          const prevCard = featureCards[activeIndex - 1];

          if (activeRect.bottom > activationY && activeRect.top < viewportHeight) {
            if (nextCard) {
              const nextRect = getFeatureCardLayoutRect(nextCard);
              if (activationY < nextRect.top) {
                return activeFeatureCard;
              }
            } else {
              return activeFeatureCard;
            }
          }

          if (prevCard && activationY < activeRect.top) {
            const prevRect = getFeatureCardLayoutRect(prevCard);
            if (activationY > prevRect.bottom) {
              return activeFeatureCard;
            }
          }
        }

        if (!nearestCard) {
          return activeFeatureCard;
        }

        if (activeFeatureCard && nearestCard !== activeFeatureCard) {
          const activeCenterY = getFeatureCardLayoutRect(activeFeatureCard).centerY;
          const nearestCenterY = getFeatureCardLayoutRect(nearestCard).centerY;
          const activeDistance = Math.abs(activeCenterY - activationY);
          const nearestDistance = Math.abs(nearestCenterY - activationY);

          if (nearestDistance + FEATURE_ACTIVATION_HYSTERESIS_PX > activeDistance) {
            return activeFeatureCard;
          }
        }

        return nearestCard;
      }

      function updateActiveFeatureFromViewportCenter() {
        if (featureCards.length === 0) {
          return;
        }

        const viewportHeight = window.innerHeight;
        const activationY = viewportHeight * (isDesktopScrollLighting() ? 0.4 : 0.5);
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
        if (target === solucaoMediaFrame && isDesktopScrollLighting()) {
          return true;
        }

        if (portfolioFocusCards.indexOf(target) !== -1 && isDesktopScrollLighting()) {
          return true;
        }

        return false;
      }

      function updateSensoryVisualLighting() {
        const scrollLitTargets = sensoryVisualTargets.filter((target) => {
          return !shouldExcludeFromSensoryLighting(target);
        });

        const portfolioMobileTargets = !isDesktopScrollLighting() ? portfolioFocusCards : [];

        if (scrollLitTargets.length === 0 && portfolioMobileTargets.length === 0) {
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

        if (!isDesktopScrollLighting()) {
          portfolioFocusCards.forEach((target) => {
            applyFocusLighting(target, mobileMinFocusRatio);
          });
        }
      }

      function resetPortfolioFocusClasses() {
        portfolioFocusCards.forEach((card) => {
          card.classList.remove("is-in-view", "is-scroll-lit");
        });
      }

      function updateGalleryFocusLighting() {
        if (!isDesktopScrollLighting() || portfolioFocusCards.length === 0) {
          return;
        }

        const viewportCenterY = window.innerHeight / 2;
        const bandTop = window.innerHeight * 0.3;
        const bandBottom = window.innerHeight * 0.7;
        let bestCard = null;
        let bestDistance = Infinity;

        portfolioFocusCards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenterY = rect.top + (rect.height / 2);

          if (cardCenterY < bandTop || cardCenterY > bandBottom) {
            return;
          }

          const distance = Math.abs(cardCenterY - viewportCenterY);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestCard = card;
          }
        });

        portfolioFocusCards.forEach((card) => {
          const focused = card === bestCard;
          card.classList.toggle("is-in-view", focused);
          card.classList.toggle("is-scroll-lit", focused);
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
        updateSensoryVisualLighting();
        updateGalleryFocusLighting();
      }

      function requestFeatureActivationUpdate() {
        if (featureActivationFrameId) {
          return;
        }

        featureActivationFrameId = window.requestAnimationFrame(function () {
          featureActivationFrameId = 0;
          updateScrollLighting();
        });
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

      function setStep(step) {
        currentStep = step;
        clearAllStepErrors();
        steps.forEach((item) => {
          item.classList.toggle("active", Number(item.dataset.step) === step);
        });

        modalProgressFill.style.width = (step / 3) * 100 + "%";
        stepIndicator.textContent = "Passo " + step + " de 3";
      }

      function resetForm() {
        formState.environments = [];
        formState.urgency = "";
        formState.name = "";
        formState.phone = "";
        leadName.value = "";
        leadPhone.value = "";
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
          formState.name = leadName.value.trim();
          formState.phone = leadPhone.value.trim();

          if (!formState.name) {
            leadName.classList.add("is-invalid");
            showStepError(3, "Informe seu nome completo.");
            return false;
          }

          if (!isValidLeadPhone(formState.phone)) {
            leadPhone.classList.add("is-invalid");
            showStepError(3, "Informe um WhatsApp válido com DDD.");
            return false;
          }
        }

        return true;
      }

      function submitLead() {
        if (isSubmittingLead) {
          return;
        }

        if (!validateStep(3)) {
          return;
        }

        isSubmittingLead = true;
        if (submitLeadButton) {
          submitLeadButton.disabled = true;
        }

        const message = [
          "Olá, quero solicitar orçamento para móveis planejados.",
          "",
          "Nome: " + formState.name,
          "WhatsApp: " + formState.phone,
          "Ambientes: " + formState.environments.join(", "),
          "Urgência: " + formState.urgency
        ].join("\n");

        const url = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
        if (window.AppTracking && typeof window.AppTracking.trackModalSubmitWhatsapp === "function") {
          window.AppTracking.trackModalSubmitWhatsapp({
            destination: url,
            selected_environments: formState.environments.length,
            urgency: formState.urgency
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

        featureCards.forEach((card) => featureCardObserver.observe(card));
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
          label: "Painel ripado",
          images: [
            {
              src: "hero/hero-capa-marrom.webp",
              alt: "Living com painel ripado e marcenaria integrada Tendência",
              focus: "ripado"
            }
          ]
        },
        {
          poolIndex: 1,
          id: "closet",
          label: "Closet aberto",
          images: [
            {
              src: "execucoes/execucao-03-closet-minimalista-lacca.jpg",
              alt: "Closet aberto em lacca com organização técnica",
              focus: "closet"
            }
          ]
        },
        {
          poolIndex: 2,
          id: "banheiro",
          label: "Banheiro técnico",
          mobileOnly: true,
          images: [
            {
              src: "assets/images/banheiro.jpeg",
              alt: "Banheiro planejado com bancada em pedra e marcenaria flutuante",
              focus: "banheiro"
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
          if (prefersReducedMotion) {
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
            const poolIndex = Number(button.getAttribute("data-theme-index"));
            if (Number.isNaN(poolIndex)) {
              return;
            }

            selectThemeByPoolIndex(poolIndex);
          });
        });

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
        const absorptionStorageKey = "tendencia_brand_absorption_material_station";

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

      function initPersistentHeroUI() {
        const heroSection = document.getElementById("hero");
        const persistentNodes = Array.from(document.querySelectorAll(".persistent-ui"));
        let heroInView = true;

        if (!heroSection || persistentNodes.length === 0) {
          return;
        }

        function setPersistentVisible(isVisible) {
          document.body.classList.toggle("bottom-bar-visible", isVisible);

          persistentNodes.forEach(function (node) {
            if (node.classList.contains("persistent-ui--top")) {
              node.classList.add("is-active");
              return;
            }

            node.classList.toggle("is-active", isVisible);
          });
        }

        function syncPersistentFromHero() {
          setPersistentVisible(!heroInView);

          if (siteHeader) {
            siteHeader.classList.toggle("site-header--hero", heroInView);
          }

          updateScrollUI();
        }

        if (!("IntersectionObserver" in window)) {
          setPersistentVisible(false);
          document.body.classList.remove("bottom-bar-visible");
          if (siteHeader) {
            siteHeader.classList.add("site-header--hero");
          }
          return;
        }

        const heroObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            heroInView = entry.isIntersecting;
            syncPersistentFromHero();
          });
        }, {
          root: null,
          threshold: 0
        });

        heroObserver.observe(heroSection);
        syncPersistentFromHero();

        window.addEventListener("resize", syncPersistentFromHero);

        window.addEventListener("pagehide", function () {
          heroObserver.disconnect();
          window.removeEventListener("resize", syncPersistentFromHero);
        });
      }

      initHeroCinema();
      initJourneyTimeline();
      initMaterialStation();
      initPersistentHeroUI();

      window.addEventListener("scroll", updateScrollUI, { passive: true });
      window.addEventListener("scroll", requestFeatureActivationUpdate, { passive: true });
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
        if (featureActivationFrameId) {
          window.cancelAnimationFrame(featureActivationFrameId);
          featureActivationFrameId = 0;
        }
        if (resizeReflowTimerId) {
          window.clearTimeout(resizeReflowTimerId);
          resizeReflowTimerId = 0;
        }
      });
      updateScrollUI();
      setupMenu();
      setupFeatureCardScrollTelling();
      setupSensoryVisualObserver();
      setupGalleryFocusObserver();

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

      if (leadName) {
        leadName.addEventListener("input", function () {
          leadName.classList.remove("is-invalid");
          clearStepError(3);
        });
      }

      if (leadPhone) {
        leadPhone.addEventListener("input", function () {
          leadPhone.classList.remove("is-invalid");
          clearStepError(3);
        });
      }

      document.querySelectorAll("[data-next-step]").forEach((button) => {
        button.addEventListener("click", function () {
          if (!validateStep(currentStep)) {
            return;
          }

          setStep(Math.min(3, currentStep + 1));
        });
      });

      document.querySelectorAll("[data-prev-step]").forEach((button) => {
        button.addEventListener("click", function () {
          setStep(Math.max(1, currentStep - 1));
        });
      });

      document.getElementById("submit-lead").addEventListener("click", submitLead);

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
  
