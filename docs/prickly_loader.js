(() => {
  // Load the official ESPHome v3 UI, then apply Prickly branding safely.
  const BASE = "https://pricklyguy.github.io/pgc-esphome-ui/";
  const V3_BUNDLE = BASE + "www.v3.js";
  const LOGO_URL  = BASE + "pgc_logo.png";

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
      img.src = LOGO_URL;
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

  const s = document.createElement("script");
  s.src = V3_BUNDLE;
  s.defer = true;
  s.onload = patchAfterUiLoads;
  s.onerror = () => {
    console.warn("Failed to load ESPHome v3 UI bundle:", V3_BUNDLE);
    patchAfterUiLoads();
  };
  document.head.appendChild(s);
})();
