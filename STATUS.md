# Kestrel — Project Status Report

**Generated:** 2026-04-04
**Source:** `/memory/decisions.md`, git history, CLAUDE.md briefing

---

## What Has Happened

Build kicked off 2026-04-01. In three days, the project went from zero code to a working application with most of the planned free tools, auth, dashboard, dispute resolution, and email notifications. Here's the chronological summary:

### Day 1 (April 1) — Foundation + Late Payment Toolkit
- Next.js 16 (App Router) + TypeScript strict + Tailwind 4 + Supabase
- Kestrel design tokens, fonts (Satoshi display, DM Sans body, JetBrains Mono)
- Supabase clients (browser + server)
- **Late Payment Toolkit** built: interest calculator (statutory rate + compensation), 4-stage letter templates (friendly reminder → notice of intent), Kestrel dispute clause ON by default

### Day 2-3 (April 3) — Everything Else
- **Logo:** User-provided SVG bird mark (line-art, stroke-only, curved wings)
- **Dead link fix:** Created /about, /pricing, /contact, /privacy, /terms + "coming soon" placeholders for unbuilt tools
- **Security headers** (HSTS, X-Frame-Options, etc.)
- **Database:** 11 migrations applied — enums, profiles, disputes, submissions, evidence, saved docs, audit log, notifications, subscriptions, indexes, triggers. All 8 tables with RLS.
- **Company rebrand:** Pellar Technologies → OnKestrel Limited (independent company)
- **Full visual overhaul:** Premium hero (90vh, gradient orbs, animated bird flight path), glassmorphism header, 4-column footer, 8 CSS animations, card hover effects, dark CTA section
- **BoE base rate fix:** Hardcoded 4.50% → dynamic from DB (actual rate: 3.75%). Weekly Vercel cron job scrapes BoE website for updates.
- **All 6 free tools built:**
  1. Late Payment Toolkit (calculator + letters)
  2. Contract Templates (6 types: freelancer, NDA, general service, consulting, SaaS, subcontractor)
  3. Terms & Conditions Generator (3 business types: e-commerce, SaaS, professional)
  4. Handshake (persistent: creator form → shareable link → party B confirms/modifies/declines)
  5. Notice Log (5 notice types, shareable link, recipient acknowledgement)
  6. Milestone Tracker (projects with dynamic milestones, shared tracker, status updates)
- **Auth system:** Google OAuth, Microsoft OAuth, email+password, enterprise SSO (SAML/OIDC) scaffold
- **Dashboard shell:** Sidebar navigation (collapsible, mobile drawer), adaptive dashboard (empty state → populated state), onboarding (4-step animated flow), greeting splash
- **Stripe integration scaffold:** Plan definitions (Free/Professional/Business), checkout + portal + webhook routes, subscription lifecycle handlers
- **Cookie consent + analytics:** GDPR banner, GA4 + Vercel Analytics (consent-gated)
- **Disputes v1:** Complete dispute resolution system — 4-step filing wizard, structured submissions (8 types), evidence upload (Supabase Storage, 25MB/file), real-time updates, SHA-256 content integrity, KST-YYYY-NNNNN reference numbers, mediator marketplace (feature-flagged off)
- **Email notifications:** 8 Resend templates (dispute-filed through dispute-resolved), deadline reminder cron (daily 08:00 UTC, deduped by urgency tier)
- **Tool tables:** 7 new tables for free tool persistence (base_rates, handshakes, handshake_terms, handshake_responses, notices, projects, milestones)

---

## What Changed From the Original Briefing (CLAUDE.md)

| Topic | Original Briefing | Actual Implementation |
|---|---|---|
| **Auth** | Magic link only | Magic link **removed** (founder hates it). Now: Google OAuth, Microsoft OAuth, email+password, enterprise SSO. Passkeys deferred. |
| **Display font** | Instrument Serif | **Satoshi** (from Fontshare). Corrected April 3. |
| **Company** | Implied under Pellar Technologies | **OnKestrel Limited** — independent company. All Pellar refs removed. |
| **BoE base rate** | Hardcoded 4.50% | Dynamic from DB (actual: 3.75%). Auto-updated via weekly cron. |
| **Next.js version** | 15 (middleware.ts) | **16.2.2** (uses `proxy.ts`, not `middleware.ts`). |
| **Jurisdiction messaging** | "England & Wales only" | Softened: "built with English law expertise" — tools still E&W-specific, but positioning is expansion-ready. |
| **Build sequence** | Phase 1 first, then 2, 3, 4, 5 sequentially | Phases 0-5 substantially completed in 3 days. Phase 6 (remaining tools) mostly done too. |
| **Hero bird animation** | Not in briefing | Added: animated kestrel flight path above hero text. "Above text" chosen, cursor-follow rejected. |
| **Mediator marketplace** | Not in Phase 1-5 scope | Scaffolded behind feature flag (DB tables + types exist, UI hidden). |
| **Onboarding** | Not specified in detail | 4-step animated flow with business profiling + usage analytics collection. |
| **Pricing** | "No hardcoded pricing" | Stripe scaffold with env-var-driven plans (Free/Professional/Business) + per-dispute filing. |

---

## What's Done (Phases from CLAUDE.md)

