import Link from "next/link";
import { ContinueReadingCards } from "./ContinueReadingCards";
import { SearchJump } from "./SearchJump";

export default function HomePage() {
  return (
    <main className="welcome">
      <div className="welcome-content">
        <p className="welcome-eyebrow" lang="te">
          శ్రీమద్భగవద్గీత
        </p>
        <h1>Bhagavad Gita</h1>
        <p className="welcome-tagline">
          Read the eighteen chapters in Telugu, verse by verse.
        </p>
        <Link href="/chapters" className="button-primary">
          Browse Chapters
        </Link>
        <SearchJump />
        <ContinueReadingCards />
      </div>
    </main>
  );
}
