/* SunGo Solar — shared site script (every page) */

// WhatsApp numbers in international format, no "+" or spaces
window.SUNGO = {
  waPrimary: "923006474333",
  waSecondary: "923026261319",
  waLink(message, number) {
    return "https://wa.me/" + (number || this.waPrimary) + "?text=" + encodeURIComponent(message);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    });
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

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});