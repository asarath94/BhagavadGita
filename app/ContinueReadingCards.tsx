"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteBookmark, loadBookmarks, type Bookmarks } from "@/lib/bookmark";

export function ContinueReadingCards() {
  const [bookmarks, setBookmarks] = useState<Bookmarks>({});
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    setBookmarks(loadBookmarks());
  }, []);

  function handleDelete(name: string) {
    deleteBookmark(name);
    setBookmarks(loadBookmarks());
    setPendingDelete(null);
  }

  const entries = Object.entries(bookmarks).sort(
    (a, b) => b[1].timestamp - a[1].timestamp,
  );

  return (
    <>
      {entries.map(([name, bookmark]) => (
        <div key={name} className="continue-card">
          <Link
            href={`/chapters/${bookmark.chapter}/${bookmark.verseId}`}
            className="continue-card-link"
          >
            <span className="continue-card-eyebrow">
              Continue reading — {name}
            </span>
            <span className="continue-card-label">
              Chapter {bookmark.chapter}, Sloka {bookmark.label}
            </span>
          </Link>
          {pendingDelete === name ? (
            <div className="continue-card-confirm">
              <button
                type="button"
                className="continue-card-confirm-btn"
                aria-label={`Confirm delete bookmark for ${name}`}
                onClick={() => handleDelete(name)}
              >
                ✓
              </button>
              <button
                type="button"
                className="continue-card-cancel-btn"
                aria-label="Cancel delete"
                onClick={() => setPendingDelete(null)}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="continue-card-delete"
              aria-label={`Delete bookmark for ${name}`}
              onClick={() => setPendingDelete(name)}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </>
  );
}
