// Build-time fetch: pull the latest film diary entries from the Letterboxd RSS
// feed and write them to films.json for the page to load. Runs in the GitHub
// Actions deploy (server-side, so no CORS and no secret needed). On any failure
// it exits 0 without writing a file, so the page keeps its static fallback.
const fs = require("fs");

const FEED = "https://letterboxd.com/aroduribe/rss/";
const COUNT = 4;
// Letterboxd 403s generic/bot agents, so present a normal browser UA.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function pick(block, tag) {
  var m = block.match(new RegExp("<" + tag + ">([\\s\\S]*?)<\\/" + tag + ">"));
  return m ? m[1].trim() : "";
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

function stars(ratingStr) {
  if (!ratingStr) return "";
  var r = parseFloat(ratingStr);
  if (isNaN(r)) return "";
  return "★".repeat(Math.floor(r)) + (r % 1 >= 0.5 ? "½" : "");
}

// The <description> CDATA holds the poster <img> then the review paragraphs.
function extractDesc(block) {
  var m = block.match(/<description>([\s\S]*?)<\/description>/);
  if (!m) return { poster: "", review: "" };
  var d = m[1].replace("<![CDATA[", "").replace("]]>", "");

  var pm = d.match(/<img[^>]+src="([^"]+)"/);
  var poster = pm ? pm[1] : "";

  var review = decode(
    d.replace(/<img[^>]*>/g, "")  // drop the poster image
      .replace(/<[^>]+>/g, " ")   // strip remaining tags
      .replace(/\s+/g, " ")
  );
  // Letterboxd inserts "Watched on <date>." when there is no written review.
  if (/^Watched on .+\.?$/i.test(review)) review = "";
  if (review.length > 220) {
    review = review.slice(0, 220);
    var sp = review.lastIndexOf(" ");
    if (sp > 120) review = review.slice(0, sp);
  }
  return { poster: poster, review: review };
}

(async function () {
  try {
    const res = await fetch(FEED, {
      headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const xml = await res.text();

    const items = xml.split("<item>").slice(1);
    const films = [];
    for (const raw of items) {
      const block = raw.split("</item>")[0];
      const title = pick(block, "letterboxd:filmTitle");
      if (!title) continue; // skip non-film activity (lists, etc.)
      const desc = extractDesc(block);
      films.push({
        title: decode(title),
        year: pick(block, "letterboxd:filmYear"),
        stars: stars(pick(block, "letterboxd:memberRating")),
        link: pick(block, "link"),
        poster: desc.poster,
        review: desc.review,
      });
      if (films.length >= COUNT) break;
    }

    if (films.length === 0) throw new Error("no film items parsed");
    fs.writeFileSync("films.json", JSON.stringify(films, null, 2) + "\n");
    console.log("Wrote films.json:\n" + films.map((f) => "  - " + f.title + " (" + f.year + ") " + f.stars).join("\n"));
  } catch (e) {
    console.error("fetch-films failed, keeping static fallback: " + e.message);
    process.exit(0); // non-fatal — deploy continues with the static entries
  }
})();
