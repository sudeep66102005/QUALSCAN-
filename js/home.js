/* ============================================================
   QUALSCAN — home page scroll effects
   - Scroll-driven word reveal (purpose statement)
   - Parallax background image
   - Premium stat-card reveal + counter animation
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     SCROLL-DRIVEN WORD REVEAL
     ============================================================ */
  var statement = document.querySelector(".purpose-statement");
  var words = statement ? statement.querySelectorAll(".word") : [];

  function updateWords() {
    if (!statement || !words.length) return;
    var rect = statement.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var start = vh * 0.85;
    var end = vh * 0.30;
    var p = (start - rect.top) / (start - end);
    p = Math.max(0, Math.min(1, p));
    var count = Math.round(p * words.length);
    for (var i = 0; i < words.length; i++) {
      words[i].classList.toggle("lit", i < count);
    }
  }

  /* ============================================================
     PARALLAX BACKGROUND
     ============================================================ */
  var pbg = document.querySelector("[data-parallax]");
  var psection = pbg ? pbg.closest(".parallax-section") : null;

  function updateParallax() {
    if (!pbg || !psection) return;
    var rect = psection.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.bottom < -100 || rect.top > vh + 100) return;
    var offset = rect.top + rect.height / 2 - vh / 2;
    var shift = offset * -0.12;
    pbg.style.transform = "translateY(" + shift.toFixed(1) + "px)";
  }

  /* ============================================================
     SCROLL LOOP (rAF-throttled)
     ============================================================ */
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
    updateWords();
    updateParallax();
  }

  /* ============================================================
     PREMIUM STAT CARDS — scroll trigger + counter animation
     - Trigger: 30% of section enters viewport
     - Cards: CSS handles 80px translateY, opacity, 0.15s stagger
     - Counter: easeOutQuart, 2s duration, counts from 0 to target
     ============================================================ */
  var statsSection = document.getElementById("statsSection");
  var cards = document.querySelectorAll(".stats-card[data-card]");
  var counters = document.querySelectorAll(".stats-card .counter");
  var countersStarted = false;

  /* easeOutQuart: accelerates early, slows near completion */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /* Animate a single counter from 0 to target over 2 seconds */
  function animateCounter(el, delay) {
    var target = parseInt(el.getAttribute("data-target"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var isSpecial = el.getAttribute("data-is-special") === "true";
    var duration = 2000;
    var startTime = null;

    setTimeout(function () {
      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = easeOutQuart(progress);
        var current = Math.round(eased * target);

        el.textContent = prefix + current + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Ensure exact final value
          el.textContent = prefix + target + suffix;
        }
      }
      requestAnimationFrame(step);
    }, delay);
  }

  /* Start all counters with staggered delay matching card entrance */
  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    counters.forEach(function (el, index) {
      animateCounter(el, index * 150);
    });
  }

  /* IntersectionObserver — 30% threshold */
  if (statsSection && cards.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Reveal all cards (CSS handles stagger via transition-delay)
            cards.forEach(function (card) {
              card.classList.add("is-visible");
            });
            // Start counter animations
            startCounters();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(statsSection);
    } else {
      // Fallback: show immediately with final values
      cards.forEach(function (c) { c.classList.add("is-visible"); });
      counters.forEach(function (el) {
        var target = el.getAttribute("data-target");
        var suffix = el.getAttribute("data-suffix") || "";
        var prefix = el.getAttribute("data-prefix") || "";
        el.textContent = prefix + target + suffix;
      });
    }
  }
})();



/* ============================================================
   HOME LEAD FORM — client-side validation + success state
   ============================================================ */
(function () {
  var form = document.getElementById("homeLeadForm");
  var success = document.getElementById("homeFormSuccess");
  if (!form || !success) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;

    // Reset
    form.querySelectorAll(".field").forEach(function (f) {
      f.classList.remove("invalid");
    });

    // Validate required
    form.querySelectorAll("[required]").forEach(function (input) {
      var field = input.closest(".field");
      if (!input.value.trim()) {
        valid = false;
        if (field) field.classList.add("invalid");
      }
    });

    // Validate email format
    var email = form.querySelector("[type=email]");
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      valid = false;
      var ef = email.closest(".field");
      if (ef) ef.classList.add("invalid");
    }

    if (!valid) return;

    // Show success (in production, send to backend here)
    form.style.display = "none";
    success.classList.add("show");
  });
})();



/* ============================================================
   HERO VIDEO — force autoplay on mobile (iOS / Android)
   Mobile browsers block autoplay unless muted + playsinline,
   and sometimes still need an explicit play() call.
   ============================================================ */
(function () {
  var video = document.getElementById("heroVideo");
  if (!video) return;

  // Ensure muted (required for mobile autoplay) and inline playback
  video.muted = true;
  video.setAttribute("muted", "");
  video.playsInline = true;

  function tryPlay() {
    var p = video.play();
    if (p && typeof p.then === "function") {
      p.catch(function () {
        // Autoplay was blocked — retry after the first user interaction
        var resume = function () {
          video.muted = true;
          video.play().catch(function () {});
          document.removeEventListener("touchstart", resume);
          document.removeEventListener("click", resume);
          document.removeEventListener("scroll", resume);
        };
        document.addEventListener("touchstart", resume, { once: true, passive: true });
        document.addEventListener("click", resume, { once: true });
        document.addEventListener("scroll", resume, { once: true, passive: true });
      });
    }
  }

  if (video.readyState >= 2) {
    tryPlay();
  } else {
    video.addEventListener("loadeddata", tryPlay, { once: true });
    video.addEventListener("canplay", tryPlay, { once: true });
  }

  // Re-attempt when tab becomes visible again
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && video.paused) {
      video.muted = true;
      video.play().catch(function () {});
    }
  });
})();



/* ============================================================
   STAGGERED STATS REVEAL — drop-down blocks (replays on scroll)
   ============================================================ */
(function () {
  var section = document.querySelector(".er-stat-section");
  if (!section) return;
  var wraps = Array.prototype.slice.call(section.querySelectorAll(".er-stat-wrap"));
  if (!wraps.length) return;

  var visibleClass = "animate-in";
  var stagger = 120;
  var timers = [];

  function clearPending() {
    timers.forEach(function (t) { window.clearTimeout(t); });
    timers = [];
  }
  function addStaggered() {
    clearPending();
    wraps.forEach(function (el, index) {
      timers.push(window.setTimeout(function () {
        el.classList.add(visibleClass);
      }, index * stagger));
    });
  }
  function removeAll() {
    clearPending();
    wraps.forEach(function (el) { el.classList.remove(visibleClass); });
  }
  function updateStatsReveal() {
    var rect = section.getBoundingClientRect();
    var isInRange = rect.top <= window.innerHeight * 0.8 && rect.bottom > 0;
    if (isInRange) {
      if (!wraps[0].classList.contains(visibleClass)) addStaggered();
    } else {
      removeAll();
    }
  }

  updateStatsReveal();
  window.addEventListener("scroll", updateStatsReveal, { passive: true });
  window.addEventListener("resize", updateStatsReveal);
})();
