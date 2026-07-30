"use client";

import { useState } from "react";
import { loadLastBookmarkName, saveBookmark } from "@/lib/bookmark";

export function BookmarkButton({
  chapter,
  verseId,
  label,
}: {
  chapter: number;
  verseId: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [savedAs, setSavedAs] = useState<string | null>(null);

  function openForm() {
    setName(loadLastBookmarkName());
    setSavedAs(null);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveBookmark(trimmed, { chapter, verseId, label });
    setOpen(false);
    setSavedAs(trimmed);
  }

  return (
    <div className="bookmark-block">
      {open ? (
        <form className="bookmark-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="bookmark-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Amma)"
            aria-label="Bookmark name"
            autoFocus
          />
          <button type="submit" className="bookmark-save">
            Save
          </button>
          <button
            type="button"
            className="bookmark-cancel"
            aria-label="Cancel"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </form>
      ) : (
        <button type="button" className="bookmark-trigger" onClick={openForm}>
          Bookmark this sloka
        </button>
      )}
      {savedAs && !open && (
        <p className="bookmark-status">Bookmarked as “{savedAs}”.</p>
      )}
    </div>
  );
}
