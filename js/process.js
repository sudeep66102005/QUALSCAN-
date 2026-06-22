/* ============================================================
   QUALSCAN — Process timeline
   Scroll-triggered sequential reveal (1 -> 5) with:
   - connector line that "draws" itself with scroll progress
   - glowing pulse on the active step
   - 300ms stagger between steps
   On reduced-motion or no IO support, everything is shown.
   ============================================================ */
(function () {
  "use strict";

  var wrap = document.querySelector(".process-wrap");
  if (!wrap) return;

  var steps = Array.prototype.slice.call(wrap.querySelectorAll(".process-step"));
  var progress = wrap.querySelector(".process-progress");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    steps.forEach(function (s) { s.classList.add("is-active"); });
    if (progress) progress.style.setProperty("--progress", "100%");
    return;
  }

  /* Sequential reveal with stagger */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var idx = parseInt(e.target.getAttribute("data-step"), 10) || 0;
        setTimeout(function () {
          e.target.classList.add("is-active");
        }, idx * 300);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  steps.forEach(function (s) { io.observe(s); });

  /* Connector line draws itself based on scroll position through the track */
  var track = wrap.querySelector(".process-track");
  function updateLine() {
    if (!track || !progress) return;
    var rect = track.getBoundingClientRect();
    var vh = window.innerHeight;
    var anchor = vh * 0.5;                 // line "fills" up to mid-viewport
    var filled = anchor - rect.top;
    var pct = Math.max(0, Math.min(1, filled / rect.height));
    progress.style.setProperty("--progress", (pct * 100).toFixed(1) + "%");
  }
  window.addEventListener("scroll", updateLine, { passive: true });
  window.addEventListener("resize", updateLine);
  updateLine();
})();
