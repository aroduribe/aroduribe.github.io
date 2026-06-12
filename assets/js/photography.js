// Photography: contact-sheet lightbox with prev/next wrap + keyboard control.
(function () {
  var frames = Array.prototype.slice.call(document.querySelectorAll(".sheet-frame"));
  var images = frames.map(function (f) {
    var img = f.querySelector("img");
    return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" };
  });
  var count = images.length;

  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var current = null;

  function render() {
    if (current === null) return;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt;
  }

  function open(i) {
    current = i;
    render();
    lb.classList.add("open");
  }

  function close() {
    current = null;
    lb.classList.remove("open");
    lbImg.src = "";
  }

  function step(d) {
    if (current === null) return;
    current = (current + d + count) % count; // wrap around
    render();
  }

  // Open from each frame.
  frames.forEach(function (f) {
    f.addEventListener("click", function () {
      open(parseInt(f.getAttribute("data-index"), 10));
    });
  });

  // Backdrop click closes; clicks on the image itself do not.
  lb.addEventListener("click", close);
  document.getElementById("lbStage").addEventListener("click", function (e) { e.stopPropagation(); });

  document.getElementById("lbClose").addEventListener("click", function (e) { e.stopPropagation(); close(); });
  document.getElementById("lbPrev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
  document.getElementById("lbNext").addEventListener("click", function (e) { e.stopPropagation(); step(1); });

  // Keyboard: Esc closes, arrows step.
  window.addEventListener("keydown", function (e) {
    if (current === null) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });
})();
