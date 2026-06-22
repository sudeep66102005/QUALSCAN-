/* ============================================================
   QUALSCAN — Lead capture form
   Client-side validation + success state.
   (No backend wired — submission is handled gracefully and
    can be connected to an email/CRM endpoint later.)
   ============================================================ */
(function () {
  "use strict";

  var form = document.getElementById("lead-form");
  if (!form) return;

  var success = document.getElementById("form-success");

  function setError(field, on) {
    field.classList.toggle("invalid", on);
  }
  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;

    form.querySelectorAll("[data-required]").forEach(function (input) {
      var field = input.closest(".field");
      var v = (input.value || "").trim();
      var ok = v.length > 0;
      if (input.type === "email") ok = ok && isEmail(v);
      setError(field, !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      var firstBad = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
      if (firstBad) firstBad.focus();
      return;
    }

    /* Success state */
    var btn = form.querySelector("button[type=submit]");
    if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

    setTimeout(function () {
      form.style.display = "none";
      if (success) success.classList.add("show");
    }, 600);
  });

  /* Clear error as the user types */
  form.querySelectorAll("[data-required]").forEach(function (input) {
    input.addEventListener("input", function () {
      input.closest(".field").classList.remove("invalid");
    });
  });
})();
