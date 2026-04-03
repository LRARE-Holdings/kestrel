"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  handshakeResponseSchema,
  type HandshakeResponseInput,
} from "@/lib/handshake/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BadgeVariant } from "@/components/ui/badge";

// ── Types ───────────────────────────────────────────────────────────────────

type HandshakeTerm = {
  id: string;
  description: string;
  responsible_party: string;
  deadline: string | null;
  amount: number | null;
  sort_order: number;
};

type HandshakeResponse = {
  id: string;
  response_type: string;
  message: string | null;
  respondent_name: string;
  respondent_email: string;
  created_at: string;
};

type Handshake = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  party_a_name: string;
  party_a_email: string;
  party_a_business: string;
  party_b_name: string;
  party_b_email: string;
  party_b_business: string;
  includes_dispute_clause: boolean;
  confirmed_at: string | null;
  declined_at: string | null;
  created_at: string;
  handshake_terms: HandshakeTerm[];
};

type Props = {
  handshake: Handshake;
  response: HandshakeResponse | null;
  token: string;
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Pending", variant: "warm" },
  confirmed: { label: "Confirmed", variant: "sage" },
  modified: { label: "Changes Suggested", variant: "outline" },
  declined: { label: "Declined", variant: "destructive" },
  expired: { label: "Expired", variant: "outline" },
  draft: { label: "Draft", variant: "outline" },
};

