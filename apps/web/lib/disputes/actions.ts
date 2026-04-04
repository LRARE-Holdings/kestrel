"use server";

import { createClient } from "@kestrel/shared/supabase/server";
import { hashContent } from "@/lib/disputes/hash";
import { disputeFilingSchema, submissionSchema, escalationSchema } from "@/lib/disputes/schemas";
import { RESPONSE_DEADLINE_DAYS, STATUS_TRANSITIONS } from "@/lib/disputes/constants";
import { sendDisputeEmail } from "@kestrel/shared/email/send";
import { createServiceClient } from "@kestrel/shared/supabase/service";
import { disputeInitiatedEmail } from "@/lib/email/templates/dispute-initiated";
import { disputeFiledEmail } from "@/lib/email/templates/dispute-filed";
import { submissionReceivedEmail } from "@/lib/email/templates/submission-received";
import { proposalReceivedEmail } from "@/lib/email/templates/proposal-received";
import { proposalResponseEmail } from "@/lib/email/templates/proposal-response";
import { disputeResolvedEmail } from "@/lib/email/templates/dispute-resolved";
import { disputeEscalatedEmail } from "@/lib/email/templates/dispute-escalated";
import { disputeWithdrawnEmail } from "@/lib/email/templates/dispute-withdrawn";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@kestrel/shared/supabase/types";
import type {
  DisputeWithParties,
  SubmissionWithAuthor,
  EvidenceFileWithMeta,
  UserRole,
  DisputeFilingData,
} from "@/lib/disputes/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAuthenticatedUser(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

function getUserRole(
  dispute: {
    initiating_party_id: string;
    responding_party_id: string | null;
    responding_party_email?: string;
  },
  userId: string,
  userEmail?: string | null,
): UserRole {
  if (dispute.initiating_party_id === userId) return "initiating";
  if (dispute.responding_party_id === userId) return "responding";
  // Fallback: match by email when responding_party_id hasn't been set yet
  if (
    !dispute.responding_party_id &&
    userEmail &&
    dispute.responding_party_email &&
    dispute.responding_party_email.toLowerCase() === userEmail.toLowerCase()
  ) {
    return "responding";
  }
  return null;
}

async function logAudit(
  supabase: SupabaseClient<Database>,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, Json | undefined>,
) {
  await supabase.from("audit_log").insert({
    actor_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    metadata: (metadata as Json) ?? null,
  });
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Get all disputes where the current user is either the initiating or
 * responding party, ordered by most recently updated.
 */
export async function getDisputes() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("disputes")
    .select("*")
    .is("deleted_at", null)
    .or(
      `initiating_party_id.eq.${user.id},responding_party_id.eq.${user.id},and(responding_party_id.is.null,responding_party_email.ilike.${user.email})`,
    )
    .order("updated_at", { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

/**
 * Get a single dispute by ID with joined profile data for both parties.
 * Returns null if the dispute does not exist or the user is not a party.
 *
 * If the authenticated user's email matches `responding_party_email` and
 * `responding_party_id` is not yet set, this function auto-claims the
 * respondent slot — linking the dispute to their account permanently.
 */
export async function getDispute(id: string) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { data: null, error: "Not authenticated" };

  const { data: dispute, error } = await supabase
    .from("disputes")
    .select(
      `
      *,
      initiating_party:profiles!disputes_initiating_party_id_fkey(
        display_name,
        business_name,
        email
      )
    `,
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !dispute) {
    return { data: null, error: error?.message ?? "Dispute not found" };
  }

  // Determine the user's role. If they're not yet linked by ID, check email.
  let role = getUserRole(dispute, user.id);

  if (
    !role &&
    !dispute.responding_party_id &&
    user.email &&
    dispute.responding_party_email.toLowerCase() === user.email.toLowerCase()
  ) {
    // Auto-claim: link this user as the responding party
    const { error: claimError } = await supabase
      .from("disputes")
      .update({
        responding_party_id: user.id,
        status: dispute.status === "filed" ? "awaiting_response" : dispute.status,
      })
      .eq("id", dispute.id)
      .is("responding_party_id", null); // Guard against race conditions

    if (!claimError) {
      dispute.responding_party_id = user.id;
      if (dispute.status === "filed") {
        dispute.status = "awaiting_response";
      }
      role = "responding";

      await logAudit(supabase, user.id, "dispute.respondent_claimed", "dispute", dispute.id, {
        email: user.email,
      });
    }
  }

  if (!role) {
    return { data: null, error: "Not authorised to view this dispute" };
  }

  // Fetch the responding party profile separately (may be null if they
  // haven't signed up yet)
  let respondingParty: DisputeWithParties["responding_party"] = null;
  if (dispute.responding_party_id) {
    const { data: respProfile } = await supabase
      .from("profiles")
      .select("display_name, business_name, email")
      .eq("id", dispute.responding_party_id)
      .single();
    respondingParty = respProfile ?? null;
  }

  const enriched: DisputeWithParties = {
    ...dispute,
    initiating_party: dispute.initiating_party as DisputeWithParties["initiating_party"],
    responding_party: respondingParty,
  };

  return { data: enriched, role, error: null };
}

/**
 * Get all submissions for a dispute, ordered chronologically.
 * Verifies the current user is a party before returning data.
 */
export async function getSubmissions(disputeId: string) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { data: null, error: "Not authenticated" };

  // Verify user is a party
  const { data: dispute } = await supabase
    .from("disputes")
    .select("initiating_party_id, responding_party_id, responding_party_email")
    .eq("id", disputeId)
    .is("deleted_at", null)
    .single();

  if (!dispute || !getUserRole(dispute, user.id, user.email)) {
    return { data: null, error: "Not authorised" };
  }

  const { data, error } = await supabase
    .from("dispute_submissions")
    .select(
      `
      *,
      author:profiles!dispute_submissions_submitted_by_fkey(
        display_name,
        business_name
      )
    `,
    )
    .eq("dispute_id", disputeId)
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };

  const submissions = (data ?? []).map((row) => ({
    ...row,
    author: row.author as SubmissionWithAuthor["author"],
  }));

  return { data: submissions, error: null };
}

