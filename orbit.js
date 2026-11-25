// Home page: products orbit around the sun. Pauses on hover/touch, drag or swipe to turn by hand.
(() => {
  const box = document.querySelector(".orbit");
  if (!box) return;
  const items = [...box.querySelectorAll(".orbit-item")];
  const label = box.querySelector(".orbit-label");
  const stopBtn = box.querySelector(".orbit-stop");
  const N = items.length;
  const STEP = (Math.PI * 2) / N;
  const SPEED = (Math.PI * 2) / 20;          // one full circle every 20 seconds
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let angle = Math.PI / 2;                   // item 0 starts at the front
  let spin = 0;                              // extra speed from a flick (rad/s)
  let hover = false, touching = false, focusIn = false, stopped = reduce, resumeAt = 0;
  let dragging = false, moved = 0, lastX = 0, lastT = 0, front = -1, target = null;
  let W = 0, H = 0;

  const measure = () => { W = box.clientWidth; H = box.clientHeight; };
  const fmt = n => "Rs " + n.toLocaleString("en-PK");

  const place = () => {
    const cx = W / 2, cy = H * 0.57, rx = W * 0.4, ry = H * 0.17, size = W * (N > 8 ? 0.205 : 0.23);
    let best = -2, bi = 0;
    items.forEach((el, i) => {
      const t = angle + i * STEP;
      const s = Math.sin(t), c = Math.cos(t);
      const d = (s + 1) / 2;                                 // 0 = behind the sun, 1 = front
      const k = 0.5 + 0.5 * d;
      el.style.transform = `translate3d(${(cx + rx * c - size / 2).toFixed(1)}px, ${(cy + ry * s - size).toFixed(1)}px, 0) scale(${k.toFixed(3)})`;
      el.style.width = el.style.height = size + "px";
      el.style.zIndex = s > -0.15 ? 4 + Math.round(d * 10) : 1;
      el.style.opacity = (0.45 + 0.55 * d).toFixed(2);
      el.style.filter = `drop-shadow(0 ${Math.round(10 + 14 * d)}px ${Math.round(12 + 14 * d)}px rgba(80,30,0,${(0.12 + 0.2 * d).toFixed(2)}))`;
      if (s > best) { best = s; bi = i; }
    });
    if (bi !== front) {
      front = bi;
      const d = items[bi].dataset;
      label.href = d.href;
      label.querySelector(".ol-tag").textContent = d.official === "1" ? "Official Dealer" : "Also Available";
      label.querySelector(".ol-tag").classList.toggle("alt", d.official !== "1");
      label.querySelector(".ol-brand").textContent = d.brand;
      label.querySelector(".ol-name").textContent = d.name;
      label.querySelector(".ol-price").textContent = d.price ? fmt(+d.price) : "Ask Today’s Price";
      items.forEach((el, i) => { el.classList.toggle("is-front", i === bi); el.querySelector("a").tabIndex = i === bi ? 0 : -1; });
    }
  };

  let last = performance.now();
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(box);
  const tick = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible || document.hidden) { requestAnimationFrame(tick); return; }
    if (!dragging) {
      if (target !== null) {                              // keyboard / focus: glide an item to the front
        const diff = Math.atan2(Math.sin(target - angle), Math.cos(target - angle));
        angle += diff * Math.min(1, dt * 7);
        if (Math.abs(diff) < 0.002) target = null;
      } else {
        const auto = !stopped && !hover && !focusIn && !touching && now > resumeAt;
        angle += ((auto ? SPEED : 0) + spin) * dt;
        spin *= Math.pow(0.04, dt);                        // a flick slows down smoothly
        if (Math.abs(spin) < 0.01) spin = 0;
      }
    }
    place();
    requestAnimationFrame(tick);
  };

  // mouse over = pause (desktop)
  box.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hover = true; });
  box.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") hover = false; });

  // drag / swipe to turn
  box.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    dragging = true; moved = 0; lastX = e.clientX; lastT = performance.now(); spin = 0; target = null;
    if (e.pointerType !== "mouse") touching = true;
    box.classList.add("is-dragging");
  });
  window.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, now = performance.now();
    if (Math.abs(dx) > 0 && moved === 0 && Math.abs(dx) > 3 && !box.hasPointerCapture?.(e.pointerId)) {
      try { box.setPointerCapture(e.pointerId); } catch (_) {}
    }
    moved += Math.abs(dx);
    const da = -dx / (W * 0.4);
    angle += da;
    const dtt = Math.max(1, now - lastT) / 1000;
    spin = 0.7 * spin + 0.3 * (da / dtt);
    lastX = e.clientX; lastT = now;
  });
  const end = e => {
    if (!dragging) return;
    dragging = false; box.classList.remove("is-dragging");
    spin = Math.max(-6, Math.min(6, spin));
    if (e.pointerType !== "mouse") { touching = false; resumeAt = performance.now() + 2500; }
  };
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
  // a drag must not open the product link
  box.addEventListener("click", e => { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } }, true);
  box.addEventListener("dragstart", e => e.preventDefault());

  // keyboard: arrows turn one product, focus brings a product to the front
  box.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const base = target ?? angle;
      target = base + (e.key === "ArrowRight" ? -STEP : STEP);
    }
  });
  items.forEach((el, i) => el.querySelector("a").addEventListener("focus", () => { target = Math.PI / 2 - i * STEP; }));
  box.addEventListener("focusin", () => { focusIn = true; });
  box.addEventListener("focusout", e => { if (!box.contains(e.relatedTarget)) focusIn = false; });

  // hidden control for keyboard and screen-reader users (appears only on Tab)
  stopBtn.addEventListener("click", () => {
    stopped = !stopped;
    stopBtn.textContent = stopped ? "Start rotation" : "Stop rotation";
    stopBtn.setAttribute("aria-pressed", stopped ? "true" : "false");
  });
  if (reduce) { stopBtn.textContent = "Start rotation"; stopBtn.setAttribute("aria-pressed", "true"); }

  measure();
  new ResizeObserver(() => { measure(); front = -1; place(); }).observe(box);
  box.classList.add("js");
  place();
  requestAnimationFrame(tick);
})();
