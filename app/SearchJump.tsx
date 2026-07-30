"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SearchEntry = { chapter: number; id: string; label: string; translation: string };

export function SearchJump() {
  const router = useRouter();
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/search-index.json")
      .then((res) => res.json())
      .then(setIndex)
      .catch(() => setIndex([]));
  }, []);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q || !index) return [];
    const exact = index.find((v) => v.id === q);
    if (exact) return [exact];
    const qLower = q.toLowerCase();
    return index
      .filter((v) => v.translation.toLowerCase().includes(qLower))
      .slice(0, 8);
  }, [query, index]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results.length === 1) {
      router.push(`/chapters/${results[0].chapter}/${results[0].id}`);
      setQuery("");
    }
  }

  return (
    <form className="search-jump" onSubmit={handleSubmit} role="search">
      <input
        type="search"
        inputMode="search"
        className="search-input"
        placeholder="Jump to a verse (2.47) or search…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search verses or jump to a verse id"
      />
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((r) => (
            <li key={`${r.chapter}.${r.id}`}>
              <Link
                href={`/chapters/${r.chapter}/${r.id}`}
                className="search-result-row"
                onClick={() => setQuery("")}
              >
                <span className="search-result-label" lang="te">
                  {r.label}
                </span>
                <span className="search-result-snippet" lang="te">
                  {r.translation}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