/**
 * Get all evidence files for a dispute, ordered chronologically.
 * Verifies the current user is a party before returning data.
 */
export async function getEvidenceFiles(disputeId: string) {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { data: null, error: "Not authenticated" };

  // Verify user is a party
  const { data: dispute } = await supabase
    .from("disputes")
    .select("initiating_party_id, responding_party_id, responding_party_email")
    .eq("id", disputeId)
    .is("deleted_at", null)
    .single();

  if (!dispute || !getUserRole(dispute, user.id, user.email)) {
    return { data: null, error: "Not authorised" };
  }

  const { data, error } = await supabase
    .from("evidence_files")
    .select(
      `
      *,
      uploader:profiles!evidence_files_uploaded_by_fkey(
        display_name
      )
    `,
    )
    .eq("dispute_id", disputeId)
    .order("created_at", { ascending: true });

  if (error) return { data: null, error: error.message };

  const files = (data ?? []).map((row) => ({
    ...row,
    uploader: row.uploader as EvidenceFileWithMeta["uploader"],
  }));

  return { data: files, error: null };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * File a new dispute. Creates the dispute row, the initial claim submission,
 * a notification record, and an audit log entry.
 */
export async function fileDispute(
  input: DisputeFilingData,
): Promise<{ disputeId: string } | { error: string }> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { error: "Not authenticated" };

  // Server-side validation
  const parsed = disputeFilingSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Validation failed" };
  }

  const data = parsed.data;

  // Calculate the response deadline
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + RESPONSE_DEADLINE_DAYS);

  // Insert the dispute
  const { data: dispute, error: disputeError } = await supabase
    .from("disputes")
    .insert({
      dispute_type: data.dispute_type,
      subject: data.subject,
      description: data.description,
      amount_disputed: data.amount_disputed ?? null,
      responding_party_email: data.responding_party_email,
      initiating_party_id: user.id,
      created_by: user.id,
      status: "filed",
      includes_dispute_clause: data.includes_dispute_clause,
      response_deadline: deadline.toISOString(),
    })
    .select("id, reference_number")
    .single();

  if (disputeError || !dispute) {
    return { error: disputeError?.message ?? "Failed to create dispute" };
  }

  // Hash the description for integrity verification
  const contentHash = await hashContent(data.description);

  // Insert the initial claim submission
  const { error: submissionError } = await supabase
    .from("dispute_submissions")
    .insert({
      dispute_id: dispute.id,
      submission_type: "initial_claim",
      submitted_by: user.id,
      content: data.description,
      content_hash: contentHash,
    });

  if (submissionError) {
    // The dispute was created but the submission failed -- log it
    await logAudit(supabase, user.id, "dispute.submission_failed", "dispute", dispute.id, {
      reason: submissionError.message,
    });
    return { error: "Dispute created but initial submission failed. Please contact support." };
  }

  // Audit log
  await logAudit(supabase, user.id, "dispute.filed", "dispute", dispute.id, {
    dispute_type: data.dispute_type,
    responding_party_email: data.responding_party_email,
  });

  // ----- Send notification emails (fire-and-forget, never block filing) -----

  // Fetch the initiator's profile for their name/business
  const { data: initiatorProfile } = await supabase
    .from("profiles")
    .select("display_name, business_name, email")
    .eq("id", user.id)
    .single();

  const initiatorName = initiatorProfile?.display_name ?? "A Kestrel user";
  const initiatorBusiness = initiatorProfile?.business_name ?? "";
  const initiatorEmail = initiatorProfile?.email ?? user.email ?? "";

  const formattedAmount = data.amount_disputed
    ? `£${data.amount_disputed.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : undefined;

  const formattedDeadline = deadline.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Email to the initiator (confirmation)
  const initiatorEmail_ = disputeInitiatedEmail({
    initiatorName,
    respondentName: data.responding_party_name,
    respondentBusiness: data.responding_party_business,
    referenceNumber: dispute.reference_number,
    subject: data.subject,
    disputeType: data.dispute_type,
    amount: formattedAmount,
    responseDeadline: formattedDeadline,
  });

  // Check if the respondent already has a Kestrel account
  const { data: existingRespondent } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", data.responding_party_email)
    .maybeSingle();

  // Email to the respondent (notification)
  const respondentEmail = disputeFiledEmail({
    respondentName: data.responding_party_name,
    respondentBusiness: data.responding_party_business,
    initiatorName,
    initiatorBusiness,
    referenceNumber: dispute.reference_number,
    disputeId: dispute.id,
    subject: data.subject,
    disputeType: data.dispute_type,
    amount: formattedAmount,
    responseDeadline: formattedDeadline,
    respondentIsExistingUser: !!existingRespondent,
  });

  // Send both emails in parallel. Neither should block the filing response.
  await Promise.allSettled([
    sendDisputeEmail({
      to: initiatorEmail,
      subject: initiatorEmail_.subject,
      html: initiatorEmail_.html,
      userId: user.id,
      disputeId: dispute.id,
      notificationType: "dispute_filed_confirmation",
      notificationTitle: "Dispute filed",
      notificationBody: `Your dispute (${dispute.reference_number}) has been filed regarding: ${data.subject}`,
    }),
    sendDisputeEmail({
      to: data.responding_party_email,
      subject: respondentEmail.subject,
      html: respondentEmail.html,
      userId: user.id, // placeholder — re-targeted when respondent creates account
      disputeId: dispute.id,
      notificationType: "dispute_filed",
      notificationTitle: "New dispute received",
      notificationBody: `${initiatorName} of ${initiatorBusiness} has filed a dispute regarding: ${data.subject}`,
    }),
  ]);

  return { disputeId: dispute.id };
}

/**
 * Add a submission to an existing dispute. Validates the submission type
 * is allowed given the current dispute status and the user's role, applies
 * status transitions, and creates an audit trail.
 */
export async function addSubmission(input: {
  dispute_id: string;
  submission_type: string;
  content: string;
  metadata?: Record<string, unknown>;
}): Promise<{ submissionId: string } | { error: string }> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { error: "Not authenticated" };

  // Validate input shape
  const parsed = submissionSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Validation failed" };
  }

  const { dispute_id, submission_type, content, metadata } = parsed.data;

  // Fetch the dispute
  const { data: dispute, error: disputeError } = await supabase
    .from("disputes")
    .select("*")
    .eq("id", dispute_id)
    .is("deleted_at", null)
    .single();

  if (disputeError || !dispute) {
    return { error: "Dispute not found" };
  }

  const role = getUserRole(dispute, user.id, user.email);
  if (!role) {
    return { error: "Not authorised to submit to this dispute" };
  }

  // ----- Submission type validation -----
  const validationError = validateSubmissionType(
    submission_type,
    dispute.status,
    role,
    dispute,
    user.id,
    metadata,
  );
  if (validationError) return { error: validationError };

  // For acceptance/rejection, verify the referenced proposal exists and
  // belongs to the OTHER party
  if (submission_type === "acceptance" || submission_type === "rejection") {
    const proposalId = metadata?.proposal_submission_id as string | undefined;
    if (!proposalId) {
      return { error: "A proposal_submission_id is required in metadata" };
    }

    const { data: proposal } = await supabase
      .from("dispute_submissions")
      .select("submitted_by, submission_type")
      .eq("id", proposalId)
      .eq("dispute_id", dispute_id)
      .single();

    if (!proposal || proposal.submission_type !== "proposal") {
      return { error: "Referenced proposal not found" };
    }
    if (proposal.submitted_by === user.id) {
      return { error: "You cannot accept or reject your own proposal" };
    }
  }

  // Hash the content
  const contentHash = await hashContent(content);

  // Insert the submission
  const { data: submission, error: insertError } = await supabase
    .from("dispute_submissions")
    .insert({
      dispute_id,
      submission_type: submission_type as Database["public"]["Enums"]["submission_type"],
      submitted_by: user.id,
      content,
      content_hash: contentHash,
      metadata: metadata ?? null,
    })
    .select("id")
    .single();

  if (insertError || !submission) {
    return { error: insertError?.message ?? "Failed to create submission" };
  }

  // If this is a 'response' and the responding_party_id is not yet set,
  // claim this dispute as the responding party
  if (submission_type === "response" && !dispute.responding_party_id) {
    await supabase
      .from("disputes")
      .update({ responding_party_id: user.id })
      .eq("id", dispute_id);
  }

  // Apply status transition if applicable
  const newStatus = STATUS_TRANSITIONS[submission_type];
  if (newStatus) {
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
    };
    if (newStatus === "resolved") {
      updatePayload.resolved_at = new Date().toISOString();
    }
    await supabase.from("disputes").update(updatePayload).eq("id", dispute_id);
  }

  // Audit log
  await logAudit(supabase, user.id, "dispute.submission_added", "dispute_submission", submission.id, {
    dispute_id,
    submission_type,
  });

  // ----- Notify both parties (fire-and-forget, never block submission) -----
  notifyPartiesOfSubmission({
    dispute,
    submitterId: user.id,
    submissionType: submission_type,
    newStatus: newStatus,
    metadata,
  }).catch((err) => {
    console.error("[addSubmission] Notification error (non-blocking):", err);
  });

  return { submissionId: submission.id };
}

// ---------------------------------------------------------------------------
// Submission notification helper
// ---------------------------------------------------------------------------

/**
 * Send email notifications when a submission is added to a dispute.
 * The OTHER party always receives a notification. When a dispute is resolved
 * (via acceptance), BOTH parties are notified.
 *
 * Uses a service client to bypass RLS for profile lookups, since the
 * submitter's scoped client may not be able to read the other party's profile.
 *
 * This function never throws — errors are logged and swallowed so that
 * submission creation is never blocked by notification failures.
 */
async function notifyPartiesOfSubmission(params: {
  dispute: Database["public"]["Tables"]["disputes"]["Row"];
  submitterId: string;
  submissionType: string;
  newStatus: string | undefined;
  metadata?: Record<string, unknown>;
}) {
  const { dispute, submitterId, submissionType, newStatus, metadata } = params;
  const serviceClient = createServiceClient();

  // Determine the two party IDs
  const initiatorId = dispute.initiating_party_id;
  const respondentId = dispute.responding_party_id;
  const isSubmitterInitiator = submitterId === initiatorId;
  const otherPartyId = isSubmitterInitiator ? respondentId : initiatorId;

  // Fetch profiles for both parties in parallel
  const [submitterProfile, otherProfile] = await Promise.all([
    serviceClient
      .from("profiles")
      .select("display_name, business_name, email")
      .eq("id", submitterId)
      .single()
      .then(({ data }) => data),
    otherPartyId
      ? serviceClient
          .from("profiles")
          .select("display_name, business_name, email")
          .eq("id", otherPartyId)
          .single()
          .then(({ data }) => data)
      : null,
  ]);

  const submitterName = submitterProfile?.display_name ?? "A Kestrel user";

  // If the other party hasn't linked their account yet, use the dispute's
  // responding_party_email (only possible when they're the respondent)
  const otherPartyEmail =
    otherProfile?.email ??
    (!isSubmitterInitiator ? null : dispute.responding_party_email);
  const otherPartyName =
    otherProfile?.display_name ?? "the other party";

  if (!otherPartyEmail && submissionType !== "acceptance") {
    // Can't notify — other party has no email on file yet
    console.warn(
      `[notify] Cannot notify other party for dispute ${dispute.id}: no email`,
    );
    return;
  }

  const emails: Promise<{ success: boolean; error?: string }>[] = [];

  // --- Resolved: notify BOTH parties ---
  if (newStatus === "resolved") {
    const recipientList = [
      { id: initiatorId, profile: isSubmitterInitiator ? submitterProfile : otherProfile, email: isSubmitterInitiator ? submitterProfile?.email : otherPartyEmail },
      { id: respondentId, profile: isSubmitterInitiator ? otherProfile : submitterProfile, email: isSubmitterInitiator ? otherPartyEmail : submitterProfile?.email },
    ];

    for (const recipient of recipientList) {
      if (!recipient.id || !recipient.email) continue;
      const resolvedEmail = disputeResolvedEmail({
        recipientName: recipient.profile?.display_name ?? "Kestrel user",
        referenceNumber: dispute.reference_number,
        disputeId: dispute.id,
      });

      emails.push(
        sendDisputeEmail({
          to: recipient.email,
          subject: resolvedEmail.subject,
          html: resolvedEmail.html,
          userId: recipient.id,
          disputeId: dispute.id,
          notificationType: "dispute_resolved",
          notificationTitle: "Dispute resolved",
          notificationBody: `Dispute ${dispute.reference_number} has been resolved.`,
        }),
      );
    }

    await Promise.allSettled(emails);
    return;
  }

  // --- All other submissions: notify the OTHER party only ---
  if (!otherPartyEmail || !otherPartyId) return;

  let emailResult: { subject: string; html: string };
  let notificationType: string;
  let notificationTitle: string;
  let notificationBody: string;

  if (submissionType === "proposal") {
    // Dedicated proposal template
    emailResult = proposalReceivedEmail({
      recipientName: otherPartyName,
      proposerName: submitterName,
      referenceNumber: dispute.reference_number,
      disputeId: dispute.id,
    });
    notificationType = "proposal_received";
    notificationTitle = "Settlement proposal received";
    notificationBody = `${submitterName} has submitted a settlement proposal on ${dispute.reference_number}.`;
  } else if (submissionType === "rejection") {
    // Proposal was rejected — notify the original proposer
    emailResult = proposalResponseEmail({
      recipientName: otherPartyName,
      responderName: submitterName,
      referenceNumber: dispute.reference_number,
      disputeId: dispute.id,
      accepted: false,
    });
    notificationType = "proposal_rejected";
    notificationTitle = "Proposal declined";
    notificationBody = `${submitterName} has declined your settlement proposal on ${dispute.reference_number}.`;
  } else {
    // Generic submission notification (response, reply, evidence_summary, withdrawal)
    emailResult = submissionReceivedEmail({
      recipientName: otherPartyName,
      submitterName,
      referenceNumber: dispute.reference_number,
      disputeId: dispute.id,
      submissionType,
    });
    notificationType = "new_submission";
    notificationTitle = "New submission received";
    notificationBody = `${submitterName} has submitted a ${submissionType.replace(/_/g, " ")} on ${dispute.reference_number}.`;
  }

  await sendDisputeEmail({
    to: otherPartyEmail,
    subject: emailResult.subject,
    html: emailResult.html,
    userId: otherPartyId,
    disputeId: dispute.id,
    notificationType,
    notificationTitle,
    notificationBody,
  });
}

/**
 * Generate a time-limited signed download URL for an evidence file.
 * Validates the requesting user is a party to the dispute.
 */
export async function getSignedUrl(
  fileId: string,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { error: "Not authenticated" };

  // Fetch the evidence file record
  const { data: file, error: fileError } = await supabase
    .from("evidence_files")
    .select("storage_path, dispute_id")
    .eq("id", fileId)
    .single();

  if (fileError || !file) {
    return { error: "File not found" };
  }

  // Verify user is a party to the dispute
  const { data: dispute } = await supabase
    .from("disputes")
    .select("initiating_party_id, responding_party_id, responding_party_email")
    .eq("id", file.dispute_id)
    .is("deleted_at", null)
    .single();

  if (!dispute || !getUserRole(dispute, user.id, user.email)) {
    return { error: "Not authorised to access this file" };
  }

  // Generate a signed URL (1 hour expiry)
  const { data: signedData, error: signError } = await supabase.storage
    .from("dispute-evidence")
    .createSignedUrl(file.storage_path, 3600);

  if (signError || !signedData) {
    return { error: signError?.message ?? "Failed to generate download URL" };
  }

  return { url: signedData.signedUrl };
}

/**
 * Withdraw a dispute. Only the initiating party can withdraw, and only
 * while the dispute is in an active status.
 */
export async function withdrawDispute(
  disputeId: string,
  reason: string,
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { error: "Not authenticated" };

  if (!reason || reason.trim().length === 0) {
    return { error: "A reason for withdrawal is required" };
  }

  const { data: dispute, error: fetchError } = await supabase
    .from("disputes")
    .select("*")
    .eq("id", disputeId)
    .is("deleted_at", null)
    .single();

  if (fetchError || !dispute) {
    return { error: "Dispute not found" };
  }

  // Only the initiating party can withdraw
  if (dispute.initiating_party_id !== user.id) {
    return { error: "Only the initiating party can withdraw a dispute" };
  }

  // Only active statuses can be withdrawn
  const withdrawableStatuses = ["filed", "awaiting_response", "in_progress"];
  if (!withdrawableStatuses.includes(dispute.status)) {
    return { error: `Cannot withdraw a dispute with status "${dispute.status}"` };
  }

  // Create the withdrawal submission
  const contentHash = await hashContent(reason);

  const { error: submissionError } = await supabase
    .from("dispute_submissions")
    .insert({
      dispute_id: disputeId,
      submission_type: "withdrawal",
      submitted_by: user.id,
      content: reason,
      content_hash: contentHash,
    });

  if (submissionError) {
    return { error: submissionError.message };
  }

  // Update dispute status
  const { error: updateError } = await supabase
    .from("disputes")
    .update({ status: "withdrawn" })
    .eq("id", disputeId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Audit log
  await logAudit(supabase, user.id, "dispute.withdrawn", "dispute", disputeId, {
    reason,
  });

  // ----- Notify the responding party (fire-and-forget) -----
  notifyRespondentOfWithdrawal({
    dispute,
    initiatorId: user.id,
  }).catch((err) => {
    console.error("[withdrawDispute] Notification error (non-blocking):", err);
  });

  return { success: true };
}

/**
 * Send withdrawal notification email to the responding party.
 * Uses a service client to bypass RLS for profile lookups.
 */
async function notifyRespondentOfWithdrawal(params: {
  dispute: Database["public"]["Tables"]["disputes"]["Row"];
  initiatorId: string;
}) {
  const { dispute, initiatorId } = params;
  const serviceClient = createServiceClient();

  const respondentId = dispute.responding_party_id;

  // Fetch profiles in parallel
  const [initiatorProfile, respondentProfile] = await Promise.all([
    serviceClient
      .from("profiles")
      .select("display_name, business_name, email")
      .eq("id", initiatorId)
      .single()
      .then(({ data }) => data),
    respondentId
      ? serviceClient
          .from("profiles")
          .select("display_name, email")
          .eq("id", respondentId)
          .single()
          .then(({ data }) => data)
      : null,
  ]);

  const respondentEmail =
    respondentProfile?.email ?? dispute.responding_party_email;

  if (!respondentEmail) {
    console.warn(
      `[notify] Cannot notify respondent of withdrawal for dispute ${dispute.id}: no email`,
    );
    return;
  }

  const email = disputeWithdrawnEmail({
    recipientName: respondentProfile?.display_name ?? "there",
    initiatorName: initiatorProfile?.display_name ?? "A Kestrel user",
    initiatorBusiness: initiatorProfile?.business_name ?? "",
    referenceNumber: dispute.reference_number,
    disputeId: dispute.id,
  });

  await sendDisputeEmail({
    to: respondentEmail,
    subject: email.subject,
    html: email.html,
    userId: respondentId ?? initiatorId,
    disputeId: dispute.id,
    notificationType: "dispute_withdrawn",
    notificationTitle: "Dispute withdrawn",
    notificationBody: `Dispute ${dispute.reference_number} has been withdrawn.`,
  });
}

// ---------------------------------------------------------------------------
// Escalation
// ---------------------------------------------------------------------------

/**
 * Escalate a dispute. Either party can escalate when the dispute is in_progress.
 * Creates an immutable escalation submission, updates the dispute status to
 * 'escalated', records the reason, and notifies both parties.
 *
 * Since there is no mediator marketplace yet, escalation is a terminal state
 * that advises both parties to seek external mediation or legal advice.
 */
export async function escalateDispute(
  input: { dispute_id: string; reason: string },
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { error: "Not authenticated" };

  // Server-side validation
  const parsed = escalationSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Validation failed" };
  }

  const { dispute_id, reason } = parsed.data;

  // Fetch the dispute
  const { data: dispute, error: fetchError } = await supabase
    .from("disputes")
    .select("*")
    .eq("id", dispute_id)
    .is("deleted_at", null)
    .single();

  if (fetchError || !dispute) {
    return { error: "Dispute not found" };
  }

  // Verify user is a party
  const role = getUserRole(dispute, user.id, user.email);
  if (!role) {
    return { error: "Not authorised to escalate this dispute" };
  }

  // Only in_progress disputes can be escalated
  if (dispute.status !== "in_progress") {
    return { error: "Only disputes that are in progress can be escalated" };
  }

  // Create the escalation submission (immutable audit trail)
  const contentHash = await hashContent(reason);

  const { error: submissionError } = await supabase
    .from("dispute_submissions")
    .insert({
      dispute_id,
      submission_type: "escalation",
      submitted_by: user.id,
      content: reason,
      content_hash: contentHash,
    });

  if (submissionError) {
    return { error: submissionError.message };
  }

  // Update dispute status to escalated
  const { error: updateError } = await supabase
    .from("disputes")
    .update({
      status: "escalated",
      escalated_at: new Date().toISOString(),
      escalation_reason: reason,
    })
    .eq("id", dispute_id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Audit log
  await logAudit(supabase, user.id, "dispute.escalated", "dispute", dispute_id, {
    reason,
    escalated_by_role: role,
  });

  // ----- Notify BOTH parties (fire-and-forget) -----
  notifyPartiesOfEscalation({
    dispute,
    escalatorId: user.id,
    reason,
  }).catch((err) => {
    console.error("[escalateDispute] Notification error (non-blocking):", err);
  });

  return { success: true };
}

/**
 * Send escalation notification emails to both parties.
 * Uses a service client to bypass RLS for profile lookups.
 */
async function notifyPartiesOfEscalation(params: {
  dispute: Database["public"]["Tables"]["disputes"]["Row"];
  escalatorId: string;
  reason: string;
}) {
  const { dispute, escalatorId, reason } = params;
  const serviceClient = createServiceClient();

  const initiatorId = dispute.initiating_party_id;
  const respondentId = dispute.responding_party_id;

  // Fetch both profiles in parallel
  const [initiatorProfile, respondentProfile] = await Promise.all([
    serviceClient
      .from("profiles")
      .select("display_name, business_name, email")
      .eq("id", initiatorId)
      .single()
      .then(({ data }) => data),
    respondentId
      ? serviceClient
          .from("profiles")
          .select("display_name, business_name, email")
          .eq("id", respondentId)
          .single()
          .then(({ data }) => data)
      : null,
  ]);

  const escalatorName =
    escalatorId === initiatorId
      ? initiatorProfile?.display_name ?? "A Kestrel user"
      : respondentProfile?.display_name ?? "A Kestrel user";

  const recipients = [
    { id: initiatorId, profile: initiatorProfile },
    { id: respondentId, profile: respondentProfile },
  ];

  const emails: Promise<{ success: boolean; error?: string }>[] = [];

  for (const recipient of recipients) {
    if (!recipient.id || !recipient.profile?.email) continue;

    const emailResult = disputeEscalatedEmail({
      recipientName: recipient.profile.display_name ?? "Kestrel user",
      escalatorName,
      referenceNumber: dispute.reference_number,
      disputeId: dispute.id,
      reason,
    });

    emails.push(
      sendDisputeEmail({
        to: recipient.profile.email,
        subject: emailResult.subject,
        html: emailResult.html,
        userId: recipient.id,
        disputeId: dispute.id,
        notificationType: "dispute_escalated",
        notificationTitle: "Dispute escalated",
        notificationBody: `Dispute ${dispute.reference_number} has been escalated by ${escalatorName}.`,
      }),
    );
  }

  await Promise.allSettled(emails);
}

// ---------------------------------------------------------------------------
// Evidence upload
// ---------------------------------------------------------------------------

/**
 * Upload one or more evidence files for a dispute. Uploads each file to
 * Supabase Storage and creates a corresponding `evidence_files` record.
 * Returns the number of files successfully uploaded.
 */
export async function uploadEvidence(
  disputeId: string,
  formData: FormData,
): Promise<{ count: number } | { error: string }> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { error: "Not authenticated" };

  // Verify dispute exists and user is a party
  const { data: dispute } = await supabase
    .from("disputes")
    .select("id, initiating_party_id, responding_party_id, responding_party_email, deleted_at")
    .eq("id", disputeId)
    .is("deleted_at", null)
    .single();

  if (!dispute) return { error: "Dispute not found" };

  const role = getUserRole(dispute, user.id, user.email ?? undefined);
  if (!role) return { error: "Not authorised to upload evidence for this dispute" };

  // Extract files from FormData
  const entries = formData.getAll("files") as File[];
  const descriptions = formData.getAll("descriptions") as string[];

  if (!entries.length) return { error: "No files provided" };

  let uploaded = 0;

  for (let i = 0; i < entries.length; i++) {
    const file = entries[i];
    if (!(file instanceof File) || file.size === 0) continue;

    // Build a storage path: {disputeId}/{uniqueId}_{sanitisedName}
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${disputeId}/${crypto.randomUUID()}_${safeName}`;

    // Upload to storage
    const { error: storageError } = await supabase.storage
      .from("dispute-evidence")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      console.error(`Storage upload failed for ${file.name}:`, storageError.message);
      continue;
    }

    // Insert evidence_files record
    const { error: insertError } = await supabase.from("evidence_files").insert({
      dispute_id: disputeId,
      uploaded_by: user.id,
      file_name: file.name,
      file_type: file.type,
      file_size_bytes: file.size,
      storage_path: storagePath,
      description: descriptions[i] || null,
    });

    if (insertError) {
      console.error(`Evidence record insert failed for ${file.name}:`, insertError.message);
      // Clean up the orphaned storage object
      await supabase.storage.from("dispute-evidence").remove([storagePath]);
      continue;
    }

    uploaded++;
  }

  if (uploaded === 0) {
    return { error: "Failed to upload files. Please try again." };
  }

  await logAudit(supabase, user.id, "evidence.uploaded", "dispute", disputeId, {
    file_count: uploaded,
  });

  return { count: uploaded };
}

