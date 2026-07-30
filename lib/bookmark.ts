export type Bookmark = {
  chapter: number;
  verseId: string;
  label: string;
  timestamp: number;
};

export type Bookmarks = Record<string, Bookmark>;

const BOOKMARKS_KEY = "bhagavadgita:bookmarks";
const LAST_NAME_KEY = "bhagavadgita:bookmark-last-name";

export function loadBookmarks(): Bookmarks {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveBookmark(
  name: string,
  bookmark: Omit<Bookmark, "timestamp">,
) {
  const bookmarks = loadBookmarks();
  bookmarks[name] = { ...bookmark, timestamp: Date.now() };
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  localStorage.setItem(LAST_NAME_KEY, name);
}

export function deleteBookmark(name: string) {
  const bookmarks = loadBookmarks();
  delete bookmarks[name];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function loadLastBookmarkName(): string {
  try {
    return localStorage.getItem(LAST_NAME_KEY) ?? "";
  } catch {
    return "";
  }
}
