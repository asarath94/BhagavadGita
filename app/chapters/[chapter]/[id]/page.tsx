import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapterNumbers, getVerse, getVerseIndexForChapter } from "@/lib/content";
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
    </main>
  );
}
