import type { Metadata } from "next";
import Link from "next/link";
import { ProjectForm } from "@/components/tools/milestones/project-form";

export const metadata: Metadata = {
  title: "Milestone Tracker — Kestrel",
  description:
    "Track project milestones and deliverables between two parties. Shareable, with status tracking and automatic overdue detection.",
};

export default function MilestonesPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; All tools
      </Link>

      <h1 className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
        Milestone Tracker
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary leading-relaxed">
        Set up milestones for a project between two parties. Share the tracker
        via a unique link so both sides can see the same deadlines, status, and
        deliverables.
      </p>
      <p className="mt-2 text-sm text-text-muted">
        No sign-up required. Free.
      </p>

      <div className="mt-8">
        <ProjectForm />
      </div>

      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        This milestone tracker is for project management and communication
        purposes. It does not constitute a binding agreement unless incorporated
        into a contract between the parties. If a dispute arises, seek
        independent legal advice. This tool is designed for use by businesses in
        England and Wales.
      </p>
    </div>
  );
}
