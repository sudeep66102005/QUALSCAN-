/* ============================================================
   QUALSCAN — home page scroll effects
   - scroll-driven word reveal (purpose statement)
   - parallax background image
   - staggered stat-card reveal with counter animation
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

  /* ============================================================
     Premium stat-card reveal + counter animation
     - Trigger: 30% of section enters viewport
     - Cards animate from 80px below (handled by CSS)
     - 0.15s stagger (handled by CSS transition-delay)
     - Counter counts from 0 to target in 2s with easeOutQuart
     ============================================================ */
  var cards = document.querySelectorAll(".stat-card[data-card]");
  var counters = document.querySelectorAll(".stat-card .counter");
  var countersAnimated = false;

  /* Easing function: easeOutQuart — accelerates then slows near completion */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /* Counter animation: counts from 0 to target over 2 seconds */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-target"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var isSpecial = el.getAttribute("data-is-special") === "true";
    var duration = 2000; // 2 seconds
    var startTime = null;

    function update(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutQuart(progress);
      var currentValue = Math.round(easedProgress * target);

      if (isSpecial) {
        // For "24/7" — count up to 24 then append /7
        el.textContent = currentValue + suffix;
      } else {
        el.textContent = currentValue + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Final value — ensure exact target
        if (isSpecial) {
          el.textContent = target + suffix;
        } else {
          el.textContent = target + suffix;
        }
      }
    }

    requestAnimationFrame(update);
  }

  /* Start all counters with staggered delay matching card entrance */
  function startCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(function (counter, index) {
      var delay = index * 150; // 0.15s stagger matching CSS
      setTimeout(function () {
        animateCounter(counter);
      }, delay);
    });
  }

  /* IntersectionObserver for stat cards — 30% threshold */
  if (cards.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var statsSection = document.getElementById("statsSection");
      
      // Section-level observer to trigger all cards and counters together
      if (statsSection) {
        var sectionObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              // Add is-in class to all cards (CSS handles stagger via transition-delay)
              cards.forEach(function (card) {
                card.classList.add("is-in");
              });
              // Start counter animations
              startCounters();
              sectionObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.3 }); // Trigger when 30% of section is visible

        sectionObserver.observe(statsSection);
      }
    } else {
      // Fallback: show immediately with final values
      cards.forEach(function (c) { c.classList.add("is-in"); });
      counters.forEach(function (el) {
        var target = el.getAttribute("data-target");
        var suffix = el.getAttribute("data-suffix") || "";
        el.textContent = target + suffix;
      });
    }
  }
})();
