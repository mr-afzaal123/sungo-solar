/* SunGo Solar — contact page quote form.
   No server needed: the form writes a WhatsApp message and opens WhatsApp. */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quote-form");
  if (!form) return;
  const error = document.getElementById("q-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").trim();
    const phone = (data.get("phone") || "").trim();
    const city = (data.get("city") || "").trim();

    if (!name || !phone || !city) {
      error.hidden = false;
      (!name ? form.name : !phone ? form.phone : form.city).focus();
      return;
    }
    error.hidden = true;

    const lines = [
      "Hi SunGo Solar, I want a price.",
      "Name: " + name,
      "Phone: " + phone,
      "City: " + city,
      "Solar for: " + data.get("type"),
      "Need: " + data.get("need")
    ];
    const msg = (data.get("message") || "").trim();
    if (msg) lines.push("Message: " + msg);

    window.open(SUNGO.waLink(lines.join("\n")), "_blank", "noopener");
  });
});