// ---------------------------------------------------------------------------
// Bulk evidence download
// ---------------------------------------------------------------------------

/**
 * Generate signed download URLs for all evidence files in a dispute, grouped
 * by which party uploaded them. Used by the "Download All" feature to build
 * a zip client-side.
 */
export async function getAllEvidenceUrls(
  disputeId: string,
): Promise<
  | {
      files: Array<{
        url: string;
        fileName: string;
        party: "initiating" | "responding" | "unknown";
      }>;
    }
  | { error: string }
> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);
  if (!user) return { error: "Not authenticated" };

  // Fetch dispute to verify access and get party IDs
  const { data: dispute } = await supabase
    .from("disputes")
    .select("initiating_party_id, responding_party_id, responding_party_email")
    .eq("id", disputeId)
    .is("deleted_at", null)
    .single();

  if (!dispute || !getUserRole(dispute, user.id, user.email)) {
    return { error: "Not authorised" };
  }

  // Fetch all evidence file records
  const { data: evidenceFiles, error: fetchError } = await supabase
    .from("evidence_files")
    .select("id, storage_path, file_name, uploaded_by")
    .eq("dispute_id", disputeId)
    .order("created_at", { ascending: true });

  if (fetchError || !evidenceFiles?.length) {
    return { error: fetchError?.message ?? "No evidence files found" };
  }

  // Generate signed URLs for each file and tag by party
  const files: Array<{
    url: string;
    fileName: string;
    party: "initiating" | "responding" | "unknown";
  }> = [];

  for (const ef of evidenceFiles) {
    const { data: signedData, error: signError } = await supabase.storage
      .from("dispute-evidence")
      .createSignedUrl(ef.storage_path, 3600);

    if (signError || !signedData) continue;

    let party: "initiating" | "responding" | "unknown" = "unknown";
    if (ef.uploaded_by === dispute.initiating_party_id) {
      party = "initiating";
    } else if (ef.uploaded_by === dispute.responding_party_id) {
      party = "responding";
    }

    files.push({
      url: signedData.signedUrl,
      fileName: ef.file_name,
      party,
    });
  }

  if (files.length === 0) {
    return { error: "Failed to generate download URLs" };
  }

  return { files };
}

