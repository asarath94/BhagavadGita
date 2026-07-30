"use client";

import { useEffect } from "react";
import { saveBookmark } from "@/lib/bookmark";

export function BookmarkSaver({
  chapter,
  verseId,
  label,
}: {
  chapter: number;
  verseId: string;
  label: string;
}) {
  useEffect(() => {
    saveBookmark({ chapter, verseId, label });
  }, [chapter, verseId, label]);

  return null;
}
