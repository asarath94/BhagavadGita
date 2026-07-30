import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdjacentVerses,
  getChapterNumbers,
  getVerse,
  getVerseIndexForChapter,
} from "@/lib/content";
import { BookmarkSaver } from "./BookmarkSaver";

export default async function VersePage({
  params,
}: {
  params: Promise<{ chapter: string; id: string }>;
}) {
  const { chapter, id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const chapterNum = Number(chapter);

  if (!getChapterNumbers().includes(chapterNum)) notFound();

  const indexEntry = getVerseIndexForChapter(chapterNum).find(
    (v) => v.id === id,
  );
  if (!indexEntry) notFound();

  const verse = getVerse(chapterNum, id);
  const { prev, next } = getAdjacentVerses(chapterNum, id);

  return (
    <main className="container verse-detail">
      <Link href={`/chapters/${chapterNum}`} className="back-link">
        ← Chapter {chapterNum}
      </Link>
      <h1>Verse {indexEntry.label}</h1>
      {verse ? (
        <>
          <BookmarkSaver
            chapter={chapterNum}
            verseId={verse.id}
            label={verse.label}
          />
          <section lang="te" className="verse-sloka">
            {verse.sloka}
          </section>
          <section lang="te" className="verse-translation">
            {verse.translation}
          </section>
          {verse.explanation && (
            <section lang="te" className="verse-explanation">
              {verse.explanation}
            </section>
          )}
        </>
      ) : (
        <p className="verse-unavailable">
          This verse hasn&apos;t been transcribed yet. Check back soon.
        </p>
      )}
      <nav className="verse-nav" aria-label="Verse navigation">
        {prev ? (
          <Link
            href={`/chapters/${prev.chapter}/${prev.id}`}
            className="verse-nav-btn verse-nav-prev"
          >
            <span className="verse-nav-arrow" aria-hidden="true">
              ←
            </span>
            <span className="verse-nav-label" lang="te">
              {prev.label}
            </span>
          </Link>
        ) : (
          <span className="verse-nav-btn verse-nav-btn-disabled" />
        )}
        {next ? (
          <Link
            href={`/chapters/${next.chapter}/${next.id}`}
            className="verse-nav-btn verse-nav-next"
          >
            <span className="verse-nav-label" lang="te">
              {next.label}
            </span>
            <span className="verse-nav-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ) : (
          <span className="verse-nav-btn verse-nav-btn-disabled" />
        )}
      </nav>
    </main>
  );
}
