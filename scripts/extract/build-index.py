"""Build content/verse-index.json by scanning content/source/telugu-gita.pdf
for standalone verse-number labels (e.g. 1.1, 2.47, 1.32 - 35)."""

import json
import re
from collections import Counter
from pathlib import Path

import fitz  # PyMuPDF

SRC = Path(__file__).resolve().parents[2] / "content" / "source" / "telugu-gita.pdf"
OUT = Path(__file__).resolve().parents[2] / "content" / "verse-index.json"

VERSE_RE = re.compile(r"^(\d{1,3})\.(\d{1,3})(\s*[-–—]\s*\d{1,3})?(\s|$)")
MAX_CHAPTER = 18  # Bhagavad Gita has 18 chapters; filters stray numbers like "311.04"


def main() -> None:
    doc = fitz.open(SRC)
    verses = []
    for page_index in range(doc.page_count):
        for line in doc[page_index].get_text().split("\n"):
            s = line.strip()
            m = VERSE_RE.match(s)
            if not m:
                continue
            chapter = int(m.group(1))
            if not (1 <= chapter <= MAX_CHAPTER):
                continue
            # PyMuPDF sometimes merges a heading with the start of the next
            # word/sloka on one line; but a digit soon after the match means
            # this is actually an in-body cross-reference like "7.17 మరియు 11.40".
            if re.search(r"[0-9]", s[m.end():][:20]):
                continue
            label = s[: m.end()].strip()
            verses.append(
                {
                    "chapter": chapter,
                    "id": re.sub(r"\s+", "", label),
                    "label": re.sub(r"\s+", " ", label),
                    "page": page_index + 1,
                }
            )

    OUT.write_text(json.dumps(verses, ensure_ascii=False, indent=2), encoding="utf-8")

    per_chapter = Counter(v["chapter"] for v in verses)
    print(f"Total verses found: {len(verses)}")
    for chapter in range(1, MAX_CHAPTER + 1):
        print(f"  Chapter {chapter}: {per_chapter.get(chapter, 0)}")


if __name__ == "__main__":
    main()
