import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-ink">Page not found</h2>
        <p className="text-text-secondary">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 bg-kestrel text-white rounded-lg hover:bg-kestrel-hover transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
