# ARCHITECTURE.md — Technical Architecture for Kestrel

> This document records technical decisions and their rationale. Update it when decisions change.

---

## System Overview

Kestrel is a **Next.js application** backed by **Supabase** (PostgreSQL + Auth + Storage). The core product logic — clause assembly and document generation — runs entirely server-side with no external API dependencies. The free tools are designed to work at zero marginal cost per document.

```
┌─────────────────────────────────────────────┐
│                   Client                     │
│  Next.js (React Server Components + Client)  │
└──────────────────┬──────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │   Next.js Server   │
         │                    │
         │  ┌──────────────┐  │
         │  │ Clause Engine │  │  ← Deterministic, no external calls
         │  └──────────────┘  │
         │  ┌──────────────┐  │
         │  │  Generators   │  │  ← Assembles clauses into documents
         │  └──────────────┘  │
         │  ┌──────────────┐  │
         │  │  API Routes   │  │  ← Validated, rate-limited
         │  └──────────────┘  │
         └─────────┬──────────┘
                   │
         ┌─────────┴─────────┐
         │     Supabase       │
         │  ┌──────────────┐  │
         │  │  PostgreSQL   │  │  ← RLS on every table
         │  └──────────────┘  │
         │  ┌──────────────┐  │
         │  │     Auth      │  │  ← Email + magic link
         │  └──────────────┘  │
         │  ┌──────────────┐  │
         │  │   Storage     │  │  ← Generated documents (authenticated only)
         │  └──────────────┘  │
         └────────────────────┘
```

---

## Key Technical Decisions

### ADR-001: Next.js App Router

**Decision:** Use Next.js 14+ with the App Router.

**Rationale:** Server Components reduce client JavaScript (important for tool pages that should load fast). Route groups cleanly separate `(marketing)`, `(tools)`, and `(dashboard)`. Server Actions simplify form handling. Vercel deployment is zero-config.

**Consequences:** Must be deliberate about `'use client'` boundaries. Some third-party libraries may not support Server Components.

---

### ADR-002: Supabase for Backend

**Decision:** Use Supabase for database, auth, and file storage.

**Rationale:** Managed PostgreSQL with built-in RLS, auth, and real-time subscriptions. Eliminates the need for a separate auth service and object storage. Generous free tier for early development. Row Level Security is a first-class feature, which aligns with our "RLS on every table" requirement.

**Consequences:** Vendor dependency on Supabase. Mitigated by the fact that the underlying database is standard PostgreSQL — migration to self-hosted is viable if needed.

---

### ADR-003: Deterministic Clause Engine

**Decision:** Document generation uses a pre-written clause library with conditional logic. No AI/LLM calls at runtime.

**Rationale:** This is a core product decision, not just a technical one. Legal documents must be predictable and auditable. The same inputs must always produce the same output. LLM-generated clauses would introduce variability, latency, cost, and legal risk. Deterministic generation means zero marginal cost per document.

**Consequences:** Adding new clause types requires human authoring and review. The engine is more limited but infinitely more reliable. New clause variants are a content task, not an engineering task.

---

### ADR-004: Anonymous-First Architecture

**Decision:** Free tools work without authentication. Auth adds persistence, not capability.

**Rationale:** Core product decision. The free tools are the distribution wedge — any friction reduces adoption. Authentication is a value-add (save your documents, track your history) not a gate.

**Implementation:**
- Tool pages use Server Components that render without session checks.
- Generation functions accept optional `userId` — when present, results are persisted.
- API routes for generation do not require auth headers.
- Rate limiting is by IP for anonymous users, by user ID for authenticated users.

---

### ADR-005: Zod for Validation

**Decision:** Use Zod for all runtime validation — API inputs, form data, clause parameters.

**Rationale:** TypeScript types are compile-time only. Zod provides runtime validation with automatic TypeScript type inference. A single Zod schema serves as: the runtime validator, the TypeScript type, the source of form validation rules, and the API documentation. This reduces duplication and ensures client and server validation stay in sync.

---

### ADR-006: Self-Hosted Fonts

**Decision:** Self-host Instrument Serif, DM Sans, and JetBrains Mono via `next/font`.

**Rationale:** Avoids Google Fonts dependency, eliminates FOUT/FOIT issues, better privacy (no third-party font requests), and guaranteed availability. `next/font` handles subsetting and optimisation automatically.

---

## Data Flow: Document Generation

```
User fills form → Client validates (Zod) → Server Action / API Route
    → Server validates (Zod, same schema)
    → Clause Engine resolves conditional logic
    → Generator assembles clauses into structured document
    → If authenticated: persist to Supabase (documents table)
    → Return structured output to client
    → Client renders formatted document
    → User can download (PDF/DOCX) or copy
```

**Important:** The Kestrel dispute resolution clause is injected at the Generator stage, controlled by a boolean flag that defaults to `true`. The Frontend provides a toggle. The Generator respects the flag. The Clause Engine doesn't know or care about the flag — it just builds clauses when asked.

---

## Data Flow: Anonymous → Authenticated Transition

When a user generates a document anonymously and then signs up:

1. Document exists only in the client (browser memory / session storage).
2. On sign-up, client sends the document data to a "claim" endpoint.
3. Server validates and persists under the new user's ID.
4. Future visits show the document in their history.

This avoids storing anonymous documents server-side (cost, privacy, cleanup complexity).

---

## Rate Limiting Strategy

| Endpoint Type | Anonymous | Authenticated | Method |
|---------------|-----------|---------------|--------|
| Document generation | 10/hour/IP | 50/hour/user | Sliding window |
| Document download | 20/hour/IP | 100/hour/user | Sliding window |
| Auth endpoints | 5/minute/IP | N/A | Fixed window |
| API reads | 60/minute/IP | 200/minute/user | Sliding window |

Implemented via Vercel Edge Middleware or Upstash Redis.

---

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server-only, never exposed to client

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_ENV=                # development | staging | production

# Rate Limiting (if using Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Analytics (when added)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

**Rules:**
- `NEXT_PUBLIC_` prefix = safe for client exposure.
- `SUPABASE_SERVICE_ROLE_KEY` is **never** in client code. It bypasses RLS.
- No secrets in `.env` files committed to git. Use `.env.local` and deployment env vars.

---

## Deployment

- **Production:** Vercel, deployed from `main` branch.
- **Staging:** Vercel preview deployments on PRs.
- **Database:** Supabase project (separate projects for staging and production).
- **Migrations:** Applied via Supabase CLI in CI/CD pipeline. Never manually in production.

---

## Monitoring & Observability (Phase 1 Minimum)

- **Error tracking:** Sentry (catch unhandled errors, especially in clause generation).
- **Analytics:** PostHog (self-hostable, GDPR-friendly, event-based).
- **Uptime:** Vercel's built-in monitoring + a simple health check endpoint.
- **Database:** Supabase dashboard metrics.

Clause generation failures are **critical alerts** — if the core product is broken, we need to know immediately.

---

## What We're NOT Building Yet

These are future-phase concerns. Do not introduce infrastructure for them now:

- **Real-time features** (dispute chat, live collaboration) — Phase 2
- **Payment processing** (Stripe, escrow) — Phase 3
- **ML/AI analytics** (pattern detection, risk scoring) — Phase 4
- **Multi-jurisdiction support** (i18n, locale-specific law) — Phase 5
- **Native mobile apps** — Not on roadmap; responsive web is sufficient
- **Microservices** — Monolith until there's a genuine reason to split