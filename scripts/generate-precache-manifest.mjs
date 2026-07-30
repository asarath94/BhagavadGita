// Runs before every build (npm "prebuild" hook). Lists every route the
// static content actually supports, plus a version hash of that content,
// so the service worker knows exactly what to precache and when to
// invalidate its cache.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const chaptersDir = path.join(contentDir, "chapters");

const verseIndexBytes = fs.readFileSync(
  path.join(contentDir, "verse-index.json"),
);
const verseIndex = JSON.parse(verseIndexBytes.toString("utf-8"));

const chapters = Array.from(new Set(verseIndex.map((v) => v.chapter))).sort(
  (a, b) => a - b,
);

const urls = new Set(["/", "/chapters", "/search-index.json"]);
const searchIndex = [];
let hashInput = verseIndexBytes;

for (const chapter of chapters) {
  urls.add(`/chapters/${chapter}`);
  const file = path.join(chaptersDir, `${chapter}.json`);
  if (!fs.existsSync(file)) continue;
  const bytes = fs.readFileSync(file);
  hashInput = Buffer.concat([hashInput, bytes]);
  const verses = JSON.parse(bytes.toString("utf-8"));
  for (const v of verses) {
    urls.add(`/chapters/${chapter}/${v.id}`);
    searchIndex.push({
      chapter,
      id: v.id,
      label: v.label,
      translation: v.translation,
    });
  }
}

const version = createHash("sha256")
  .update(hashInput)
  .digest("hex")
  .slice(0, 16);

const manifest = { version, urls: Array.from(urls) };

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(
  path.join(root, "public", "precache-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
fs.writeFileSync(
  path.join(root, "public", "search-index.json"),
  JSON.stringify(searchIndex),
);

console.log(
  `precache-manifest.json: ${manifest.urls.length} urls, version ${version}`,
);
console.log(`search-index.json: ${searchIndex.length} verses`);
