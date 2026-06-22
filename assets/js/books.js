// The Shelf: swap in books from books.json (baked at deploy time from the
// Goodreads currently-reading + read RSS shelves). If the file is missing or
// invalid — local server with no build step, or a failed CI fetch — the static
// fallback markup already in the HTML is left untouched.
(function () {
  if (!window.fetch) return;

  fetch("books.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("no books.json"); return r.json(); })
    .then(function (data) {
      if (data && Array.isArray(data.current) && data.current.length) renderCurrent(data.current);
      if (data && Array.isArray(data.read) && data.read.length) renderShelf(data.read);
    })
    .catch(function () { /* keep the static fallback */ });

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }
  function attr(s) { return esc(s).replace(/"/g, "&quot;"); }

  function cover(src, alt) {
    return '<img src="' + attr(src) + '" alt="' + attr(alt) + '" loading="lazy" ' +
      'style="width:100%;height:100%;object-fit:cover;display:block;">';
  }

  function renderCurrent(books) {
    var el = document.getElementById("currentlyReading");
    if (!el) return;
    var feat = books[0];
    var grLink = feat.link
      ? '<a href="' + attr(feat.link) + '" target="_blank" rel="noopener" ' +
        'style="display:inline-block;margin-top:8px;font-family:\'Spline Sans Mono\',monospace;font-size:10px;' +
        'letter-spacing:.08em;color:#b14a1e;text-decoration:none;">↗ view on goodreads</a>'
      : "";
    el.innerHTML =
      '<div style="position:relative;flex:0 0 92px;height:138px;border:2px solid #2a2521;overflow:hidden;background:#211d18;">' +
        cover(feat.cover, feat.title + " by " + feat.author) +
      '</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-family:\'Spline Sans Mono\',monospace;font-size:10px;letter-spacing:.14em;color:#b14a1e;">CURRENTLY READING</div>' +
        '<div style="font-family:\'Gluten\',cursive;font-weight:700;font-size:22px;line-height:1.1;color:#2a2521;margin-top:4px;">' + esc(feat.title) + '</div>' +
        '<div style="font-family:\'Newsreader\',serif;font-style:italic;font-size:14px;color:#6e6459;">' + esc(feat.author) + '</div>' +
        grLink +
      '</div>';
  }

  function renderShelf(books) {
    var el = document.getElementById("bookShelf");
    if (!el) return;
    var tilts = ["-4deg", "3deg", "-2deg", "4deg", "-3deg"];
    el.innerHTML = books.map(function (b, i) {
      return '<div class="book-spine" style="position:relative;flex:0 0 auto;width:122px;aspect-ratio:2/3;' +
        'border-radius:2px 5px 5px 2px;box-shadow:0 12px 24px -10px rgba(0,0,0,.55);overflow:hidden;' +
        'transform:rotate(' + tilts[i % tilts.length] + ');margin-left:-14px;background:#211d18;">' +
        cover(b.cover, b.title + " by " + b.author) +
      '</div>';
    }).join("");
  }
})();
