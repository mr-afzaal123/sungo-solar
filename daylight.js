// f2 (Daylight): rotate product groups on the orange circle — Knox, itel Energy, Photon, then other brands
(() => {
  const box = document.querySelector(".day-show");
  if (!box) return;
  const scenes = [...box.querySelectorAll(".dsc")];
  const dots = [...box.querySelectorAll(".ds-dot")];
  const play = box.querySelector(".ds-play");
  const DELAY = 4000;
  let i = 0, timer = null, hold = false;
  let paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  box.classList.add("js");

  const show = n => {
    i = (n + scenes.length) % scenes.length;
    scenes.forEach((s, k) => {
      const on = k === i;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
      s.querySelector("a").tabIndex = on ? 0 : -1;
    });
    dots.forEach((d, k) => { d.classList.toggle("is-active", k === i); k === i ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"); });
    // load the next group's photos early so they are ready
    scenes[(i + 1) % scenes.length].querySelectorAll("img").forEach(img => { img.loading = "eager"; });
  };
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { stop(); if (!paused && !hold && !document.hidden) timer = setInterval(() => show(i + 1), DELAY); };
  const setPaused = p => {
    paused = p; box.classList.toggle("is-paused", p);
    play.setAttribute("aria-label", p ? "Play slideshow" : "Pause slideshow");
    p ? stop() : start();
  };

  dots.forEach((d, k) => d.addEventListener("click", () => { show(k); start(); }));
  play.addEventListener("click", () => setPaused(!paused));
  box.addEventListener("mouseenter", () => { hold = true; stop(); });
  box.addEventListener("mouseleave", () => { hold = false; start(); });
  box.addEventListener("focusin", () => { hold = true; stop(); });
  box.addEventListener("focusout", e => { if (!box.contains(e.relatedTarget)) { hold = false; start(); } });
  document.addEventListener("visibilitychange", start);

  show(0);
  setPaused(paused);
})();
