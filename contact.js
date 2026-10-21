/* SunGo Solar — contact page quote form.
   No server is involved: the form builds a WhatsApp message and opens WhatsApp.
   Nothing the visitor types is inserted into the page as HTML. */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quote-form");
  if (!form) return;
  const error = document.getElementById("q-error");
  const field = (name) => form.elements.namedItem(name);

  // Pakistani mobile: 03xx xxxxxxx, +92 3xx xxxxxxx or 0092 3xx xxxxxxx
  const PHONE = /^(?:\+92|0092|92|0)3\d{9}$/;
  const clean = (v) => String(v || "").replace(/[\u0000-\u001f]/g, " ").trim();

  function showError(input, text) {
    error.textContent = text;
    error.hidden = false;
    input.setAttribute("aria-invalid", "true");
    input.focus();
  }

  form.addEventListener("input", (e) => {
    if (e.target.getAttribute("aria-invalid") === "true") e.target.removeAttribute("aria-invalid");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = clean(field("name").value);
    const phone = clean(field("phone").value);
    const city = clean(field("city").value);
    const digits = phone.replace(/[\s\-().]/g, "");

    if (!name) return showError(field("name"), "Please write your name.");
    if (!PHONE.test(digits)) return showError(field("phone"), "Please write a Pakistani mobile number, for example 0300-1234567.");
    if (!city) return showError(field("city"), "Please write your city.");
    error.hidden = true;

    const type = form.querySelector('input[name="type"]:checked');
    const lines = [
      "Hi SunGo Solar, I want a price.",
      "Name: " + name,
      "Phone: " + phone,
      "City: " + city,
      "Solar for: " + (type ? type.value : "Home"),
      "Need: " + field("need").value
    ];
    const msg = clean(field("message").value).slice(0, 500);
    if (msg) lines.push("Message: " + msg);

    window.open(SUNGO.waLink(lines.join("\n")), "_blank", "noopener");
  });
});
