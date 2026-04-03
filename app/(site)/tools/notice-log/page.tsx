import type { Metadata } from "next";
import Link from "next/link";
import { NoticeForm } from "@/components/tools/notices/notice-form";

export const metadata: Metadata = {
  title: "Notice Log — Kestrel",
  description:
    "Create formal notices for breach, termination, change requests, payment demands, and more. Shareable, timestamped, and acknowledgeable.",
};

export default function NoticeLogPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; All tools
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
          Notice Log
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary leading-relaxed">
          Create a formal notice and share it with the recipient via a unique
          link. They can view the notice and acknowledge receipt, creating a
          timestamped audit trail.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          No sign-up required. Free.
        </p>

        <div className="mt-8">
          <NoticeForm />
        </div>

        <p className="mt-12 text-xs leading-relaxed text-text-muted">
          Notices created through this tool are for record-keeping and
          communication purposes. They do not constitute legal advice and are not
          a substitute for formal legal proceedings. If you are uncertain about
          your rights or obligations, seek independent legal advice. This tool is
          designed for use in England and Wales.
        </p>
      </div>
    </div>
  );
}
