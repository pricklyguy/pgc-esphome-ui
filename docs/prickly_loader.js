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
  if (document.getElementById("pgc-logo")) return;

  const a = document.createElement("a");
  a.href = "https://www.PricklyGuy.com";
  a.target = "_blank";
  a.rel = "noreferrer";
  a.id = "pgc-logo";

  const img = document.createElement("img");
  img.src = LOGO_URL;
  img.alt = "Prickly Guy Creations";
  img.style.cssText = `
    width: 60px; height: 60px;
    border-radius: 999px;
    display:block;
    box-shadow:
      0 0 0 2px rgba(52,209,198,0.22),
      0 0 16px rgba(52,209,198,0.35),
      0 0 42px rgba(52,209,198,0.12);
  `;

  // helpful if the logo URL is wrong / 404
  img.onerror = () => console.warn("PGC logo failed to load:", LOGO_URL);

  a.appendChild(img);

  a.style.cssText = `
    position: fixed;
    top: 14px;
    left: 14px;
    z-index: 99999;
    padding: 6px;
    border-radius: 999px;
    background: rgba(7,10,15,0.35);
    border: 1px solid rgba(52,209,198,0.18);
    backdrop-filter: blur(8px);
  `;

  document.body.appendChild(a);
}

  function groupScheduleSlots() {
    // Best effort: find entity rows by looking for visible text like "Slot 1".
    // This needs to run AFTER v3 UI renders entities, so we call it repeatedly.
    const root = document.querySelector("main") || document.body;
    if (!root) return;

    // If already grouped, skip
    if (document.querySelector(".pgc-schedule-wrap")) return;

    // Find likely "row" elements that contain Slot 1-4 text.
    const candidates = Array.from(root.querySelectorAll("*"))
      .filter(el => el.children && el.children.length > 0)
      .filter(el => /Slot\s+[1-4]/i.test(el.textContent || ""));

    // Choose smaller nodes to avoid wrapping huge parents
    const rows = candidates.filter(el => {
      const t = (el.textContent || "").trim();
      return t.length > 0 && t.length < 240 && /Slot\s+[1-4]/i.test(t);
    });

    // We expect: 4 enables + 12 numbers = 16 rows with "Slot X" in text.
    // But allow lower if UI changes.
    if (rows.length < 10) return;

    const firstRow =
      rows.find(r => /Slot\s+1/i.test(r.textContent || "")) || rows[0];
    const parent = firstRow.parentElement;
    if (!parent) return;

    const wrap = document.createElement("div");
    wrap.className = "pgc-schedule-wrap";

    const makeCard = (slotNum) => {
      const card = document.createElement("div");
      card.className = "pgc-slot-card";
      card.dataset.slot = String(slotNum);
      card.innerHTML = `
        <div class="pgc-slot-title">
          <div>Schedule Slot ${slotNum}</div>
          <div class="pgc-badge">Prickly Glow</div>
        </div>
        <div class="pgc-slot-divider"></div>
      `;
      return card;
    };

    const cards = {
      1: makeCard(1),
      2: makeCard(2),
      3: makeCard(3),
      4: makeCard(4),
    };

    rows.forEach(row => {
      const txt = row.textContent || "";
      const m = txt.match(/Slot\s+([1-4])/i);
      if (!m) return;
      const slot = Number(m[1]);
      const card = cards[slot];
      if (!card) return;
      card.appendChild(row);
    });

    parent.insertBefore(wrap, firstRow);
    wrap.appendChild(cards[1]);
    wrap.appendChild(cards[2]);
    wrap.appendChild(cards[3]);
    wrap.appendChild(cards[4]);
  }

  function patchAfterUiLoads() {
    const runOnce = () => {
      addLogo();
      addFooter();
      groupScheduleSlots();
    };

    // Run immediately
    runOnce();

    // Run a few more times as UI hydrates/renders entities
    let tries = 0;
    const rep = setInterval(() => {
      tries++;
      runOnce();
      if (document.querySelector(".pgc-schedule-wrap") || tries > 25) {
        clearInterval(rep);
      }
    }, 300);
  }

  // Load the v3 UI bundle first (so we don't replace it)
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
