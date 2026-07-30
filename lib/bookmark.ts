export type Bookmark = {
  chapter: number;
  verseId: string;
  label: string;
};

const KEY = "bhagavadgita:bookmark";

export function saveBookmark(bookmark: Bookmark) {
  localStorage.setItem(KEY, JSON.stringify(bookmark));
}

export function loadBookmark(): Bookmark | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
