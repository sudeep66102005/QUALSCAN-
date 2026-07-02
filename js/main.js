/* ============================================================
   QUALSCAN — shared behaviours
   - header scroll state
   - mobile nav toggle
   - scroll reveal
   - footer year
   ============================================================ */
(function () {
  "use strict";

  /* ---- Header scroll state ---- */
  var header = document.querySelector(".site-header");
  var solid = header && header.classList.contains("header--solid");
  function onScroll() {
    if (!header || solid) return;
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      if (header) header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        if (header) header.classList.remove("menu-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Animated count-up stats ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (target % 1 !== 0) ? 1 : 0;
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      el.textContent = prefix + val + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (counters.length) {
    if ("IntersectionObserver" in window && !reduceMotion) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { animateCount(e.target); co.unobserve(e.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { co.observe(el); });
    } else {
      counters.forEach(function (el) {
        var prefix = el.getAttribute("data-prefix") || "";
        var suffix = el.getAttribute("data-suffix") || "";
        el.textContent = prefix + el.getAttribute("data-count") + suffix;
      });
    }
  }

  /* ---- Footer year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- Mark active nav link by path ---- */
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "index.html" && href === "index.html")) {
      a.classList.add("active");
    }
  });
})();
<a href="#top" class="scroll-down-cue scroll-down-cue--bottom" aria-label="Back to top">
  <span></span>
  <span></span>
</a>
