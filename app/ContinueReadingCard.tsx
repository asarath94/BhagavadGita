"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadBookmark, type Bookmark } from "@/lib/bookmark";

export function ContinueReadingCard() {
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);

  useEffect(() => {
    setBookmark(loadBookmark());
  }, []);

  if (!bookmark) return null;

  return (
    <Link
      href={`/chapters/${bookmark.chapter}/${bookmark.verseId}`}
      className="continue-card"
    >
      <span className="continue-card-eyebrow">Continue reading</span>
      <span className="continue-card-label" lang="te">
        {bookmark.label}
      </span>
    </Link>
  );
}
