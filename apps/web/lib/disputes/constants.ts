/**
 * Constants for the Kestrel dispute resolution system.
 * Labels, file constraints, deadlines, and status transition rules.
 */

export const DISPUTE_TYPE_LABELS: Record<string, string> = {
  payment: "Payment",
  deliverables: "Deliverables",
  service_quality: "Service quality",
  contract_interpretation: "Contract interpretation",
  other: "Other",
};

export const SUBMISSION_TYPE_LABELS: Record<string, string> = {
  initial_claim: "Initial claim",
  response: "Response",
  reply: "Reply",
  evidence_summary: "Evidence summary",
  proposal: "Settlement proposal",
  acceptance: "Proposal accepted",
  rejection: "Proposal rejected",
  withdrawal: "Withdrawal",
};

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  filed: "Filed",
  awaiting_response: "Awaiting response",
  in_progress: "In progress",
  resolved: "Resolved",
  escalated: "Escalated",
  withdrawn: "Withdrawn",
  expired: "Expired",
};

export const ALLOWED_EVIDENCE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
];

export const ALLOWED_EVIDENCE_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
];

/** 25 MB per file */
export const MAX_FILE_SIZE_BYTES = 26214400;

/** 100 MB total evidence per dispute */
export const MAX_TOTAL_EVIDENCE_BYTES = 104857600;

/** Maximum number of evidence files per dispute */
export const MAX_EVIDENCE_FILES = 10;

/** Days the responding party has to respond after filing */
export const RESPONSE_DEADLINE_DAYS = 14;

/**
 * Maps submission types to the dispute status they trigger.
 * Only listed types cause a status transition.
 */
export const STATUS_TRANSITIONS: Record<string, string> = {
  initial_claim: "filed",
  response: "in_progress",
  acceptance: "resolved",
  withdrawal: "withdrawn",
};
