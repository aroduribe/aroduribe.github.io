// Film Diary: swap in the latest entries from films.json (baked at deploy time
// from the Letterboxd RSS feed). If the file is missing or invalid — e.g. the
// local server with no build step, or a failed CI fetch — the static fallback
// entries already in the HTML are left untouched.
(function () {
  var grid = document.getElementById("filmDiary");
  if (!grid || !window.fetch) return;

  fetch("films.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("no films.json"); return r.json(); })
    .then(function (films) {
      if (!Array.isArray(films) || films.length === 0) return;
      grid.innerHTML = films.slice(0, 4).map(entry).join("");
    })
    .catch(function () { /* keep the static fallback */ });

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function entry(f) {
    var year = f.year
      ? " <span style=\"font-family:'Newsreader',serif;font-style:italic;font-weight:400;font-size:14px;color:#6e6459;\">" + esc(f.year) + "</span>"
      : "";
    return '<div style="display:flex;gap:14px;">' +
        '<div style="position:relative;flex:0 0 70px;height:104px;background:repeating-linear-gradient(135deg,#7c5530 0 9px,#6c4626 9px 18px);border:2px solid #2a2521;display:flex;align-items:flex-end;padding:5px;">' +
          '<span style="font-family:\'Spline Sans Mono\',monospace;font-size:7.5px;color:#f1e6cf;background:rgba(33,29,24,.55);padding:1px 3px;">poster</span>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div style="font-family:\'Gluten\',cursive;font-weight:700;font-size:18px;line-height:1.1;color:#2a2521;">' + esc(f.title) + year + '</div>' +
          '<div style="font-size:16px;color:#b14a1e;letter-spacing:1px;margin:3px 0 6px;">' + esc(f.stars) + '</div>' +
          '<div style="font-family:\'Spline Sans Mono\',monospace;font-size:10px;color:#9a8b73;">logged on Letterboxd</div>' +
        '</div>' +
      '</div>';
  }
})();
