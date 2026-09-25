/* SunGo Solar — products page filters.
   All product cards are already in the HTML (good for Google).
   This script only shows/hides them. */

document.addEventListener("DOMContentLoaded", () => {
  const cards = Array.from(document.querySelectorAll("#product-grid .product-card"));
  const chips = Array.from(document.querySelectorAll("[data-filter-cat]"));
  const brandSelect = document.getElementById("brand-filter");
  const count = document.getElementById("result-count");
  const empty = document.getElementById("empty-state");
  const reset = document.getElementById("reset-filters");

  const labels = { "solar-panels": "solar panels", "inverters": "inverters", "batteries": "lithium batteries" };
  const params = new URLSearchParams(location.search);
  let category = labels[params.get("category")] ? params.get("category") : "";
  let brand = params.get("brand") || "";
  if (brand && !brandSelect.querySelector(`option[value="${CSS.escape(brand)}"]`)) brand = "";

  function apply(updateUrl) {
    let shown = 0;
    cards.forEach((c) => {
      const ok = (!category || c.dataset.category === category) && (!brand || c.dataset.brand === brand);
      c.hidden = !ok;
      if (ok) shown++;
    });
    chips.forEach((ch) => ch.setAttribute("aria-pressed", String(ch.dataset.filterCat === category)));
    brandSelect.value = brand;

    const brandName = brand ? brandSelect.options[brandSelect.selectedIndex].text.replace(" (official dealer)", "") : "";
    const what = category ? labels[category] : "products";
    count.textContent = `Showing ${shown} ${brandName ? brandName + " " : ""}${what}`;
    empty.hidden = shown !== 0;

    if (updateUrl) {
      const p = new URLSearchParams();
      if (category) p.set("category", category);
      if (brand) p.set("brand", brand);
      history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
    }
  }

  chips.forEach((ch) => ch.addEventListener("click", () => { category = ch.dataset.filterCat; apply(true); }));
  brandSelect.addEventListener("change", () => { brand = brandSelect.value; apply(true); });
  reset.addEventListener("click", () => { category = ""; brand = ""; apply(true); });

  apply(false);
});
