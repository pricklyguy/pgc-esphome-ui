(() => {
  // Load the official ESPHome v3 UI, then apply Prickly branding safely.
  // Official v3 bundle is here (commonly referenced in ESPHome issues/docs): https://oi.esphome.io/v3/www.js
  const V3_BUNDLE = "https://oi.esphome.io/v3/www.js";

  function addFooter() {
    if (document.getElementById("pgc-footer")) return;
    const footer = document.createElement("div");
    footer.id = "pgc-footer";
    footer.innerHTML = `
      <span>Powered by Prickly Guy Creations</span>
      <span style="opacity:.35">|</span>
      <a href="https://www.PricklyGuy.com" target="_blank" rel="noreferrer">www.PricklyGuy.com</a>
    `;
    document.body.appendChild(footer);
  }

  function addLogo() {
    // Try a few selectors because the v3 header structure can vary by build.
    const selectors = [
      "header",
      ".header",
      ".app-header",
      ".mdc-top-app-bar",
      "ha-top-app-bar",
      "mwc-top-app-bar"
    ];

    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (document.getElementById("pgc-logo")) { clearInterval(t); return; }

      let header = null;
      for (const s of selectors) {
        const el = document.querySelector(s);
        if (el) { header = el; break; }
      }

      if (!header) {
        if (tries > 40) clearInterval(t);
        return;
      }

      const img = document.createElement("img");
      img.id = "pgc-logo";
      img.src = "/local/esphome/pgc_logo.png";
      img.alt = "Prickly Guy Creations";
      img.style.cssText = `
        width: 38px; height: 38px;
        border-radius: 999px;
        margin-right: 10px;
        box-shadow:
          0 0 0 2px rgba(52,209,198,0.22),
          0 0 16px rgba(52,209,198,0.35),
          0 0 42px rgba(52,209,198,0.12);
        flex: 0 0 auto;
      `;

      // Make sure header can accept a left badge cleanly
      try {
        header.style.display = header.style.display || "flex";
        header.style.alignItems = header.style.alignItems || "center";
      } catch (e) {}

      header.insertBefore(img, header.firstChild);
      clearInterval(t);
    }, 250);
  }

  function patchAfterUiLoads() {
    const run = () => { addLogo(); addFooter(); };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run);
    } else {
      run();
    }
  }

  // Load the official v3 UI bundle first (so we don't replace it)
  const s = document.createElement("script");
  s.src = V3_BUNDLE;
  s.defer = true;
  s.onload = patchAfterUiLoads;
  s.onerror = () => {
    console.warn("Failed to load ESPHome v3 UI bundle:", V3_BUNDLE);
    // Still try to show footer/logo in case UI partially loads
    patchAfterUiLoads();
  };
  document.head.appendChild(s);
})();
