# Implementation Plan: Full Free Toolkit + BoE Base Rate Auto-Update

## Overview

Build out all 6 free tools (5 from "coming soon" → functional, plus enhance existing Late Payment Toolkit) and implement automatic Bank of England base rate updates.

**Total scope:** ~60 files across lib/, app/, components/, API routes, DB migrations, and a Supabase Edge Function.

---

## Part 1: BoE Base Rate Auto-Update

### Problem
`CURRENT_BASE_RATE = 4.50` is hardcoded in `lib/late-payment/calculator.ts`. Needs to track real BoE rate changes automatically.

### Solution: Supabase table + Edge Function on daily cron

**Step 1 — Database migration: `boe_base_rate` table**
```sql
CREATE TABLE boe_base_rate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate DECIMAL(5,2) NOT NULL,
  effective_date DATE NOT NULL UNIQUE,
  source_url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE boe_base_rate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read rates" ON boe_base_rate FOR SELECT USING (TRUE);
CREATE INDEX idx_boe_rate_effective ON boe_base_rate(effective_date DESC);
```

**Step 2 — Seed current rate** via SQL insert (verified value from BoE).

**Step 3 — Edge Function: `update-boe-rate`**
- Fetches from BoE Statistical Interactive Database (series code `IUDBEDR`)
- CSV endpoint: `https://www.bankofengland.co.uk/boeapps/database/_iadb-fromshowcolumns.asp?csv.x=yes&SeriesCodes=IUDBEDR&CSVF=TN&UsingCodes=Y&VPD=Y&VFD=N`
- Parses CSV, extracts latest rate + effective date
- Upserts into `boe_base_rate`
- Deploy via Supabase MCP `deploy_edge_function`
- Schedule via `pg_cron` extension (daily at 06:00 UTC)

**Step 4 — Server-side rate fetcher: `lib/boe-rate.ts`**
- `getCurrentBaseRate()` — queries `boe_base_rate` table for latest rate
- Fallback to hardcoded `4.50` if DB unavailable
- Used by calculator page (server component passes rate as prop to client form)

**Step 5 — Update calculator page**
- Calculator page becomes a server component wrapper that fetches rate
- Passes `baseRate` and `lastUpdated` as props to a client form component
- Rate displayed in the UI with "Last updated" date from DB

**Step 6 — Update `lib/late-payment/calculator.ts`**
- Keep `CURRENT_BASE_RATE` as fallback constant
- `calculateStatutoryInterest()` already accepts optional `baseRate` param — no change needed
- Letter generator receives rate from caller

---

## Part 2: Shared Infrastructure (Build First)

### 2a. Clause Library — `lib/clauses/`

The backbone for contracts, T&Cs, and notices. Pure functions returning legal text.

```
lib/clauses/
  types.ts                    — ClauseDefinition, ClauseCategory types
  index.ts                    — Registry + resolution functions
  kestrel-dispute.ts          — The shared Kestrel dispute resolution clause
  boilerplate/
    governing-law.ts          — England & Wales governing law
    entire-agreement.ts
    severability.ts
    force-majeure.ts
    confidentiality.ts
    data-protection.ts
    limitation-of-liability.ts
    termination.ts
    amendments.ts
    notices-provision.ts
    assignment.ts
    waiver.ts
  contracts/
    freelancer/               — Scope, payment, IP, warranties
    saas/                     — Licence, SLAs, data processing, subscriptions
    consulting/               — Engagement, deliverables, expenses
    general-service/          — Service description, performance standards
    subcontractor/            — Main contract flow-down, obligations
    nda/                      — Confidential info definition, obligations, exclusions, term
  terms/
    ecommerce/                — Orders, delivery, returns, consumer rights (CRA 2015)
    saas/                     — Account terms, acceptable use, SLAs
    professional-services/    — Engagement basis, scope limitations
  notices/
    breach.ts
    termination.ts
    change-request.ts
    payment-demand.ts
    general.ts
```

Each clause: `(params: Record<string, unknown>) => string` — deterministic, human-authored.

### 2b. Shared Components — `components/tools/`

| Component | Purpose | Used By |
|-----------|---------|---------|
| `document-preview.tsx` | Sticky right-column document preview with section headers | Contracts, T&Cs, Notices |
| `kestrel-clause-toggle.tsx` | Standardised clause toggle card (extracts pattern from letters) | All tools |
| `party-details-form.tsx` | Reusable party details fields (name, business, address, email, co. number) | Contracts, Handshake, Milestones, Notices |
| `multi-step-form.tsx` | Step indicator + next/back for long questionnaires | Contracts, T&Cs |
| `copy-button.tsx` | Copy-to-clipboard with success state | All tools |
| `share-link.tsx` | Shareable URL display with copy | Handshake, Milestones |
| `pdf-download-button.tsx` | Triggers PDF generation + download | All tools |

### 2c. PDF Generation — `lib/pdf/`

Install `@react-pdf/renderer` for server-side React-to-PDF.

