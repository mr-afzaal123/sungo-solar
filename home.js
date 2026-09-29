/* SunGo Solar — home page script */

const CATEGORY_LABEL = {
  "solar-panels": "Solar panel",
  "inverters": "Inverter",
  "batteries": "Lithium battery"
};

// Simple icons used when a product has no photo yet
const CATEGORY_ICON = {
  "solar-panels": '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 18h40l-6 28H6z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M25 18l-6 28M38 18l-6 28M9 32h40" stroke="currentColor" stroke-width="2.5"/><path d="M26 46v8M18 54h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  "inverters": '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="14" y="8" width="36" height="48" rx="5" fill="none" stroke="currentColor" stroke-width="3"/><rect x="21" y="16" width="22" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M34 34l-6 9h8l-6 9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>',
  "batteries": '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="18" width="40" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 27h5v12h-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M18 26v14M26 26v14M34 26v14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>'
};

const PHONE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.6a1 1 0 01-.25 1z" fill="currentColor"/></svg>';

const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm4.6 14.1c-.2.6-1.2 1.1-1.7 1.2-.8.1-1.4-.1-3-.6a10.9 10.9 0 01-4.2-3.7 4.8 4.8 0 01-1-2.6 2.8 2.8 0 01.9-2 .9.9 0 01.6-.3h.5c.2 0 .4 0 .6.4l.8 1.8a.5.5 0 010 .4c-.5.9-1 .9-.7 1.3a6.7 6.7 0 003.3 2.9c.3.1.4.1.6-.1l.8-1c.2-.2.3-.2.6-.1l1.7.8c.2.1.4.2.4.3a2 2 0 01-.1 1.2z"/></svg>';

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function productCard(p, brand) {
  const name = escapeHTML(p.name);
  const brandName = escapeHTML(brand ? brand.name : p.brand);
  const media = p.image
    ? `<img src="${escapeHTML(p.image)}" alt="${name}" loading="lazy" width="400" height="300">`
    : `<div class="product-placeholder">${CATEGORY_ICON[p.category] || ""}<span>${brandName}</span></div>`;
  const chips = Object.values(p.specs || {})
    .map((v) => `<li>${escapeHTML(v)}</li>`)
    .join("");
  const rs = (n) => "Rs " + Number(n).toLocaleString("en-US");
  const waMsg = p.price
    ? `Hi SunGo Solar, I want to order the ${p.name} (${rs(p.price)}). Please confirm availability and today's price.`
    : `Hi SunGo Solar, I want the price of ${p.name}. Please share details.`;
  let priceHtml = "";
  if (p.price) {
    const was = p.retailPrice;
    priceHtml = (was && was > p.price)
      ? `<p class="price"><span class="price-row"><strong>${rs(p.price)}</strong><del aria-label="Was ${rs(was)}">${rs(was)}</del></span><span class="save">Save ${rs(was - p.price)}<span class="save-pct"> (${Math.round((was - p.price) / was * 100)}% off)</span></span><span>Price may change. Confirm on WhatsApp.</span></p>`
      : `<p class="price"><strong>${rs(p.price)}</strong><span>Price may change. Confirm on WhatsApp.</span></p>`;
  }

  return `
    <article class="product-card">
      <div class="product-media">
        ${p.stock === "ready" ? '<span class="badge">Ready stock</span>' : ""}
        ${brand && brand.officialDealer ? '<span class="badge badge-official">Official dealer</span>' : ""}
        ${media}
      </div>
      <div class="product-body">
        <p class="product-brand">${brandName} ${(CATEGORY_LABEL[p.category] || "").toLowerCase()}</p>
        <h3>${name}</h3>
        <ul class="spec-chips">${chips}</ul>
        ${priceHtml}
        <div class="product-actions">
          <a class="btn btn-wa btn-sm" href="${SUNGO.waLink(waMsg)}" target="_blank" rel="noopener">${WA_ICON} ${p.price ? "Order" : "Ask price"}</a>
          <a class="btn btn-outline btn-sm" href="tel:+923006474333" aria-label="Call about ${name}">${PHONE_ICON}</a>
        </div>
      </div>
    </article>`;
}

async function renderFeatured() {
  const grid = document.getElementById("featured-products");
  if (!grid) return;
  try {
    const [products, brands] = await Promise.all([
      fetch("products.json").then((r) => r.json()),
      fetch("brands.json").then((r) => r.json())
    ]);
    const brandById = Object.fromEntries(brands.map((b) => [b.id, b]));

    // Featured items first, then one of each category so panels also show
    // Mix the three official brands (Knox, Itel, Photon), then add two panels
    const featured = products.filter((p) => p.featured);
    const groups = {};
    featured.forEach((p) => (groups[p.brand] = groups[p.brand] || []).push(p));
    const mixed = [];
    while (mixed.length < 6 && Object.values(groups).some((g) => g.length)) {
      Object.values(groups).forEach((g) => { if (g.length && mixed.length < 6) mixed.push(g.shift()); });
    }
    const seen = new Set();
    const panels = products
      .filter((p) => p.category === "solar-panels" && !seen.has(p.brand) && seen.add(p.brand))
      .slice(0, 2);
    const list = [...mixed, ...panels];

    grid.innerHTML = list.map((p) => productCard(p, brandById[p.brand])).join("");
  } catch (err) {
    console.error("Could not load products:", err);
    grid.innerHTML = '<p>Products could not load right now. Please <a href="https://wa.me/923006474333">message us on WhatsApp</a> for the latest stock and prices.</p>';
  }
}

function setupGuide() {
  const tabs = Array.from(document.querySelectorAll(".guide-tab"));
  if (!tabs.length) return;

  function select(tab) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }

  select(tabs[0]); // without JS, every size stays visible

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); select(next); next.focus(); }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeatured();
  setupGuide();
});
