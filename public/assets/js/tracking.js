window.AppTracking = (function () {
  const config = window.APP_CONFIG || {};
  const trackingConfig = config.tracking || {};
  const dataLayer = window.dataLayer = window.dataLayer || [];
  const scrollDepthMilestones = { 50: false, 75: false, 90: false };
  const sessionId = "sess_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);

  function getDeviceType() {
    const width = window.innerWidth || document.documentElement.clientWidth || 0;
    if (width < 768) {
      return "mobile";
    }
    if (width < 1024) {
      return "tablet";
    }
    return "desktop";
  }

  function getBaseContext() {
    return {
      tracking_env: trackingConfig.environment || "default",
      session_id: sessionId,
      page_path: window.location.pathname + window.location.hash,
      page_url: window.location.href,
      viewport_w: window.innerWidth || 0,
      viewport_h: window.innerHeight || 0,
      device_type: getDeviceType(),
      menu_enabled: Boolean(config.menuEnabled),
      menu_open: document.body ? document.body.classList.contains("menu-open") : false
    };
  }

  function pushEvent(eventName, payload) {
    dataLayer.push(
      Object.assign(
        {
          event: eventName,
          event_ts: Date.now()
        },
        getBaseContext(),
        payload || {}
      )
    );
  }

  function bootstrapGtm() {
    const containerId = (trackingConfig.gtmContainerId || "").trim();
    if (!trackingConfig.gtmEnabled || !/^GTM-[A-Z0-9]+$/i.test(containerId)) {
      return;
    }

    pushEvent("gtm.js", { "gtm.start": Date.now() });

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(containerId);
    document.head.appendChild(script);
  }

  bootstrapGtm();

  return {
    trackPrimaryClick: function (payload) {
      pushEvent("primary_cta_click", payload);
    },
    trackModalOpen: function (payload) {
      pushEvent("modal_open", payload);
    },
    trackModalSubmitWhatsapp: function (payload) {
      pushEvent("modal_submit_whatsapp", payload);
    },
    trackMenuToggle: function (payload) {
      pushEvent("menu_toggle", payload);
    },
    trackScrollDepth: function (progress) {
      [50, 75, 90].forEach(function (milestone) {
        if (!scrollDepthMilestones[milestone] && progress >= milestone) {
          scrollDepthMilestones[milestone] = true;
          pushEvent("scroll_depth_" + milestone, {
            scroll_depth: milestone
          });
        }
      });
    }
  };
})();
