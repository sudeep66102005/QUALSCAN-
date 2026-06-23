/* ============================================================
   QUALSCAN — home page scroll effects
   - scroll-driven word reveal (purpose statement)
   - parallax background image
   - staggered stat-card reveal
   (count-up numbers are handled in main.js via [data-count])
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Scroll-driven word reveal ---- */
  var statement = document.querySelector(".purpose-statement");
  var words = statement ? statement.querySelectorAll(".word") : [];

  function updateWords() {
    if (!statement || !words.length) return;
    var rect = statement.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var start = vh * 0.85;   // begin lighting when top reaches 85% of viewport
    var end = vh * 0.30;     // fully lit when top reaches 30%
    var p = (start - rect.top) / (start - end);
    p = Math.max(0, Math.min(1, p));
    var count = Math.round(p * words.length);
    for (var i = 0; i < words.length; i++) {
      words[i].classList.toggle("lit", i < count);
    }
  }

  /* ---- Parallax background ---- */
  var pbg = document.querySelector("[data-parallax]");
  var psection = pbg ? pbg.closest(".parallax-section") : null;

  function updateParallax() {
    if (!pbg || !psection) return;
    var rect = psection.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.bottom < -100 || rect.top > vh + 100) return;
    var offset = rect.top + rect.height / 2 - vh / 2;
    var shift = offset * -0.12; // background moves slower than the page
    pbg.style.transform = "translateY(" + shift.toFixed(1) + "px)";
  }

  /* ---- rAF-throttled scroll loop ---- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (!reduceMotion) {
        updateWords();
        updateParallax();
      }
      ticking = false;
    });
  }

  if (reduceMotion) {
    for (var i = 0; i < words.length; i++) words[i].classList.add("lit");
  } else {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    // initial paint
    updateWords();
    updateParallax();
  }

  /* ---- Staggered stat-card reveal ---- */
  var cards = document.querySelectorAll(".stat-card[data-card]");
  if (cards.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.25 });
      cards.forEach(function (c) { io.observe(c); });
    } else {
      cards.forEach(function (c) { c.classList.add("is-in"); });
    }
  }
})();
