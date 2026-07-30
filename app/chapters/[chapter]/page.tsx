import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAvailableVerseIds,
  getChapterNumbers,
  getVerseIndexForChapter,
} from "@/lib/content";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const chapterNum = Number(chapter);

  if (!getChapterNumbers().includes(chapterNum)) notFound();

  const verses = getVerseIndexForChapter(chapterNum);
  const available = getAvailableVerseIds(chapterNum);

  return (
    <main className="container">
      <Link href="/chapters" className="back-link">
        ← Chapters
      </Link>
      <h1>Chapter {chapterNum}</h1>
      <ul className="verse-list">
        {verses.map((v) => {
          const isAvailable = available.has(v.id);
          return (
            <li key={v.id}>
              {isAvailable ? (
                <Link
                  href={`/chapters/${chapterNum}/${v.id}`}
                  className="verse-row"
                >
                  {v.label}
                </Link>
              ) : (
                <span
                  className="verse-row verse-row-unavailable"
                  aria-disabled="true"
                >
                  {v.label}
                  <span className="unavailable-tag">Not available yet</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
