import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { TrackerView } from "@/components/tools/milestones/tracker-view";

export const metadata: Metadata = {
  title: "Project Tracker — Kestrel",
  description:
    "View and update project milestones between two parties.",
};

export default async function TrackerViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*, milestones(*)")
    .eq("access_token", token)
    .single();

  if (error || !project) {
    notFound();
  }

  // Sort milestones by sort_order
  if (project.milestones && Array.isArray(project.milestones)) {
    project.milestones.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order,
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools/milestones"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; Create another project
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <TrackerView project={project} />
      </div>
    </div>
  );
}
