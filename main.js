/* SunGo Solar — shared site script (every page) */

// WhatsApp numbers in international format, no "+" or spaces
window.SUNGO = {
  waPrimary: "923006474333",
  waSecondary: "923026261319",
  waLink(message, number) {
    return "https://wa.me/" + (number || this.waPrimary) + "?text=" + encodeURIComponent(message);
  }
};

// Web fonts load without blocking the page (no inline event handlers, so a strict CSP works)
document.querySelectorAll("link[data-async-css]").forEach((l) => { l.media = "all"; });

document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      if (open) {
        const header = document.querySelector(".site-header");
        if (header) document.documentElement.style.setProperty("--nav-top", Math.max(0, header.getBoundingClientRect().bottom) + "px");
      }
      nav.classList.toggle("open", open);
      document.documentElement.classList.toggle("nav-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    // Close the menu after tapping a link, or when the screen gets wide
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 1024 && nav.classList.contains("open")) setOpen(false); }, { passive: true });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); toggle.focus(); } });
  }

  // Dropdown / mega-menus (click + keyboard; hover handled in CSS on desktop)
  const menus = document.querySelectorAll(".has-menu");
  menus.forEach((item) => {
    const btn = item.querySelector(".nav-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const willOpen = !item.classList.contains("open");
      menus.forEach((m) => {
        m.classList.remove("open");
        const b = m.querySelector(".nav-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-menu")) {
      menus.forEach((m) => {
        m.classList.remove("open");
        const b = m.querySelector(".nav-btn");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    menus.forEach((m) => {
      if (m.classList.contains("open")) {
        m.classList.remove("open");
        const b = m.querySelector(".nav-btn");
        if (b) { b.setAttribute("aria-expanded", "false"); b.focus(); }
      }
    });
  });

  // Any element with data-wa="message" becomes a pre-filled WhatsApp link
  document.querySelectorAll("[data-wa]").forEach((el) => {
    el.href = SUNGO.waLink(el.dataset.wa, el.dataset.waNumber);
    el.target = "_blank";
    el.rel = "noopener";
  });

  // Product photo not uploaded yet? Show the brand icon instead of a broken image
  const ICONS = {
    batteries: '<rect x="10" y="18" width="40" height="30" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M50 27h5v12h-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M18 26v14M26 26v14M34 26v14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
    inverters: '<rect x="14" y="8" width="36" height="48" rx="5" fill="none" stroke="currentColor" stroke-width="3"/><rect x="21" y="16" width="22" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M34 34l-6 9h8l-6 9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>',
    "solar-panels": '<path d="M8 14h48l-6 28H14z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M24 14l-3 28M40 14l3 28M11 28h42" stroke="currentColor" stroke-width="2.5"/><path d="M32 42v10M22 52h20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'
  };
  function photoFallback(img) {
    const card = img.closest(".product-card");
    if (!card || !img.closest(".product-media")) return;
    const brand = card.querySelector(".product-brand a");
    const box = document.createElement("div");
    box.className = "product-placeholder";
    box.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true">' + (ICONS[card.dataset.category] || ICONS.batteries) + "</svg>";
    const label = document.createElement("span");
    label.textContent = brand ? brand.textContent : "";
    box.appendChild(label);
    img.replaceWith(box);
  }
  document.addEventListener("error", (e) => {
    if (e.target && e.target.tagName === "IMG") photoFallback(e.target);
  }, true);
  document.querySelectorAll(".product-media img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) photoFallback(img);
  });

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
