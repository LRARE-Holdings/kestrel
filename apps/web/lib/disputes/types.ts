import type { Tables } from "@kestrel/shared/supabase/types";

// ---------------------------------------------------------------------------
// Base row types (re-exported from generated Supabase types)
// ---------------------------------------------------------------------------

export type Dispute = Tables<"disputes">;
export type DisputeSubmission = Tables<"dispute_submissions">;
export type EvidenceFile = Tables<"evidence_files">;
export type Notification = Tables<"notifications">;

// ---------------------------------------------------------------------------
// Enum types (derived from the row types for convenience)
// ---------------------------------------------------------------------------

export type DisputeStatus = Dispute["status"];
export type DisputeType = Dispute["dispute_type"];
export type SubmissionType = DisputeSubmission["submission_type"];

// ---------------------------------------------------------------------------
// Joined / enriched types used in the UI
// ---------------------------------------------------------------------------

export interface DisputeWithParties extends Dispute {
  initiating_party: {
    display_name: string;
    business_name: string | null;
    email: string;
  } | null;
  responding_party: {
    display_name: string;
    business_name: string | null;
    email: string;
  } | null;
}

export interface SubmissionWithAuthor extends DisputeSubmission {
  author: {
    display_name: string;
    business_name: string | null;
  } | null;
}

export interface EvidenceFileWithMeta extends EvidenceFile {
  uploader: {
    display_name: string;
  } | null;
}

// ---------------------------------------------------------------------------
// Role and filing data
// ---------------------------------------------------------------------------

/** The current user's role within a dispute, or null if not a party */
export type UserRole = "initiating" | "responding" | null;

/** Shape of data collected across the filing wizard steps */
export interface DisputeFilingData {
  dispute_type: DisputeType;
  subject: string;
  description: string;
  amount_disputed?: number;
  responding_party_name: string;
  responding_party_email: string;
  responding_party_business: string;
  includes_dispute_clause: boolean;
}
