/**
 * Shaping for the Subject Access Request (SAR) export — the UK GDPR "right of
 * access" download. This module is deliberately pure so it can be unit-tested
 * without a database: the route gathers the caller's own rows (RLS-scoped) and
 * passes them here to be assembled into a stable, honest JSON structure.
 */

export interface SarExportInput {
  generatedAt: string;
  user: { id: string; email: string | null };
  profile: unknown | null;
  savedDocuments: unknown[];
  disputes: unknown[];
  disputeSubmissions: unknown[];
  evidenceFiles: unknown[];
  notifications: unknown[];
  handshakes: unknown[];
  notices: unknown[];
  milestoneProjects: unknown[];
  /** Tables that couldn't be read, with a short reason. */
  omissions: string[];
}

export interface SarExport {
  export: {
    service: "Kestrel";
    kind: "subject_access_request";
    generatedAt: string;
    subject: { userId: string; email: string | null };
    notes: string[];
    omissions: string[];
    counts: Record<string, number>;
  };
  profile: unknown | null;
  savedDocuments: unknown[];
  disputes: unknown[];
  disputeSubmissions: unknown[];
  evidenceFiles: unknown[];
  notifications: unknown[];
  handshakes: unknown[];
  notices: unknown[];
  milestoneProjects: unknown[];
}

export function buildSarExport(input: SarExportInput): SarExport {
  const savedDocuments = input.savedDocuments ?? [];
  const disputes = input.disputes ?? [];
  const disputeSubmissions = input.disputeSubmissions ?? [];
  const evidenceFiles = input.evidenceFiles ?? [];
  const notifications = input.notifications ?? [];
  const handshakes = input.handshakes ?? [];
  const notices = input.notices ?? [];
  const milestoneProjects = input.milestoneProjects ?? [];

  return {
    export: {
      service: "Kestrel",
      kind: "subject_access_request",
      generatedAt: input.generatedAt,
      subject: { userId: input.user.id, email: input.user.email },
      notes: [
        "This file contains the personal data Kestrel holds that is directly associated with your account.",
        "Evidence files are listed by metadata only; download the files themselves from each dispute.",
        "Data belonging to other parties in your disputes is not included.",
      ],
      omissions: input.omissions ?? [],
      counts: {
        savedDocuments: savedDocuments.length,
        disputes: disputes.length,
        disputeSubmissions: disputeSubmissions.length,
        evidenceFiles: evidenceFiles.length,
        notifications: notifications.length,
        handshakes: handshakes.length,
        notices: notices.length,
        milestoneProjects: milestoneProjects.length,
      },
    },
    profile: input.profile ?? null,
    savedDocuments,
    disputes,
    disputeSubmissions,
    evidenceFiles,
    notifications,
    handshakes,
    notices,
    milestoneProjects,
  };
}

/** A filename like `kestrel-data-export-2026-07-07.json`. */
export function sarExportFilename(generatedAt: string): string {
  const date = generatedAt.slice(0, 10) || "export";
  return `kestrel-data-export-${date}.json`;
}
