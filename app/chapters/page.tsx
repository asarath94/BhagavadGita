import Link from "next/link";
import { getChapterNumbers, getVerseIndexForChapter } from "@/lib/content";

export default function ChaptersPage() {
  const chapters = getChapterNumbers();

  return (
    <main className="container">
      <Link href="/" className="back-link">
        ← Home
      </Link>
      <h1>Chapters</h1>
      <ul className="chapter-list">
        {chapters.map((n) => {
          const verseCount = getVerseIndexForChapter(n).length;
          return (
            <li key={n}>
              <Link href={`/chapters/${n}`} className="chapter-row">
                <span className="chapter-number">Chapter {n}</span>
                <span className="chapter-meta">{verseCount} verses</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
