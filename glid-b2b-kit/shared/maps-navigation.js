(function () {
  window.getMapsNavigationUrl = function () {
    const brand = (window.APP_CONFIG || {}).brand || {};
    const customUrl = String(brand.mapsUrl || '').trim();

    if (customUrl && !/^https?:\/\/maps\.google\.com\/?$/i.test(customUrl)) {
      return customUrl;
    }

    const query = [brand.address, brand.city, brand.state]
      .filter(Boolean)
      .join(', ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!query) return 'https://www.google.com/maps';

    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query);
  };

  window.wireMapsNavigationLinks = function (ids) {
    const url = window.getMapsNavigationUrl();
    (ids || []).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.href = url;
    });
    return url;
  };
})();
