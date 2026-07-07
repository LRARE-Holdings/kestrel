import { NextResponse } from "next/server";
import { createClient } from "@kestrel/shared/supabase/server";
import { buildSarExport, sarExportFilename } from "@/lib/account/export";

/**
 * UK GDPR subject access export. Gathers the signed-in user's own rows via
 * RLS-scoped queries and returns them as a downloadable JSON file. Any table
 * that can't be read is recorded under `omissions` rather than failing the
 * whole export.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const omissions: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function safe<T>(label: string, run: () => PromiseLike<{ data: T; error: any }>): Promise<T | null> {
    try {
      const { data, error } = await run();
      if (error) {
        omissions.push(`${label}: ${error.message ?? "could not be read"}`);
        return null;
      }
      return data;
    } catch (err) {
      omissions.push(`${label}: ${err instanceof Error ? err.message : "could not be read"}`);
      return null;
    }
  }

  const email = user.email ?? null;

  const [
    profile,
    savedDocuments,
    disputes,
    disputeSubmissions,
    evidenceFiles,
    notifications,
    handshakes,
    notices,
    milestoneProjects,
  ] = await Promise.all([
    safe("profile", () =>
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    ),
    safe("saved_documents", () =>
      supabase.from("saved_documents").select("*").eq("user_id", user.id),
    ),
    safe("disputes", () =>
      supabase
        .from("disputes")
        .select("*")
        .or(
          `initiating_party_id.eq.${user.id},responding_party_id.eq.${user.id}`,
        ),
    ),
    safe("dispute_submissions", () =>
      supabase.from("dispute_submissions").select("*").eq("submitted_by", user.id),
    ),
    safe("evidence_files", () =>
      supabase.from("evidence_files").select("*").eq("uploaded_by", user.id),
    ),
    safe("notifications", () =>
      supabase.from("notifications").select("*").eq("user_id", user.id),
    ),
    // Tool records rely on the created_by column (may not be migrated yet).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    safe("handshakes", () =>
      (supabase.from("handshakes") as any).select("*").eq("created_by", user.id),
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    safe("notices", () =>
      (supabase.from("notices") as any).select("*").eq("created_by", user.id),
    ),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    safe("projects", () =>
      (supabase.from("projects") as any).select("*").eq("created_by", user.id),
    ),
  ]);

  const generatedAt = new Date().toISOString();

  const payload = buildSarExport({
    generatedAt,
    user: { id: user.id, email },
    profile,
    savedDocuments: (savedDocuments as unknown[]) ?? [],
    disputes: (disputes as unknown[]) ?? [],
    disputeSubmissions: (disputeSubmissions as unknown[]) ?? [],
    evidenceFiles: (evidenceFiles as unknown[]) ?? [],
    notifications: (notifications as unknown[]) ?? [],
    handshakes: (handshakes as unknown[]) ?? [],
    notices: (notices as unknown[]) ?? [],
    milestoneProjects: (milestoneProjects as unknown[]) ?? [],
    omissions,
  });

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${sarExportFilename(generatedAt)}"`,
      "Cache-Control": "no-store",
    },
  });
}
