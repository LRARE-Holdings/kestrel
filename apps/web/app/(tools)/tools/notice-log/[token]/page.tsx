import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { NoticeView } from "@/components/tools/notices/notice-view";

export const metadata: Metadata = {
  title: "View Notice — Kestrel",
  description: "View and acknowledge a formal notice.",
};

export default async function NoticeViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: notice, error } = await supabase
    .from("notices")
    .select("*")
    .eq("access_token", token)
    .single();

  if (error || !notice) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-8 2xl:px-12">
      <Link
        href="/tools/notice-log"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; Create another notice
      </Link>

      <div className="rounded-2xl border border-border-subtle/60 bg-surface/70 p-8 shadow-sm backdrop-blur-xl sm:p-12">
        <NoticeView notice={notice} />
      </div>
    </div>
  );
}
