import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="welcome-content">
        <h1>Page not found</h1>
        <p className="welcome-tagline">
          That chapter or verse doesn&apos;t exist.
        </p>
        <Link href="/" className="button-primary">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