const PARTY_LABELS: Record<string, string> = {
  party_a: "Party A",
  party_b: "Party B",
  both: "Both",
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

// ── Component ───────────────────────────────────────────────────────────────

export function HandshakeView({ handshake, response, token }: Props) {
  const router = useRouter();
  const [selectedAction, setSelectedAction] = useState<
    "confirm" | "modify" | "decline" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const statusConfig = STATUS_CONFIG[handshake.status] ?? {
    label: handshake.status,
    variant: "outline" as BadgeVariant,
  };

  const isPending = handshake.status === "pending";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HandshakeResponseInput>({
    resolver: zodResolver(handshakeResponseSchema),
    defaultValues: {
      responseType: "confirm",
      message: "",
      respondentName: "",
      respondentEmail: "",
    },
  });

  async function onSubmit(data: HandshakeResponseInput) {
    if (!selectedAction) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/handshake/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          responseType: selectedAction,
          message: data.message || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to submit response");
      }

      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Link
        href="/tools"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-kestrel transition-colors"
      >
        &larr; All tools
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-ink">
            {handshake.title}
          </h1>
          {handshake.description && (
            <p className="mt-2 text-text-secondary leading-relaxed">
              {handshake.description}
            </p>
          )}
          <p className="mt-2 text-xs text-text-muted">
            Created {formatDate(handshake.created_at)}
          </p>
        </div>
        <Badge variant={statusConfig.variant} className="self-start px-3 py-1">
          {statusConfig.label}
        </Badge>
      </div>

      {/* Parties */}
      <Card className="mb-6">
        <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Party A
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {handshake.party_a_name}
            </p>
            <p className="text-sm text-text-secondary">
              {handshake.party_a_business}
            </p>
            <p className="text-sm text-text-muted">
              {handshake.party_a_email}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Party B
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {handshake.party_b_name}
            </p>
            <p className="text-sm text-text-secondary">
              {handshake.party_b_business}
            </p>
            <p className="text-sm text-text-muted">
              {handshake.party_b_email}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Key Terms</CardTitle>
          <CardDescription>
            {handshake.handshake_terms.length}{" "}
            {handshake.handshake_terms.length === 1 ? "term" : "terms"} agreed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border-subtle">
          {handshake.handshake_terms.map((term, index) => (
            <div key={term.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-ink">
                    <span className="mr-2 text-text-muted">
                      {index + 1}.
                    </span>
                    {term.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-stone px-2.5 py-0.5 text-xs text-text-secondary">
                      {PARTY_LABELS[term.responsible_party] ??
                        term.responsible_party}
                    </span>
                    {term.deadline && (
                      <span className="inline-flex items-center rounded-full bg-stone px-2.5 py-0.5 text-xs text-text-secondary">
                        Due {formatDate(term.deadline)}
                      </span>
                    )}
                    {term.amount !== null && (
                      <span className="inline-flex items-center rounded-full bg-kestrel/10 px-2.5 py-0.5 text-xs font-medium text-kestrel">
                        {formatCurrency(term.amount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Kestrel dispute clause */}
      {handshake.includes_dispute_clause && (
        <Card className="mb-6 border-kestrel/20 bg-kestrel/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-kestrel/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-kestrel"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-ink">
                  Kestrel Dispute Resolution Clause
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  Both parties agree that, in the event of a disagreement arising
                  from this agreement, they will first attempt to resolve the
                  matter through Kestrel (kestrel.co.uk) before pursuing formal
                  legal proceedings. This clause is intended to encourage
                  efficient, good-faith resolution and does not affect either
                  party&apos;s statutory rights under the laws of England and Wales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing response */}
      {response && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>
              {formatDateTime(response.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  response.response_type === "confirm"
                    ? "sage"
                    : response.response_type === "decline"
                      ? "destructive"
                      : "warm"
                }
              >
                {response.response_type === "confirm"
                  ? "Confirmed"
                  : response.response_type === "decline"
                    ? "Declined"
                    : "Changes Suggested"}
              </Badge>
              <span className="text-sm text-text-secondary">
                by {response.respondent_name}
              </span>
            </div>
            {response.message && (
              <div className="rounded-[var(--radius-md)] border border-border-subtle bg-stone/50 px-4 py-3">
                <p className="text-sm text-text-secondary whitespace-pre-wrap">
                  {response.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Response form (only if pending) */}
      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Respond to this Handshake</CardTitle>
            <CardDescription>
              Review the terms above and choose your response.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Action selector */}
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setSelectedAction("confirm")}
                className={`rounded-[var(--radius-md)] border p-4 text-left transition-colors ${
                  selectedAction === "confirm"
                    ? "border-kestrel bg-kestrel/5"
                    : "border-border-subtle hover:border-border"
                }`}
              >
                <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-sage/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-kestrel"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-ink">Confirm</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  I agree to these terms
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction("modify")}
                className={`rounded-[var(--radius-md)] border p-4 text-left transition-colors ${
                  selectedAction === "modify"
                    ? "border-kestrel bg-kestrel/5"
                    : "border-border-subtle hover:border-border"
                }`}
              >
                <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-warm/30">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-warning"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-ink">
                  Suggest Changes
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  I have amendments
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAction("decline")}
                className={`rounded-[var(--radius-md)] border p-4 text-left transition-colors ${
                  selectedAction === "decline"
                    ? "border-error/50 bg-error/5"
                    : "border-border-subtle hover:border-border"
                }`}
              >
                <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-error/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-error"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-ink">Decline</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  I do not agree
                </p>
              </button>
            </div>

            {/* Response details form */}
            {selectedAction && (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 border-t border-border-subtle pt-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Your name"
                    placeholder="e.g. John Doe"
                    error={errors.respondentName?.message}
                    {...register("respondentName")}
                  />
                  <Input
                    label="Your email"
                    type="email"
                    placeholder="john@doeindustries.co.uk"
                    error={errors.respondentEmail?.message}
                    {...register("respondentEmail")}
                  />
                </div>

                {(selectedAction === "modify" ||
                  selectedAction === "decline") && (
                  <Textarea
                    label={
                      selectedAction === "modify"
                        ? "What changes would you suggest?"
                        : "Reason for declining (optional)"
                    }
                    placeholder={
                      selectedAction === "modify"
                        ? "Describe the changes you would like to make to the terms..."
                        : "Optionally explain why you are declining..."
                    }
                    rows={4}
                    error={errors.message?.message}
                    {...register("message")}
                  />
                )}

                {submitError && (
                  <div className="rounded-[var(--radius-md)] border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
                    {submitError}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  variant={
                    selectedAction === "decline" ? "destructive" : "primary"
                  }
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  {submitting
                    ? "Submitting..."
                    : selectedAction === "confirm"
                      ? "Confirm Agreement"
                      : selectedAction === "modify"
                        ? "Submit Suggestions"
                        : "Decline Agreement"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="mt-8 text-xs leading-relaxed text-text-muted">
        This handshake is a record of agreement between two parties provided for
        informational purposes. It is not a legally binding contract. For formal
        agreements, seek independent legal advice. Kestrel operates under the
        laws of England and Wales.
      </p>
    </>
  );
}
