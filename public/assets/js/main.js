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
      const leadName = document.getElementById("lead-name");
      const leadPhone = document.getElementById("lead-phone");
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
      let featureActivationFrameId = 0;
      let resizeReflowTimerId = 0;
      let featureCardObserver = null;
      let sensoryVisualObserver = null;

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

      function setActiveFeatureCard(nextCard) {
        if (!nextCard || nextCard === activeFeatureCard) {
          return;
        }

        activeFeatureCard = nextCard;
        featureCards.forEach((card) => {
          card.classList.toggle("is-active", card === nextCard);
        });
      }

      function updateActiveFeatureFromViewportCenter() {
        if (featureCards.length === 0) {
          return;
        }

        const centerY = window.innerHeight / 2;
        let bestCard = null;
        let bestDistance = Infinity;
        let intersectsCenter = false;

        featureCards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenterY = rect.top + (rect.height / 2);
          const distance = Math.abs(cardCenterY - centerY);
          const isCrossingCenter = rect.top <= centerY && rect.bottom >= centerY;

          if (isCrossingCenter) {
            if (!intersectsCenter || distance < bestDistance) {
              intersectsCenter = true;
              bestDistance = distance;
              bestCard = card;
            }
            return;
          }

          if (!intersectsCenter && distance < bestDistance) {
            bestDistance = distance;
            bestCard = card;
          }
        });

        if (bestCard) {
          setActiveFeatureCard(bestCard);
        }
      }

      function requestFeatureActivationUpdate() {
        if (featureActivationFrameId) {
          return;
        }

        featureActivationFrameId = window.requestAnimationFrame(function () {
          featureActivationFrameId = 0;
          updateActiveFeatureFromViewportCenter();
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

        pageProgress.style.width = progress + "%";
        siteHeader.classList.toggle("scrolled", scrollTop > 12);
        if (window.AppTracking && typeof window.AppTracking.trackScrollDepth === "function") {
          window.AppTracking.trackScrollDepth(progress);
        }
      }

      function setStep(step) {
        currentStep = step;
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
        environmentButtons.forEach((button) => button.classList.remove("active"));
        urgencyButtons.forEach((button) => button.classList.remove("active"));
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
        if (step === 1 && formState.environments.length === 0) {
          alert("Selecione pelo menos um ambiente.");
          return false;
        }

        if (step === 2 && !formState.urgency) {
          alert("Selecione a urgencia.");
          return false;
        }

        if (step === 3) {
          formState.name = leadName.value.trim();
          formState.phone = leadPhone.value.trim();

          if (!formState.name || !formState.phone) {
            alert("Preencha nome e WhatsApp.");
            return false;
          }
        }

        return true;
      }

      function submitLead() {
        if (!validateStep(3)) {
          return;
        }

        const message = [
          "Ola, quero atendimento para moveis planejados.",
          "",
          "Nome: " + formState.name,
          "WhatsApp: " + formState.phone,
          "Ambientes: " + formState.environments.join(", "),
          "Urgencia: " + formState.urgency
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

        setActiveFeatureCard(featureCards[0]);

        if (!("IntersectionObserver" in window)) {
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
          rootMargin: getObserverCenterRootMargin()
        });

        featureCards.forEach((card) => featureCardObserver.observe(card));
        requestFeatureActivationUpdate();
      }

      function setupSensoryVisualObserver() {
        if (sensoryVisualTargets.length === 0) {
          return;
        }

        if (!("IntersectionObserver" in window)) {
          sensoryVisualTargets.forEach((target) => target.classList.add("is-in-view"));
          return;
        }

        if (sensoryVisualObserver) {
          sensoryVisualObserver.disconnect();
        }

        sensoryVisualObserver = new IntersectionObserver(function (entries) {
          entries.forEach((entry) => {
            entry.target.classList.toggle("is-in-view", entry.isIntersecting);
          });
        }, {
          root: null,
          threshold: 0.5,
          rootMargin: getObserverCenterRootMargin()
        });

        sensoryVisualTargets.forEach((target) => sensoryVisualObserver.observe(target));
      }

      const paletteSets = [
        {
          name: "Terra Orgânica",
          phrase: "Acolhimento na forma bruta",
          colors: ["#9E6E56", "#D2B48C", "#3E2A22"]
        },
        {
          name: "Cinza Atemporal",
          phrase: "Elegância terrosa para viver bem",
          colors: ["#2C2C2C", "#707070", "#8A9A8B"]
        },
        {
          name: "Sereno Essencial",
          phrase: "Calma orgânica com assinatura premium",
          colors: ["#F5F5DC", "#36454F", "#CD7F32"]
        }
      ];

      function initPaletteDisplay() {
        const display = document.getElementById("palette-display");
        const caption = document.getElementById("palette-caption");
        const swatches = display ? Array.from(display.querySelectorAll(".color-swatch")) : [];

        if (!display || !caption || swatches.length < 3 || paletteSets.length === 0) {
          return;
        }

        let activeIndex = 0;

        function applyPalette(index) {
          const palette = paletteSets[index];
          display.style.setProperty("--color-1", palette.colors[0]);
          display.style.setProperty("--color-2", palette.colors[1]);
          display.style.setProperty("--color-3", palette.colors[2]);
          swatches.forEach(function (swatch, swatchIndex) {
            swatch.style.backgroundColor = palette.colors[swatchIndex];
          });
          caption.textContent = "Paleta " + palette.name + " — " + palette.phrase;
          activeIndex = index;
        }

        applyPalette(activeIndex);
        window.setInterval(function () {
          applyPalette((activeIndex + 1) % paletteSets.length);
        }, 5000);
      }

      initPaletteDisplay();

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
          } else {
            formState.environments.push(value);
            button.classList.add("active");
          }
        });
      });

      urgencyButtons.forEach((button) => {
        button.addEventListener("click", function () {
          formState.urgency = button.dataset.value;
          urgencyButtons.forEach((entry) => entry.classList.remove("active"));
          button.classList.add("active");
        });
      });

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
  