```
lib/pdf/
  generator.ts              — Core PDF generation (takes structured document, returns Buffer)
  templates/
    contract.tsx            — PDF template for contracts
    terms.tsx               — PDF template for T&Cs
    notice.tsx              — PDF template for notices
    handshake.tsx           — PDF template for handshakes
    late-payment-letter.tsx — PDF template for late payment letters
  styles.ts                 — Shared PDF styles (Kestrel brand)

app/api/pdf/route.ts        — POST endpoint: accepts document structure, returns PDF blob
```

Alternative: `jspdf` (lighter, no React dependency) or `puppeteer` (heavier, true HTML→PDF). **Recommendation: `@react-pdf/renderer`** — works in Node.js, no headless browser, renders from React components, good TypeScript support.

---

## Part 3: Contract Templates (Tool 1)

### Library
```
lib/contracts/
  schemas.ts        — Zod schemas for all 6 contract types + shared party schema
  assembler.ts      — Resolves clauses, assembles into structured document
  types.ts          — ContractOutput, ContractSection interfaces
```

6 contract types, each with a conditional questionnaire:
1. **Freelancer Service Agreement** — scope, deliverables, payment (fixed/hourly/milestone), IP ownership, term
2. **SaaS Subscription Agreement** — service description, SLAs, data processing, subscription terms
3. **Consulting Engagement Letter** — engagement scope, fees, confidentiality, conflict of interest
4. **General Service Contract** — service description, payment, warranties, liability
5. **Subcontractor Agreement** — scope, payment flow-down, IP, insurance
6. **NDA (Mutual)** — confidential info definition, obligations, duration, exceptions

### Pages
```
app/(tools)/tools/contracts/
  page.tsx                  — Landing: 6 contract type cards (server component)
  freelancer/page.tsx       — Freelancer questionnaire + preview
  saas/page.tsx             — SaaS questionnaire + preview
  consulting/page.tsx       — Consulting questionnaire + preview
  general-service/page.tsx  — General service questionnaire + preview
  subcontractor/page.tsx    — Subcontractor questionnaire + preview
  nda/page.tsx              — NDA questionnaire + preview
```

Each contract page: multi-step form (party details → contract specifics → clause options) with live document preview in right column. Download as PDF.

---

## Part 4: Terms & Conditions Generator (Tool 2)

### Library
```
lib/terms/
  schemas.ts        — Zod schemas for 3 business types
  assembler.ts      — Assembles T&C sections from clause library
  types.ts          — TermsOutput, TermsSection interfaces
```

3 business types:
1. **E-commerce** — orders, delivery, returns (CRA 2015), pricing/VAT
2. **SaaS / Digital Services** — subscriptions, acceptable use, data, SLAs
3. **Professional Services** — engagement terms, payment, liability, IP

### Pages
```
app/(tools)/tools/terms/
  page.tsx                  — Landing: 3 type cards (server component)
  ecommerce/page.tsx
  saas/page.tsx
  professional-services/page.tsx
```

Additional output formats: PDF, Markdown (for website CMS), HTML (for embedding). Per-section copy buttons.

---

## Part 5: Notice Generator (Tool 3)

### Library
```
lib/notices/
  schemas.ts        — Zod schemas per notice type
  generator.ts      — Generates notice text from templates (same pattern as letters.ts)
  types.ts          — NoticeOutput interface
```

5 notice types: Breach of contract, Termination, Change request, Payment demand, General notice.

### Pages
```
app/(tools)/tools/notice-log/
  page.tsx          — Landing: 5 notice type cards + CTA for log (server component)
  create/page.tsx   — Notice generator form (client component)
```

Pattern matches late payment letters exactly: form → preview → copy/download PDF.

---

## Part 6: Handshake (Tool 4) — Requires DB

### Database migration
New `handshake_status` enum + `handshakes` table with RLS. Uses `short_code` for capability URLs (8-char alphanumeric). Anonymous creation and confirmation via service role client. Authenticated users get handshakes linked to their profile.

### Library
```
lib/handshake/
  schemas.ts        — Zod schemas for creation + confirmation
  types.ts          — Handshake types
```

### API Routes
```
app/api/handshake/
  route.ts          — POST: create handshake
  [id]/
    route.ts        — GET: fetch by short_code
    confirm/
      route.ts      — POST: confirm (Party B)
    decline/
      route.ts      — POST: decline (Party B)
```

### Pages
```
app/(tools)/tools/handshake/
  page.tsx          — Landing + create CTA (server component)
  create/page.tsx   — Creation form (client component)
  [id]/page.tsx     — View + confirm/decline for Party B (server component shell)
```

### Flow
1. Party A creates handshake (no auth required) → gets shareable URL
2. Party B visits URL → sees terms → confirms or declines (no auth required)
3. Both parties receive confirmation (email via Resend if emails provided)
4. If either party is authenticated, handshake saved to their account

---

## Part 7: Milestone Tracker (Tool 5) — Requires DB

