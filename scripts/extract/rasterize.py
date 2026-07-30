"""Render content/source/telugu-gita.pdf to JPEGs in content/raw-pages/."""

from pathlib import Path

import fitz  # PyMuPDF

SRC = Path(__file__).resolve().parents[2] / "content" / "source" / "telugu-gita.pdf"
OUT_DIR = Path(__file__).resolve().parents[2] / "content" / "raw-pages"
DPI = 150


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = fitz.open(SRC)
    width = max(3, len(str(doc.page_count)))
    for i, page in enumerate(doc, start=1):
        pix = page.get_pixmap(dpi=DPI)
        pix.save(OUT_DIR / f"page-{i:0{width}d}.jpg")
    print(f"Rendered {doc.page_count} pages to {OUT_DIR}")


if __name__ == "__main__":
    main()