- [x] **Phase 0: Foundation** — Next.js, Tailwind, Supabase, migrations, types, base UI, layouts, Sentry/ESLint config
- [x] **Phase 1: Late Payment Toolkit** — Calculator, 4-stage letters, PDF route (clipboard copy, not PDF generation yet)
- [x] **Phase 2: Contract Templates** — 6 contract types, clause library, questionnaire → preview → copy
- [x] **Phase 3: Auth + Dashboard** — OAuth + email/password, profile, dashboard, document saving
- [x] **Phase 4: Handshake Tool** — Full create → share → respond flow with persistence
- [x] **Phase 5: Dispute Resolution** — Filing, structured communication, evidence, status, escalation scaffold
- [x] **Phase 6: Remaining Tools** — T&C Generator, Notice Log, Milestone Tracker

---

## What's Still To Do

### Not Yet Built / Incomplete

1. **PDF/DOCX generation** — Contract templates and letters currently output to clipboard/preview. No actual PDF or DOCX rendering endpoint yet. Need a generation library (e.g. `@react-pdf/renderer`, `pdf-lib`, or `docx`).

2. **Auth provider configuration in Supabase Dashboard** — Google OAuth and Microsoft OAuth code is written, but the actual OAuth app credentials need to be created in Google Cloud Console and Azure AD, then configured in the Supabase Auth dashboard. This is manual setup, not code.

3. **Enterprise SSO** — Scaffolded in types/UI but not wired up. Requires Supabase Pro plan or WorkOS integration. Decision pending on timing.

4. **Stripe product/price setup** — Code references env vars (`STRIPE_PRICE_ID_PROFESSIONAL`, etc.) but no Stripe dashboard products/prices have been created. Webhook endpoint needs the `STRIPE_WEBHOOK_SECRET`.

5. **Email sending (Resend)** — Templates and send logic exist but need `RESEND_API_KEY` env var and verified sending domain (`kestrel.law` or equivalent).

6. **Domain + DNS** — Currently `kestrel.pellar.co.uk` as temp. Final domain TBD. Affects: Supabase Auth redirect URLs, email from address, analytics, SEO.

7. **Sentry setup** — Referenced in tech stack but DSN not configured. Needs `NEXT_PUBLIC_SENTRY_DSN`.

8. **Testing** — No tests written yet. Vitest is in the stack but no test files exist. Priority areas: calculator accuracy, clause toggle behaviour, RLS policy verification, auth flow.

9. **Evidence file validation** — Storage bucket exists with RLS, but server-side file type validation and virus scanning are not implemented. Currently trusts client-side checks only.

10. **SAR (Subject Access Request) export** — CLAUDE.md says "build SAR export early." Not yet built.

11. **Mediator marketplace** — Tables exist, feature flag is off. No UI, matching logic, or mediator onboarding flow.

12. **Real-time notifications** — Supabase Realtime enabled on dispute tables but in-app notification centre (bell icon, read/unread, notification preferences) not built.

13. **Document saving for authenticated users** — Dashboard references saved documents but the save-to-account flow from free tools isn't wired up.

14. **Deployment** — No `vercel.json` beyond cron config. No CI/CD pipeline. No preview deployments configured.

15. **Rate limiting** — No rate limiting on API routes or form submissions.

16. **Accessibility audit** — No a11y testing done. Keyboard navigation, screen reader, ARIA labels need review.

### Environment Variables Needed

```env
# Supabase (likely already set)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (need Stripe dashboard setup)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PROFESSIONAL=
STRIPE_PRICE_ID_BUSINESS=

# Email (need Resend account + domain verification)
RESEND_API_KEY=

# Analytics (need GA4 property)
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Monitoring (need Sentry project)
NEXT_PUBLIC_SENTRY_DSN=

# Cron security
CRON_SECRET=

# Site
NEXT_PUBLIC_SITE_URL=https://kestrel.pellar.co.uk
```

### Priority Order (Suggested)

1. **Testing** — nothing is verified. Calculator maths, RLS policies, auth flows.
2. **PDF/DOCX generation** — free tools are usable but not shippable without downloadable output.
3. **Auth provider setup** — manual config in Google/Azure/Supabase dashboards.
4. **Resend setup** — get email actually sending.
5. **Deployment** — get it live on Vercel, even if behind temp domain.
6. **Domain** — decide on final domain, update all references.
7. **Everything else** — SAR export, rate limiting, a11y, notification centre, etc.

---

## Key Corrections Made During Build

| Date | What Was Wrong | What Was Corrected |
|---|---|---|
| Apr 3 | Display font was Instrument Serif | Changed to **Satoshi** (user preference) |
| Apr 3 | Logo was filled geometric shapes | Replaced with user's **line-art SVG** (stroke-only, curved wings) |
| Apr 3 | BoE rate hardcoded at 4.50% | Corrected to **3.75%**, made dynamic from DB |
| Apr 3 | Company shown as under Pellar Technologies | Corrected to **OnKestrel Limited** (independent) |
| Apr 3 | Auth was magic-link only | Magic link **removed entirely**, replaced with OAuth + email/password |
| Apr 3 | Middleware convention (middleware.ts) | Next.js 16 uses **proxy.ts** |
| Apr 3 | E&W positioning was restrictive | **Softened** — expertise marker, not a boundary |