### Database migration
New `milestone_status` enum + `milestone_projects` table + `milestones` table. Same capability-URL pattern as handshakes.

### Library
```
lib/milestones/
  schemas.ts        — Zod schemas for project + milestone creation
  types.ts          — MilestoneProject, Milestone types
```

### API Routes
```
app/api/milestones/
  route.ts                  — POST: create project
  [id]/
    route.ts                — GET: fetch project + milestones
    milestones/
      route.ts              — POST: add milestone
      [milestoneId]/
        route.ts            — PATCH: update status
```

### Pages
```
app/(tools)/tools/milestones/
  page.tsx                  — Landing + create CTA (server component)
  create/page.tsx           — Create project + milestones form (client component)
  [id]/page.tsx             — View project: timeline view, milestone cards, status badges
```

### Flow
1. Creator fills form: project details, milestones (title, due date, responsible party, amount)
2. Gets shareable URL
3. Without auth: static snapshot, read-only
4. With auth: live updates, status changes, completion tracking

---

## Build Sequence

### Wave 0: Infrastructure (sequential, ~1 hour)
1. Install `@react-pdf/renderer` (or chosen PDF library)
2. Apply `boe_base_rate` migration via Supabase MCP
3. Seed current BoE rate
4. Deploy edge function for BoE rate updates
5. Build `lib/boe-rate.ts` server function
6. Update calculator page to use dynamic rate
7. Generate TypeScript types

### Wave 1: Shared Components (parallel, ~2 hours)
All shared components built simultaneously:
- Clause library types + Kestrel dispute clause
- Boilerplate clauses (governing law, entire agreement, severability, etc.)
- Shared UI components (document-preview, party-details-form, etc.)
- PDF generation infrastructure

### Wave 2: Client-Side Tools (parallel, ~4 hours)
Built simultaneously — no DB dependencies:
- **Stream A:** Contract clause library + schemas + assembler + 6 pages
- **Stream B:** T&C clause library + schemas + assembler + 3 pages
- **Stream C:** Notice schemas + generator + pages

### Wave 3: Server-Side Tools (sequential DB, then parallel, ~3 hours)
1. Apply handshakes migration
2. Apply milestone_projects + milestones migration
3. Generate TypeScript types
4. **Then parallel:**
   - **Stream D:** Handshake API routes + pages
   - **Stream E:** Milestone Tracker API routes + pages

### Wave 4: PDF Templates + Integration (~2 hours)
- PDF templates for all tool outputs
- Wire up PDF download buttons across all tools
- Add PDF endpoint for late payment letters (upgrade existing tool)

### Wave 5: Polish (~1 hour)
- Update tools landing page (remove "coming soon" badges, add "Live" badges to all)
- Update memory/decisions.md
- Cross-tool internal linking (e.g., contract → late payment toolkit for payment terms)

---

## Database Migrations (4 total, applied via Supabase MCP)

1. `create_boe_base_rate` — rate history table
2. `create_handshakes` — handshake_status enum + handshakes table + RLS + indexes
3. `create_milestone_tables` — milestone_status enum + milestone_projects + milestones tables + RLS + indexes
4. `add_notice_type_enum` — (optional) if we want DB-backed notice log for authenticated users

---

## Dependencies to Install

- `@react-pdf/renderer` — PDF generation from React components
- No other new dependencies needed (react-hook-form, zod, supabase already installed)

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| PDF library | `@react-pdf/renderer` | Server-side, no headless browser, React components, good TS support |
| Clause library | Pure functions in `/lib/clauses/` | Deterministic, testable, human-authored, version-tracked |
| Handshake storage | Supabase + capability URLs | Both parties may be anonymous; short_code grants read access |
| Milestone storage | Same pattern as handshakes | Consistency, proven pattern |
| BoE rate | DB table + edge function cron | Rate history, automatic updates, fallback to hardcoded |
| Contract output Phase 1 | Text preview + PDF download | PDF from day one per user preference |
| Anonymous operations | Service role client in API routes | Necessary because anon users have no auth.uid() |

---

## Files Changed Summary

| Category | ~Count | Key Files |
|----------|--------|-----------|
| Clause library | ~25 | `lib/clauses/**/*.ts` |
| Contract tool | ~10 | `lib/contracts/`, `app/(tools)/tools/contracts/` |
| T&C tool | ~7 | `lib/terms/`, `app/(tools)/tools/terms/` |
| Notice tool | ~5 | `lib/notices/`, `app/(tools)/tools/notice-log/` |
| Handshake tool | ~8 | `lib/handshake/`, `app/api/handshake/`, `app/(tools)/tools/handshake/` |
| Milestone tool | ~8 | `lib/milestones/`, `app/api/milestones/`, `app/(tools)/tools/milestones/` |
| Shared components | ~7 | `components/tools/` |
| PDF generation | ~8 | `lib/pdf/`, `app/api/pdf/` |
| BoE rate | ~4 | DB migration, edge function, `lib/boe-rate.ts`, calculator update |
| Total | **~60 files** | |
