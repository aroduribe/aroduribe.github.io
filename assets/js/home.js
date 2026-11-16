// Home: intro loader (first-visit only, sessionStorage-gated) + cover tape peel.
(function () {
  var firstVisit = window.__firstVisit;
  var overlay = document.getElementById("introLoader");

  if (firstVisit && overlay) {
    // Start fade at 2.2s, remove + set flag at 2.78s (matches prototype timing).
    setTimeout(function () { overlay.style.opacity = "0"; }, 2200);
    setTimeout(function () {
      try { sessionStorage.setItem("alex_zine_loaded", "1"); } catch (e) {}
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      document.documentElement.classList.remove("intro");
    }, 2780);
  }

  // Cover top-tape peels in: ~3.05s on first visit, 350ms on repeat visits.
  var tapeDelay = firstVisit ? 3050 : 350;
  setTimeout(function () {
    var el = document.getElementById("coverTape");
    if (!el || el.dataset.peel === "go") return;
    el.setAttribute("data-peel", "go");
  }, tapeDelay);
})();

// Masthead issue line tracks the current season so it never reads stale.
// December counts as winter of the following year (Dec 2026 → WINTER 2027),
// so one winter isn't split across two "issues".
(function () {
  var el = document.getElementById("issueSeason");
  if (!el) return;
  var now = new Date();
  var m = now.getMonth();
  var year = now.getFullYear() + (m === 11 ? 1 : 0);
  var season = m === 11 || m < 2 ? "WINTER" : m < 5 ? "SPRING" : m < 8 ? "SUMMER" : "FALL";
  el.textContent = "ISSUE: " + season + " " + year;
})();
