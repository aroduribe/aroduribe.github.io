// Build-time fetch: pull The Shelf from Goodreads RSS feeds (no API exists, but
// per-shelf RSS does) and write books.json for the page to load. Runs in the
// GitHub Actions deploy (server-side, so no CORS). Exits 0 on any failure so a
// fetch error never blocks the deploy — the page keeps its static fallback.
const fs = require("fs");

const USER = "10314208";
const READ_COUNT = 10;
const FEEDS = {
  current: "https://www.goodreads.com/review/list_rss/" + USER + "?shelf=currently-reading",
  read: "https://www.goodreads.com/review/list_rss/" + USER + "?shelf=read",
};
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function pick(block, tag) {
  var m = block.match(new RegExp("<" + tag + ">([\\s\\S]*?)<\\/" + tag + ">"));
  return m ? m[1] : "";
}

function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&hellip;/g, "…")
    .trim();
}

async function items(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml" },
  });
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
  const xml = await res.text();
  return xml.split("<item>").slice(1).map((s) => s.split("</item>")[0]);
}

// Trim Goodreads cruft: drop "(Series, #1)" parentheticals and ": subtitle".
function cleanTitle(t) {
  return t.replace(/\s*\([^)]*\)/g, "").split(":")[0].trim();
}

function book(block) {
  const bookId = decode(pick(block, "book_id"));
  return {
    title: cleanTitle(decode(pick(block, "title"))),
    author: decode(pick(block, "author_name")),
    cover: decode(pick(block, "book_large_image_url")),
    link: bookId ? "https://www.goodreads.com/book/show/" + bookId : decode(pick(block, "link")),
  };
}

(async function () {
  try {
    const current = (await items(FEEDS.current)).map(book).filter((b) => b.title);
    const read = (await items(FEEDS.read)).map(book).filter((b) => b.title).slice(0, READ_COUNT);
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
