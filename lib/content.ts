import fs from "node:fs";
import path from "node:path";
import verseIndexData from "@/content/verse-index.json";

export type VerseIndexEntry = {
  chapter: number;
  id: string;
  label: string;
  page: number;
};

export type Verse = {
  id: string;
  label: string;
  sloka: string;
  translation: string;
  explanation: string;
};

const verseIndex = verseIndexData as VerseIndexEntry[];
const chaptersDir = path.join(process.cwd(), "content", "chapters");

export function getChapterNumbers(): number[] {
  return Array.from(new Set(verseIndex.map((v) => v.chapter))).sort(
    (a, b) => a - b,
  );
}

export function getVerseIndexForChapter(chapter: number): VerseIndexEntry[] {
  return verseIndex.filter((v) => v.chapter === chapter);
}

function loadChapterContent(chapter: number): Verse[] | null {
  const file = path.join(chaptersDir, `${chapter}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function getAvailableVerseIds(chapter: number): Set<string> {
  const content = loadChapterContent(chapter);
  return new Set(content?.map((v) => v.id));
}

export function getVerse(chapter: number, id: string): Verse | null {
  const content = loadChapterContent(chapter);
  return content?.find((v) => v.id === id) ?? null;
}

export function getAdjacentVerses(
  chapter: number,
  id: string,
): { prev: VerseIndexEntry | null; next: VerseIndexEntry | null } {
  const i = verseIndex.findIndex((v) => v.chapter === chapter && v.id === id);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? verseIndex[i - 1] : null,
    next: i < verseIndex.length - 1 ? verseIndex[i + 1] : null,
  };
}
