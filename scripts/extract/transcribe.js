// Transcribes a chapter of content/source/telugu-gita.pdf (already rasterized to
// content/raw-pages/page-NNN.jpg) into content/chapters/<chapter>.json, using the
// Claude API to read the page images directly.

const fs = require("fs");
const path = require("path");

const CHAPTER = 1;
const MODEL = "claude-sonnet-4-6";
const MAX_PAGES_PER_BATCH = 8;

const ROOT = path.resolve(__dirname, "..", "..");
const INDEX_PATH = path.join(ROOT, "content", "verse-index.json");
const PAGES_DIR = path.join(ROOT, "content", "raw-pages");
const OUT_PATH = path.join(ROOT, "content", "chapters", `${CHAPTER}.json`);

const PROMPT_TEMPLATE = `You are transcribing pages from a Telugu Bhagavad Gita commentary
(Bhaktivedanta Swami Prabhupada's translation). The pages use a
consistent color convention:

- Blue text  = the sloka (the verse itself, Sanskrit rendered in Telugu script)
- Red text   = the translation (short prose rendering of the verse's meaning)
- Black text = the explanation (the longer purport/commentary)

Verse numbers to locate, in order: {VERSE_IDS}

Rules for splitting content:
1. Find each verse number's heading in the pages.
2. Everything between that heading and the NEXT verse number's heading
   (or end of chapter) belongs to that verse — use this boundary together
   with the color coding, not either one alone, to decide what belongs
   to which verse and which section.
3. Within a verse's span: blue → sloka, red → translation, black → explanation.
4. Transcribe Telugu text exactly as written, in Telugu Unicode. Do not
   translate, paraphrase, summarize, or normalize spelling.
5. If a verse's content is split across a page boundary, join it into
   one continuous field.
6. If a section is genuinely absent for a verse, use an empty string
   for that field — do not omit the verse or invent content.

Return ONLY valid JSON, no markdown fences, no commentary:
[
  { "id": "1.30", "sloka": "...", "translation": "...", "explanation": "..." },
  { "id": "1.32-35", "sloka": "...", "translation": "...", "explanation": "..." }
]`;

function loadChapterVerses(chapter) {
  const all = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  const chapterVerses = all.filter((v) => v.chapter === chapter);

  return chapterVerses.map((v, i) => {
    const globalIndex = all.indexOf(v);
    const nextPage = all[globalIndex + 1] ? all[globalIndex + 1].page : v.page;
    const endPage = Math.max(v.page, nextPage - 1);
    return { id: v.id, startPage: v.page, endPage };
  });
}

function makeBatches(verses) {
  const batches = [];
  let current = [];
  let currentPages = 0;

  for (const verse of verses) {
    const versePages = verse.endPage - verse.startPage + 1;
    if (current.length > 0 && currentPages + versePages > MAX_PAGES_PER_BATCH) {
      batches.push(current);
      current = [];
      currentPages = 0;
    }
    current.push(verse);
    currentPages += versePages;
  }
  if (current.length > 0) batches.push(current);

  return batches;
}

function pageImagePath(pageNumber) {
  return path.join(PAGES_DIR, `page-${String(pageNumber).padStart(3, "0")}.jpg`);
}

async function transcribeBatch(batch, apiKey) {
  const startPage = batch[0].startPage;
  const endPage = batch[batch.length - 1].endPage;

  const images = [];
  for (let p = startPage; p <= endPage; p++) {
    const data = fs.readFileSync(pageImagePath(p)).toString("base64");
    images.push({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data },
    });
  }

  const verseIds = batch.map((v) => v.id).join(", ");
  const prompt = PROMPT_TEMPLATE.replace("{VERSE_IDS}", verseIds);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8192,
      messages: [{ role: "user", content: [...images, { type: "text", text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error for batch [${verseIds}]: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.content.map((block) => block.text || "").join("").trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse JSON for batch [${verseIds}]: ${err.message}`);
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable is not set");

  const verses = loadChapterVerses(CHAPTER);
  const batches = makeBatches(verses);

  const results = [];
  for (let i = 0; i < batches.length; i++) {
    const batchResult = await transcribeBatch(batches[i], apiKey);
    results.push(...batchResult);
    console.log(`batch ${i + 1}/${batches.length} done`);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
  console.log(`wrote ${results.length} verses to ${path.relative(ROOT, OUT_PATH)}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
