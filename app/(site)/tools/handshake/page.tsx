import type { Metadata } from "next";
import Link from "next/link";
import { HandshakeCreatorForm } from "@/components/tools/handshake/creator-form";

export const metadata: Metadata = {
  title: "Handshake — Kestrel",
  description:
    "Create a lightweight shareable agreement between two parties. Confirm terms quickly and clearly, no sign-up required.",
};

export default function HandshakePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/tools"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; All tools
      </Link>

      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
        Create a Handshake
      </h1>
      <p className="mt-3 text-text-secondary leading-relaxed">
        Record what was agreed between two parties. Share a link so the other
        side can review and confirm, suggest changes, or decline. Neither party
        needs to sign up.
      </p>
      <p className="mt-2 text-sm text-text-muted">
        No sign-up required. Free.
      </p>

      <HandshakeCreatorForm />
    </div>
  );
}
