// Build-time fetch: pull The Shelf from Goodreads and write books.json for the
// page to load. Goodreads retired its shelf RSS feeds in Oct 2026 and shelf
// pages now need a sign-in, so this reads the public "custom widget" instead:
// a JS snippet holding the shelf as an HTML string. Runs in the GitHub Actions
// deploy (server-side, so no CORS). Exits 0 on any failure so a fetch error
// never blocks the deploy — the page keeps its static fallback.
const fs = require("fs");

const USER = "10314208";
const READ_COUNT = 10;
// Pin which currently-reading book gets the featured slot (matched on the
// start of the title). Goodreads has no "featured" concept and several books
// are on the shelf at once, so newest-started isn't always the one to show.
// Empty string = newest-started.
const FEATURED = "Yesteryear";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Goodreads caches widget output per widget_id, so each shelf needs its own id
// or the second request gets the first shelf back.
function widgetUrl(shelf, sort) {
  return (
    "https://www.goodreads.com/review/custom_widget/" + USER + ".Shelf" +
    "?shelf=" + shelf + "&sort=" + sort + "&order=d&num_books=" + READ_COUNT +
    "&show_cover=1&show_title=1&show_author=1&cover_size=medium" +
    "&widget_id=aroduribe_" + shelf.replace(/-/g, "_")
  );
}

const FEEDS = {
  // date_added: the featured "currently reading" book is the one started last.
  current: widgetUrl("currently-reading", "date_added"),
  read: widgetUrl("read", "date_read"),
};

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&hellip;/g, "…")
    .trim();
}

// The response is JS: `var widget_code = '<html…>'`. Pull out that string
// literal and undo its JS escaping (\" \' \/ \n) to get plain HTML.
function widgetHtml(js) {
  const m = js.match(/var widget_code\s*=\s*'((?:\\[\s\S]|[^'\\])*)'/);
  if (!m) throw new Error("widget_code not found");
  return m[1].replace(/\\(.)/g, function (_, c) {
    return c === "n" ? "\n" : c === "t" ? "\t" : c;
  });
}

async function blocks(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
  const html = widgetHtml(await res.text());
  return html.split(/class="gr_custom_each_container[^"]*"/).slice(1);
}

// Trim Goodreads cruft: drop "(Series, #1)" parentheticals and ": subtitle".
function cleanTitle(t) {
  return t.replace(/\s*\([^)]*\)/g, "").split(":")[0].trim();
}

function book(block) {
  const img = block.match(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"/);
  const author = block.match(/gr_custom_author[\s\S]*?<a[^>]*>([^<]*)<\/a>/);
  const review = block.match(/href="(https:\/\/www\.goodreads\.com\/review\/show\/\d+)/);
  let cover = img ? decode(img[2]) : "";
  // Widget covers are ~98px thumbnails; dropping the size suffix
  // (._SX98_) serves the full-size image, which the shelf needs.
  cover = cover.replace(/\._S[XY]\d+_(?=\.\w+$)/, "");
  // Book id isn't in the widget, but it's in the cover path (books/<ts>l/<id>);
  // book pages are public, whereas review pages now want a sign-in.
  const id = cover.match(/\/books\/\d+l\/(\d+)/);
  return {
    title: cleanTitle(img ? decode(img[1]) : ""),
    author: author ? decode(author[1]) : "",
    cover: cover,
    link: id ? "https://www.goodreads.com/book/show/" + id[1] : review ? review[1] : "",
  };
}

(async function () {
  try {
    const current = (await blocks(FEEDS.current)).map(book).filter((b) => b.title);
    const pin = FEATURED ? current.findIndex((b) => b.title.toLowerCase().startsWith(FEATURED.toLowerCase())) : -1;
    if (FEATURED && pin < 0) console.warn("FEATURED book not on the shelf, using newest: " + FEATURED);
    if (pin > 0) current.unshift(current.splice(pin, 1)[0]);
    const read = (await blocks(FEEDS.read)).map(book).filter((b) => b.title).slice(0, READ_COUNT);
    if (!current.length && !read.length) throw new Error("no books parsed");
    fs.writeFileSync("books.json", JSON.stringify({ current: current, read: read }, null, 2) + "\n");
    console.log(
      "Wrote books.json: " + current.length + " currently-reading, " + read.length + " read\n" +
      "  reading: " + current.map((b) => b.title).join(", ") + "\n" +
      "  read:    " + read.map((b) => b.title).join(", ")
    );
  } catch (e) {
    console.error("fetch-books failed, keeping static fallback: " + e.message);
    process.exit(0);
  }
})();
