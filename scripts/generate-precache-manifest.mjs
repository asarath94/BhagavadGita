// Runs after every build (npm "postbuild" hook) and before dev ("predev").
// Lists every route the static content actually supports, plus a version
// hash of that content, so the service worker knows exactly what to
// precache and when to invalidate its cache. Also stamps the Next.js build
// ID into public/sw.js so a code-only deploy (no content change) still
// changes the service worker's bytes and gets picked up by the browser's
// update check — the content hash alone can't do that, since it only
// changes when verse content changes.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contentDir = path.join(root, "content");
const chaptersDir = path.join(contentDir, "chapters");

const buildIdFile = path.join(root, ".next", "BUILD_ID");
const buildId = fs.existsSync(buildIdFile)
  ? fs.readFileSync(buildIdFile, "utf-8").trim()
  : "dev";

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

const manifest = { version, buildId, urls: Array.from(urls) };

fs.mkdirSync(path.join(root, "public"), { recursive: true });
fs.writeFileSync(
  path.join(root, "public", "precache-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
fs.writeFileSync(
  path.join(root, "public", "search-index.json"),
  JSON.stringify(searchIndex),
);

const swFile = path.join(root, "public", "sw.js");
const swSource = fs.readFileSync(swFile, "utf-8");
const stamped = swSource.replace(
  /^\/\/ cache-bust: .*$/m,
  `// cache-bust: ${version}-${buildId}`,
);
fs.writeFileSync(swFile, stamped);

console.log(
  `precache-manifest.json: ${manifest.urls.length} urls, content ${version}, build ${buildId}`,
);
console.log(`search-index.json: ${searchIndex.length} verses`);
