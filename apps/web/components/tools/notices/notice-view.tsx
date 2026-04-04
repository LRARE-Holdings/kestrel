"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  acknowledgeSchema,
  type AcknowledgeInput,
  NOTICE_TYPES,
} from "@/lib/notices/schemas";
import { KESTREL_DISPUTE_CLAUSE } from "@/lib/notices/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { KESTREL_DOMAIN } from "@kestrel/shared/constants";

interface Notice {
  id: string;
  access_token: string;
  notice_type: string;
  status: string;
  sender_name: string;
  sender_business: string;
  sender_address: string;
  sender_email: string;
  recipient_name: string;
  recipient_business: string;
  recipient_address: string;
  recipient_email: string;
  reference: string | null;
  subject: string;
  content: string;
  relevant_clause: string | null;
  required_action: string | null;
  response_deadline: string | null;
  consequences: string | null;
  includes_dispute_clause: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

const STATUS_BADGE: Record<string, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Draft", variant: "outline" },
  sent: { label: "Sent", variant: "default" },
  acknowledged: { label: "Acknowledged", variant: "sage" },
  disputed: { label: "Disputed", variant: "destructive" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNoticeTypeLabel(type: string): string {
  const found = NOTICE_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
}

export function NoticeView({ notice: initialNotice }: { notice: Notice }) {
  const [notice, setNotice] = useState(initialNotice);
  const [copied, setCopied] = useState(false);
  const [showAcknowledge, setShowAcknowledge] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [ackError, setAckError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcknowledgeInput>({
    resolver: zodResolver(acknowledgeSchema),
  });

  const statusInfo = STATUS_BADGE[notice.status] ?? STATUS_BADGE.sent;

  async function copyToClipboard() {
    const text = buildPlainText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function buildPlainText(): string {
    const lines: string[] = [];
    lines.push(`FORMAL NOTICE - ${getNoticeTypeLabel(notice.notice_type).toUpperCase()}`);
    lines.push("");
    lines.push(`Date: ${formatDate(notice.created_at)}`);
    if (notice.reference) lines.push(`Reference: ${notice.reference}`);
    lines.push("");
    lines.push("FROM:");
    lines.push(notice.sender_name);
    lines.push(notice.sender_business);
    lines.push(notice.sender_address);
    lines.push(notice.sender_email);
    lines.push("");
    lines.push("TO:");
    lines.push(notice.recipient_name);
    lines.push(notice.recipient_business);
    lines.push(notice.recipient_address);
    lines.push(notice.recipient_email);
    lines.push("");
    lines.push(`RE: ${notice.subject}`);
    lines.push("");
    lines.push(notice.content);
    if (notice.relevant_clause) {
      lines.push("");
      lines.push(`Relevant Clause: ${notice.relevant_clause}`);
    }
    if (notice.required_action) {
      lines.push("");
      lines.push(`Required Action: ${notice.required_action}`);
    }
    if (notice.response_deadline) {
      lines.push("");
      lines.push(`Response Deadline: ${formatDate(notice.response_deadline)}`);
    }
    if (notice.consequences) {
      lines.push("");
      lines.push(`Consequences: ${notice.consequences}`);
    }
    if (notice.includes_dispute_clause) {
      lines.push("");
      lines.push("---");
      lines.push("Dispute Resolution:");
      lines.push(KESTREL_DISPUTE_CLAUSE);
    }
    lines.push("");
    lines.push("---");
    lines.push(`Notice created via Kestrel (${KESTREL_DOMAIN}) on ${formatDateTime(notice.created_at)}`);
    return lines.join("\n");
  }

  async function onAcknowledge(data: AcknowledgeInput) {
    setAcknowledging(true);
    setAckError(null);

    try {
      const response = await fetch(`/api/notices/${notice.access_token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to acknowledge notice");
      }

      setNotice({
        ...notice,
        status: "acknowledged",
        acknowledged_at: new Date().toISOString(),
      });
      setShowAcknowledge(false);
    } catch (err) {
      setAckError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAcknowledging(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl text-ink sm:text-3xl">
              {getNoticeTypeLabel(notice.notice_type)}
            </h1>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Created {formatDateTime(notice.created_at)}
          </p>
        </div>
        <Button onClick={copyToClipboard} variant="secondary" size="sm">
          {copied ? "Copied!" : "Copy to clipboard"}
        </Button>
      </div>

      {/* Notice document */}
      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Metadata row */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border-subtle pb-4 text-sm">
            <div>
              <span className="text-text-muted">Date:</span>{" "}
              <span className="font-medium text-ink">
                {formatDate(notice.created_at)}
              </span>
            </div>
            {notice.reference && (
              <div>
                <span className="text-text-muted">Reference:</span>{" "}
                <span className="font-medium text-ink">{notice.reference}</span>
              </div>
            )}
            {notice.response_deadline && (
              <div>
                <span className="text-text-muted">Response deadline:</span>{" "}
                <span className="font-medium text-ink">
                  {formatDate(notice.response_deadline)}
                </span>
              </div>
            )}
          </div>

          {/* Parties */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
                From
              </p>
              <p className="text-sm font-medium text-ink">{notice.sender_name}</p>
              <p className="text-sm text-text-secondary">{notice.sender_business}</p>
              <p className="whitespace-pre-line text-sm text-text-secondary">
                {notice.sender_address}
              </p>
              <p className="text-sm text-text-secondary">{notice.sender_email}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
                To
              </p>
              <p className="text-sm font-medium text-ink">{notice.recipient_name}</p>
              <p className="text-sm text-text-secondary">
                {notice.recipient_business}
              </p>
              <p className="whitespace-pre-line text-sm text-text-secondary">
                {notice.recipient_address}
              </p>
              <p className="text-sm text-text-secondary">{notice.recipient_email}</p>
            </div>
          </div>

          {/* Subject */}
          <div className="border-t border-border-subtle pt-4">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Subject
            </p>
            <p className="mt-1 text-base font-medium text-ink">
              {notice.subject}
            </p>
          </div>

          {/* Body */}
          <div className="border-t border-border-subtle pt-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {notice.content}
            </p>
          </div>

          {/* Additional fields */}
          {notice.relevant_clause && (
            <div className="rounded-[var(--radius-md)] bg-stone/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Relevant Clause
              </p>
              <p className="mt-1 text-sm text-ink">{notice.relevant_clause}</p>
            </div>
          )}

          {notice.required_action && (
            <div className="rounded-[var(--radius-md)] bg-stone/50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                Required Action
              </p>
              <p className="mt-1 text-sm text-ink">{notice.required_action}</p>
            </div>
          )}

          {notice.consequences && (
            <div className="rounded-[var(--radius-md)] border border-warning/20 bg-warning/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-warning">
                Consequences
              </p>
              <p className="mt-1 text-sm text-ink">{notice.consequences}</p>
            </div>
          )}

          {/* Kestrel dispute clause */}
          {notice.includes_dispute_clause && (
            <div className="border-t border-border-subtle pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-kestrel">
                Dispute Resolution
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                {KESTREL_DISPUTE_CLAUSE}
              </p>
            </div>
          )}

          {/* Acknowledgement status */}
          {notice.status === "acknowledged" && notice.acknowledged_at && (
            <div className="rounded-[var(--radius-md)] border border-sage/30 bg-sage/10 p-4">
              <p className="text-sm font-medium text-kestrel">
                Acknowledged on {formatDateTime(notice.acknowledged_at)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acknowledge section */}
      {notice.status === "sent" && (
        <Card>
          <CardContent className="pt-6">
            {!showAcknowledge ? (
              <div className="text-center">
                <p className="text-sm text-text-secondary">
                  If you are the recipient of this notice, you can acknowledge
                  receipt below.
                </p>
                <Button
                  onClick={() => setShowAcknowledge(true)}
                  className="mt-4"
                >
                  Acknowledge receipt
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onAcknowledge)}
                className="space-y-4"
              >
                <p className="text-sm font-medium text-ink">
                  Acknowledge receipt of this notice
                </p>
                <p className="text-xs text-text-muted">
                  Acknowledging receipt confirms you have received and read this
                  notice. It does not constitute acceptance of its contents.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Your name"
                    placeholder="e.g. John Doe"
                    error={errors.acknowledgerName?.message}
                    {...register("acknowledgerName")}
                  />
                  <Input
                    label="Your email"
                    type="email"
                    placeholder="john@example.co.uk"
                    error={errors.acknowledgerEmail?.message}
                    {...register("acknowledgerEmail")}
                  />
                </div>
                {ackError && (
                  <p className="text-sm text-error">{ackError}</p>
                )}
                <div className="flex gap-3">
                  <Button type="submit" disabled={acknowledging}>
                    {acknowledging ? "Acknowledging..." : "Confirm acknowledgement"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAcknowledge(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <p className="text-xs text-text-muted">
        This notice was created using Kestrel ({KESTREL_DOMAIN}). It is a formal
        record and should be treated accordingly. This tool does not constitute
        legal advice.
      </p>
    </div>
  );
}
