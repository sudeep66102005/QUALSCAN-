/* ============================================================
   QUALSCAN — Geographic presence
   Scroll-driven horizontal "left swipe" through regions.
   The section is pinned (sticky) and the panel track translates
   left as the user scrolls down through the tall wrapper.
   ============================================================ */
(function () {
  "use strict";

  var sticky = document.querySelector(".geo-sticky");
  if (!sticky) return;

  var stage = sticky.querySelector(".geo-stage");
  var panelsTrack = sticky.querySelector(".geo-panels");
  var mapTrack = sticky.querySelector(".geo-map-track");
  var panels = Array.prototype.slice.call(sticky.querySelectorAll(".geo-panel"));
  var segs = Array.prototype.slice.call(sticky.querySelectorAll(".geo-progress .seg span"));
  var count = panels.length;
  if (!count) return;

  function update() {
    var rect = sticky.getBoundingClientRect();
    var scrollable = sticky.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    var p = Math.max(0, Math.min(1, -rect.top / scrollable));

    /* Translate panels left across (count-1) screens */
    var shift = p * (count - 1) * 100;
    if (panelsTrack) panelsTrack.style.transform = "translateX(-" + shift + "%)";

    /* Parallax the map slightly faster for depth */
    if (mapTrack) mapTrack.style.transform = "translateX(-" + (p * 32) + "%)";

    /* Active panel + progress segments */
    var active = Math.round(p * (count - 1));
    panels.forEach(function (panel, i) {
      panel.classList.toggle("is-active", i === active);
    });
    segs.forEach(function (s, i) {
      var local = (p * (count - 1)) - i;
      var w = Math.max(0, Math.min(1, local + 1)) * (i <= active ? 1 : 0);
      // simpler: fill fully up to active, partial on the leading one
      if (i < active) s.style.width = "100%";
      else if (i === active) {
        var frac = (p * (count - 1)) - active + 0.0001;
        s.style.width = (Math.max(0, Math.min(1, frac < 0 ? 1 + frac : frac)) * 100) + "%";
        s.style.width = "100%";
      } else s.style.width = "0%";
    });
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