// ---------------------------------------------------------------------------
// Submission type validation logic
// ---------------------------------------------------------------------------

/**
 * Validates whether a submission type is allowed given the current dispute
 * state and user role. Returns an error message string if invalid, or null
 * if the submission is permitted.
 */
function validateSubmissionType(
  submissionType: string,
  status: string,
  role: UserRole,
  dispute: { initiating_party_id: string; responding_party_id: string | null },
  userId: string,
  metadata?: Record<string, unknown>,
): string | null {
  switch (submissionType) {
    case "initial_claim":
      // Only allowed during filing (handled by fileDispute, not addSubmission)
      return "Initial claims can only be created during dispute filing";

    case "response":
      if (role !== "responding" && dispute.responding_party_id !== null) {
        return "Only the responding party can submit a response";
      }
      // If responding_party_id is null, this user is claiming the respondent role,
      // which is allowed if they match the responding party email (checked by RLS).
      // We allow it here; RLS handles the authorisation.
      if (status !== "filed" && status !== "awaiting_response") {
        return "A response can only be submitted when the dispute is filed or awaiting response";
      }
      return null;

    case "reply":
      if (status !== "in_progress") {
        return "Replies can only be submitted when the dispute is in progress";
      }
      return null;

    case "proposal":
      if (status !== "in_progress") {
        return "Proposals can only be submitted when the dispute is in progress";
      }
      return null;

    case "acceptance": {
      if (status !== "in_progress") {
        return "Acceptance can only be submitted when the dispute is in progress";
      }
      if (!metadata?.proposal_submission_id) {
        return "A proposal_submission_id is required to accept a proposal";
      }
      return null;
    }

    case "rejection": {
      if (status !== "in_progress") {
        return "Rejection can only be submitted when the dispute is in progress";
      }
      if (!metadata?.proposal_submission_id) {
        return "A proposal_submission_id is required to reject a proposal";
      }
      return null;
    }

    case "evidence_summary":
      if (status !== "in_progress") {
        return "Evidence summaries can only be submitted when the dispute is in progress";
      }
      return null;

    case "withdrawal":
      if (role !== "initiating") {
        return "Only the initiating party can withdraw a dispute";
      }
      if (!["filed", "awaiting_response", "in_progress"].includes(status)) {
        return "Cannot withdraw a dispute in its current status";
      }
      return null;

    case "escalation":
      if (status !== "in_progress") {
        return "Escalation is only available when the dispute is in progress";
      }
      return null;

    default:
      return `Unknown submission type: ${submissionType}`;
  }
}
