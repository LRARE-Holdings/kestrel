import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CopyLinkButton } from "@/components/tools/handshake/copy-link-button";

export const metadata: Metadata = {
  title: "Handshake Created — Kestrel",
  description: "Your handshake agreement has been created. Share the link with the other party.",
};

export default async function HandshakeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
        <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
          <h1 className="font-display text-3xl tracking-tight text-ink">
            Something went wrong
          </h1>
          <p className="mt-3 text-text-secondary">
            No handshake token was provided. Please try creating a new handshake.
          </p>
          <Link
            href="/tools/handshake"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-kestrel hover:text-kestrel-hover transition-colors"
          >
            &larr; Create a new handshake
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/tools/handshake/${token}`;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; All tools
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        {/* Success indicator */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-kestrel"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display text-3xl tracking-tight text-ink">
            Handshake Created
          </h1>
        </div>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div>
              <p className="text-sm font-medium text-ink">Shareable link</p>
              <p className="mt-1 text-xs text-text-muted">
                Share this link with the other party so they can review and respond.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 overflow-hidden rounded-[var(--radius-md)] border border-border bg-stone/50 px-3 py-2">
                <p className="truncate text-sm text-ink">{shareUrl}</p>
              </div>
              <CopyLinkButton url={shareUrl} />
            </div>

            <div className="rounded-[var(--radius-md)] border border-border-subtle bg-kestrel/5 px-4 py-3">
              <p className="text-sm font-medium text-ink">What happens next</p>
              <ul className="mt-2 space-y-1.5 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kestrel" />
                  The other party opens the link and reviews the terms
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kestrel" />
                  They can confirm, suggest changes, or decline
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kestrel" />
                  Both parties can view the outcome at the same link
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href={`/tools/handshake/${token}`}>
            <span className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border bg-transparent px-4 py-2 text-sm font-medium text-ink hover:bg-stone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kestrel/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream">
              View handshake
            </span>
          </Link>
          <Link href="/tools/handshake">
            <span className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-transparent px-4 py-2 text-sm font-medium text-text-muted hover:text-kestrel transition-colors">
              Create another
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
