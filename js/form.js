/* ============================================================
   QUALSCAN — Lead capture form (contact page)
   Client-side validation + Supabase persistence + success state.
   Submissions are stored in the `leads` table via QualscanLeads
   (see js/supabase-config.js).
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
  function val(id) {
    var el = document.getElementById(id);
    return el ? (el.value || "").trim() : "";
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

    var btn = form.querySelector("button[type=submit]");
    var btnHtml = btn ? btn.innerHTML : "";
    if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

    var lead = {
      source: "contact",
      full_name: val("name"),
      email: val("email"),
      organization: val("organization"),
      region: val("region"),
      interest: val("interest"),
      message: val("message")
    };

    function showSuccess() {
      form.style.display = "none";
      if (success) success.classList.add("show");
    }
    function showError() {
      if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
      alert("Sorry, we couldn't send your enquiry right now. Please email us directly at Qualscanradiology@gmail.com and we'll get back to you.");
    }

    if (window.QualscanLeads && typeof window.QualscanLeads.submit === "function") {
      window.QualscanLeads.submit(lead).then(showSuccess).catch(function (err) {
        if (window.console) console.error(err);
        showError();
      });
    } else {
      /* Fallback if the Supabase helper failed to load */
      setTimeout(showSuccess, 600);
    }
  });

  /* Clear error as the user types */
  form.querySelectorAll("[data-required]").forEach(function (input) {
    input.addEventListener("input", function () {
      input.closest(".field").classList.remove("invalid");
    });
  });
})();
