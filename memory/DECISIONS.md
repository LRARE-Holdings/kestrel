# Decisions Log

## [2026-04-07] Email — Respondent + Initiator Templates Mirrored to Production
Followed up on the earlier edge-function test: founder approved the new respondent copy, so mirrored it into the local templates that `fileDispute()` actually imports.

**`apps/web/lib/email/templates/dispute-filed.ts` (respondent)** — full rewrite, preserving `DisputeFiledParams` interface so `lib/disputes/actions.ts` keeps working unchanged. New copy includes:
- £35 response fee, 14-day refund mechanic
- "Respondent did not engage" record + small claims evidence framing
- Court cost comparison (£35–£455, 3–6 months)
- Italicised claim summary card replacing the old structured details table
- Subject: "Dispute notice: [initiatorBusiness] — response required within 14 days"
- Title: "You've received a dispute notice"
- Greeting: "Hello" (not "Dear")
- Deadline surfaced as a real date: "You have until [responseDeadline] (14 days from the date of this email) to respond"
- Keeps existing CTA target `/sign-up?redirect=/disputes/[id]` — payment happens on the dispute page after sign-up

**`apps/web/lib/email/templates/dispute-initiated.ts` (initiator)** — targeted addition, no full rewrite. Added a new "What [respondentName] has been told" section that explains the £35 + refund mechanic and the non-engagement record to the initiator, so they understand the structure working on the other side. Also tightened the "What happens next" steps to reference the 14-day window explicitly.

Both files typecheck clean (only pre-existing Stripe errors remain in `tsc --noEmit`). No changes required to `actions.ts` — call sites pass the same params.

Note: the Supabase edge function `test-dispute-emails` (v15) already contains the same respondent copy but with a hardcoded `contractDate` and `claimSummary`. The local template derives `claimSummary` from `subject + amount` instead (because `actions.ts` doesn't have a `contractDate` field yet). If we want the real emails to reference a specific contract date and a richer one-sentence allegation, we'll need to:
1. Add `contract_date` and `claim_summary` columns to the disputes table
2. Capture them in the dispute filing form
3. Thread them through `DisputeFiledParams`

Leaving as follow-up unless founder wants it now.

## [2026-04-07] Email — Respondent Notification Rewrite (£35 fee, 14-day refund, court comparison)
Rewrote the respondent dispute notification email with stronger, more action-oriented copy. Key changes:
- **£35 response fee** now explicitly stated, with **full refund if dispute resolves within 14 days of respondent joining**.
- **"Respondent did not engage" record** introduced as a new mechanic — non-engagement creates a record the claimant can use as evidence in Small Claims Court (and may affect costs awarded).
- **Court cost comparison** added: £35–£455 in fees, 3–6 months — to make the value of responding on Kestrel obvious.
- **Subject line** changed from "A dispute has been raised: [REF]" to "Dispute notice: [Claimant Business] — response required within 14 days" — more direct, harder to ignore in inbox.
- **Title** changed from "You have received a dispute" to "You've received a dispute notice".
- **Claim summary card** replaces the structured details table — single italicised quote of the allegation, with reference number underneath.
- **CTA** unchanged in destination (sign-up → /disputes/[id]); payment now happens on the dispute page after sign-up (per founder: "Payment needs to show on the actual dispute page and must be clear").
- **"Sent in error" reply path** added — directs to /contact, not direct email reply.

Deployed via Supabase edge function `test-dispute-emails` (version 15). Test emails sent to alex@pellar.co.uk and confirmed accepted by Resend.

**Note:** The local file `apps/web/lib/email/templates/dispute-filed.ts` still contains the OLD copy and is unchanged. The edge function is the test surface; the local template needs to be updated separately to mirror the edge function before the next dispute is filed via `actions.ts` (which still imports the local template). Treat this as a follow-up: mirror the new respondent copy into `dispute-filed.ts`, port the £35 + refund mechanic into shared constants, and decide whether the initiator confirmation (`dispute-initiated.ts`) needs corresponding updates.

Brand fixes also applied to the edge function (was stale):
- Footer: `Kestrel Solutions Limited` → `OnKestrel Limited`
- Site URL: `kestrel.pellar.co.uk` → `onkestrel.com`
- From: `notifications@kestrel.pellar.co.uk` → `notifications@onkestrel.com`
- Security: `security@kestrel.law` → `security@onkestrel.com`

## [2026-04-04] Design — Full Dark Mode Implementation
Added dark mode support across both web and admin apps. Key decisions:
- **Semantic token switching**: Restructured `@theme inline` to use `var(--raw-*)` indirection so all existing Tailwind classes (`bg-cream`, `text-ink`, `bg-stone`, etc.) auto-switch between light/dark — zero `dark:` prefixes needed on components.
- **New `surface` token**: Replaced all `bg-white` (97 files) with `bg-surface` since Tailwind's built-in `white` can't be redefined. `surface` maps to `#FFFFFF` in light, `#162220` (deep forest green) in dark.
- **Theme provider**: `@wrksz/themes` (not `next-themes`) — drop-in replacement that fixes React 19/Next.js 16 compatibility bugs. Uses class-based switching.
- **Dark palette**: Forest-green-tinged charcoals (on-brand "calm luxury"), not generic greys. Page bg `#0F1716`, cards `#162220`, stone `#1C2C27`.
- **Dark kestrel primary**: `#4A9480` — brightened for dark backgrounds, passes WCAG AA 4.5:1 contrast against white text.
- **Toggle**: Sun/moon button in web header, web sidebar, and admin sidebar. Three-way selector (Light/Dark/System) on Settings page.
- **Flash prevention**: `@custom-variant dark (&:where(.dark, .dark *))` + `suppressHydrationWarning` on `<html>`.

## [2026-04-01] Architecture — Initial Build Kickoff
Phase 0 foundation + Phase 1 Late Payment Toolkit build started. Following CLAUDE.md build sequence.

## [2026-04-01] Architecture — Tech Stack
Next.js 16 (App Router), Tailwind 4, TypeScript strict, Supabase (DB/Auth/Storage), Zod, react-hook-form, Vitest, Vercel deployment target.

## [2026-04-01] Product — Build Priority
Phase 1: Late Payment Toolkit (calculator + 4-stage letter templates). Demo piece for Mercia Ventures pitch.

## [2026-04-01] Design — Fonts
Instrument Serif (display), DM Sans (body), JetBrains Mono (code/legal). Self-hosted via next/font. Never Inter/Roboto/Arial.

## [2026-04-01] Architecture — Late Payment Toolkit Implementation
Built Phase 1 Late Payment Toolkit with all core files:
- `lib/late-payment/calculator.ts` — Pure calculation functions (statutory interest, compensation, days overdue). BoE base rate 4.50% as of 2026-03-20.
- `lib/late-payment/schemas.ts` — Zod v4 validation schemas for calculator and letter inputs. Removed `.default()` to avoid react-hook-form type inference issues with Zod v4.
- `lib/late-payment/letters.ts` — 4-stage deterministic letter templates (friendly reminder, firm reminder, letter before action, notice of intent). No AI generation. Kestrel clause ON by default, toggleable.
- `app/(tools)/tools/late-payment/page.tsx` — Landing page (server component) with two card links.
- `app/(tools)/tools/late-payment/calculator/page.tsx` — Interactive calculator with react-hook-form + zodResolver.
- `app/(tools)/tools/late-payment/letters/page.tsx` — Interactive letter generator with stage selector, party details, live preview, clipboard copy.
- `lib/supabase/client.ts` + `lib/supabase/server.ts` — Browser and server Supabase clients via @supabase/ssr.
- `.env.local.example` — Environment variable template.
All pages use existing UI components (Button, Input, Card, Toggle). No auth gates. England & Wales only.

## [2026-04-03] Correction — Display Font
Instrument Serif replaced with Satoshi (from Fontshare). User preference: Satoshi for headings/titles, DM Sans for body. Self-hosted via next/font/local with woff2 files in app/fonts/. CSS variable changed from --font-instrument-serif to --font-satoshi.

## [2026-04-03] Design — SVG Bird Mark Logo
Created geometric kestrel bird mark as SVG component (components/ui/logo.tsx). Bold filled shapes — diving bird with swept-back wings. Used in header, footer, favicon (app/icon.svg). Replaces text-only "Kestrel" wordmark.

## [2026-04-03] Architecture — Dead Link Fix
Created all missing pages linked from header/footer: /about, /pricing, /contact, /privacy, /terms. Created "coming soon" placeholder pages for 5 unbuilt tools: /tools/contracts, /tools/terms, /tools/handshake, /tools/notice-log, /tools/milestones. Added custom 404 (app/not-found.tsx) and error boundary (app/error.tsx).

## [2026-04-03] Security — Headers Added
Security headers configured in next.config.ts: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. Per SECURITY.md requirements.

## [2026-04-03] Database — All Migrations Applied
Supabase project zyebrpcjdoyrckxbpicz. Applied 11 migrations: enums (4 types), profiles, disputes, dispute_submissions, evidence_files, saved_documents, audit_log, notifications, subscriptions, indexes (14 indexes), updated_at triggers. All 8 tables have RLS enabled. TypeScript types generated to lib/supabase/types.ts.

## [2026-04-03] Architecture — Auth System
Built magic link auth via Supabase Auth: middleware.ts (session refresh + route protection), lib/supabase/middleware.ts, lib/auth/actions.ts (signIn, signOut, getUser, getProfile, updateProfile). Sign-in page with email input + magic link. Auth callback + confirm routes. Header shows auth state (Dashboard + Sign out when signed in).

## [2026-04-03] Architecture — Dashboard Shell
Created (app) route group with protected layout. Dashboard page with cards (saved docs, active disputes, subscription status) + quick actions. Documents page with empty state. Settings page with profile form. Billing page with plan display + Stripe portal placeholder. Onboarding page for first-time profile creation.

## [2026-04-03] Architecture — Stripe Integration Scaffold
Installed stripe SDK. Created: lib/stripe/client.ts (lazy-init), lib/stripe/config.ts (plan definitions from env vars), API routes for checkout/portal/webhooks, webhook handlers for subscription lifecycle. Hybrid pricing model: subscription tiers (Free/Professional/Business) + per-dispute filing. No hardcoded pricing (all from env vars). Subscriptions table in DB with RLS.

## [2026-04-03] Dependency — Stripe
Added `stripe` package for payment processing. Webhook handlers use Supabase service role client (bypasses RLS) since webhooks have no user context.

## [2026-04-03] Design — Logo Replaced with User's SVG
User provided their own kestrel mark SVG (line-art bird with curved quadratic wings, stroke-only, no fill). Replaced the previous filled-shape mark. Updated logo.tsx, icon.svg. Mark uses currentColor for theming.

## [2026-04-03] Design — Full Visual Overhaul
Comprehensive redesign for premium, modern, conservative feel:
- **Hero**: Full-viewport (90vh), gradient orbs for depth, bg-grid pattern, staggered fade-up animations, pill badge with pulse dot, floating decorative bird mark
- **Animations**: 8 keyframe animations (fade-in, fade-up, scale-in, slide-left/right, float, pulse-soft, draw-line) with stagger delay utilities (delay-100 to delay-800)
- **Cards**: card-hover class with translateY(-2px) + shadow-lg on hover
- **Header**: Glassmorphism (bg-cream/80 backdrop-blur-xl), "Get started" CTA button added alongside "Sign in"
- **Footer**: 4-column layout (brand, product links, company links), bottom bar with copyright and location
- **Section headers**: Consistent pattern — uppercase tracking-[0.2em] kestrel eyebrow + bold display heading
- **CTA section**: Dark (bg-ink) with gradient orbs, light text, inverted button colours
- **Tools grid**: "Live" / "Soon" badges, reveal-on-hover arrow links
- **Trust signals**: Icon circles with bg-kestrel/8, hover border transition
- **Selection colour**: kestrel green tint
- **Smooth scroll**: html { scroll-behavior: smooth }
- **New CSS token**: --radius-2xl: 1.25rem, --shadow-xl added

## [2026-04-03] Correction — Logo Mark Style
Previous mark was filled geometric shapes (bold, angular). User preferred their own line-art mark (stroke-only, curved quadratic Bezier wings, more elegant). Original → user's SVG.

## [2026-04-03] Strategy — Jurisdiction Positioning
Founder observation: Kestrel doesn't practice law or perform reserved legal activities. The structured communication model is jurisdiction-agnostic by design. The E&W specificity is in the free tools (statutory interest rates, CRA 2015 references, English contract law clauses) not the platform itself.

Decision: Soften the E&W-only language in marketing copy. Don't remove it — the tools are genuinely E&W-specific — but position it as "built with English law expertise" rather than "only works in England." The pitch framing should be: focused on E&W today, model is inherently global. This is an expansion story, not a limitation.

Implementation: Hero, trust signals, about page, and footer copy updated to lead with the value prop (structured resolution) and mention E&W as a trust signal / expertise marker rather than a boundary. Free tools still clearly reference English law where relevant (Late Payment Act, CRA 2015, etc.) — that's accuracy, not limitation.

## [2026-04-03] Design — Hero Bird Flight Path Decision
Explored three flight behaviours for the animated kestrel on the hero: above text, below text, and cursor-follow. Built a debug switcher with grid cards to compare. Founder and co-founder reviewed and decided:
- **Above text** — chosen. Bird sweeps across the upper portion of the hero (Y ~110-220), clear of the headline.
- **Below text** — rejected.
- **Cursor-follow** — rejected ("looks rubbish").
Debug switcher removed. Component is now a clean single-behaviour export with 8 paths above the text.

## [2026-04-03] Correction — BoE Base Rate
Hardcoded rate was 4.50% (from 2026-03-20). Actual current rate is 3.75% (changed 18 Dec 2025, held at March 2026 MPC meeting). Fixed by:
1. Created `base_rates` table in Supabase with RLS (public read, service role insert)
2. Seeded with correct rate (3.75%, effective 2025-12-18)
3. Refactored `lib/late-payment/calculator.ts` to remove hardcoded constants — `calculateStatutoryInterest()` now requires `baseRate` as explicit parameter
4. Calculator and letters pages now fetch rate from DB via server components
5. Created `lib/base-rate/queries.ts` with `getLatestBaseRate()` function
6. Created `lib/supabase/service.ts` — service role client for anonymous writes and cron jobs

## [2026-04-03] Architecture — BoE Rate Automation
Vercel cron job (`vercel.json`, weekly Mondays 09:00 UTC) calls `app/api/cron/fetch-boe-rate/route.ts` which scrapes the BoE Bank Rate page, parses the current rate, and inserts a new row into `base_rates` if changed. Secured by `CRON_SECRET` header. Fallback: manual DB insert if scraper breaks.

## [2026-04-03] Database — Tool Tables Migration
Applied 5 new migrations for free tools persistence:
- `create_tool_enums`: handshake_status, notice_type, notice_status, milestone_status, project_status
- `create_handshakes`: handshakes + handshake_terms + handshake_responses (3 tables)
- `create_notices`: notices table
- `create_projects_and_milestones`: projects + milestones (2 tables)
- `create_updated_at_triggers_for_new_tables`: 4 triggers
Total: 7 new tables (base_rates + 6 tool tables), all with RLS. Anonymous-first pattern: public SELECT, public INSERT, access_token UUID for sharing. TypeScript types regenerated.

## [2026-04-03] Architecture — All Free Tools Built
Built all 6 free tools:
1. **Late Payment Toolkit** (previously built, refactored for dynamic base rate)
2. **Contract Templates** — 6 contract types (freelancer, NDA, general service, consulting, SaaS, subcontractor). Clause library at `lib/clauses/` + `lib/contracts/`. Dynamic route `[type]` with questionnaire → live preview → copy to clipboard.
3. **Terms & Conditions Generator** — 3 business types (e-commerce, SaaS, professional). Clause modules at `lib/terms/clauses/`. Outputs: text, Markdown, HTML. CRA 2015 + UK GDPR compliance sections.
4. **Handshake** — Full persistence. Creator form → DB insert → shareable link. Party B confirms/modifies/declines via `[token]` page. API routes with service role client.
5. **Notice Log** — 5 notice types. Creation form → DB insert → shareable link. Recipient can acknowledge. Templates for consequences text.
6. **Milestone Tracker** — Project creation with dynamic milestones. Shared tracker view with status updates (in progress, completed, disputed). Visual progress tracking.

All tools: no auth gates, Kestrel clause ON by default + one-click removable, deterministic text generation, England & Wales only.

## [2026-04-03] Architecture — Auth Method Expansion
Decision to expand auth beyond magic link only. Target methods: Google OAuth, Microsoft OAuth, passkeys (if supported).
- **Google OAuth**: Supabase native — `signInWithOAuth({ provider: 'google' })`
- **Microsoft OAuth**: Supabase native — `signInWithOAuth({ provider: 'azure' })`
- **Passkeys/WebAuthn**: NOT natively supported by Supabase Auth as primary sign-in. Options: skip for now, roll own with SimpleWebAuthn, or use third-party (Corbado/Descope). Awaiting founder decision.
- **Magic link**: Retained as existing method.
- SECURITY.md previously stated "Magic link only" — will need updating once auth methods confirmed.
- Clarification needed: "SSO" = social login buttons (Google/Microsoft) or enterprise SAML/OIDC SSO?

## [2026-04-03] Product — Magic Link Removed
Founder explicitly rejected magic link auth. Removing it entirely from the sign-in flow.

## [2026-04-03] Correction — Company Structure: Pellar → Kestrel
Kestrel is its own independent company at launch, NOT a product under Pellar Technologies. Working company name: Kestrel Solutions Limited (final name TBD). All references to Pellar removed from: CONTEXT.md, SECURITY.md, CLAUDE.md, memory files, footer, about page, terms page, privacy page, contact page. LinkedIn updated to linkedin.com/company/onkestrel.

## [2026-04-05] Correction — Company Name: Kestrel Solutions Limited → OnKestrel Limited
Final company name confirmed by founder: **OnKestrel Limited**. Replaces the working name "Kestrel Solutions Limited".

## [2026-04-03] Architecture — Auth Methods Confirmed
Final auth lineup:
1. **Google OAuth** — social login via Supabase `signInWithOAuth({ provider: 'google' })`
2. **Microsoft OAuth** — social login via Supabase `signInWithOAuth({ provider: 'azure' })`
3. **Email + password** — traditional sign-up/sign-in via Supabase `signUp` / `signInWithPassword`
4. **Enterprise SSO (SAML/OIDC)** — for companies with own IdP, via Supabase SSO (Pro plan feature) or WorkOS
5. **Passkeys** — deferred until Supabase ships native support or founder decides on custom implementation
No magic link. SECURITY.md and auth code to be updated accordingly.

## [2026-04-03] Infrastructure — Temporary Domain
Temporary domain: `kestrel.pellar.co.uk` for staging/production while Kestrel's own domain is TBD. `NEXT_PUBLIC_SITE_URL` should be set to `https://kestrel.pellar.co.uk`. Supabase Auth redirect URLs configured for this domain.

## [2026-04-03] Correction — Next.js 16 Proxy Convention
Next.js 16 replaced `middleware.ts` with `proxy.ts`. Root `proxy.ts` already exists and calls `updateSession()` from `lib/supabase/middleware.ts`. Do not create `middleware.ts` — use `proxy.ts` instead.

## [2026-04-03] Architecture — Cookie Consent Banner + Analytics
Added GDPR-compliant cookie consent banner with Google Analytics 4 and Vercel Analytics.
- `lib/consent.ts` — reads/writes `kestrel_consent` cookie ("granted" | "denied"), updates GA consent mode
- `components/ui/cookie-banner.tsx` — client component, slides up from bottom, on-brand (cream/white, kestrel green accept button, border styling). Links to /privacy. Decline + Accept buttons.
- `components/analytics.tsx` — client component, conditionally renders GA4 `<Script>` tags and `<VercelAnalytics />` only when consent === "granted". GA configured with `anonymize_ip: true`.
- Root `app/layout.tsx` updated to include both components.
- Env var needed: `NEXT_PUBLIC_GA_MEASUREMENT_ID` (GA4 measurement ID, e.g. G-XXXXXXXXXX).
- Installed `@vercel/analytics` package.
- Banner does not block page usage — appears as floating bottom overlay.
- On accept, page reloads to initialise analytics scripts. On decline, scripts never load.
- Consent cookie lasts 1 year, SameSite=Lax, Secure.

## [2026-04-03] Database — Onboarding Schema Extension
Added `company_size` (text with CHECK constraint) and `industry` (text with CHECK constraint) columns to `profiles` table. Created `onboarding_responses` table for analytical data (primary_use_case, estimated_disputes_per_year, referral_source, referral_code) with RLS — users can only insert/read/update their own row. Linked to profiles via profile_id FK with UNIQUE constraint (one response per user).

## [2026-04-03] Architecture — Multi-Step Onboarding Flow
Replaced single-form onboarding with a 4-step animated flow:
- Step 1 (Identity): display_name, pre-filled from OAuth metadata
- Step 2 (Business): business_name, business_type, company_size, industry
- Step 3 (Usage): primary_use_case as selectable cards, estimated_disputes_per_year as pill chips. Skippable.
- Step 4 (Discovery): referral_source, referral_code. Skippable.
Moved to own route group `(onboarding)` to avoid rendering sidebar. Data accumulated client-side, single DB write on completion via `completeOnboarding()` server action. Framer Motion AnimatePresence for slide transitions between steps (EASE_OUT_EXPO easing).

## [2026-04-03] Architecture — Collapsible Sidebar Navigation
Replaced top-bar nav with a collapsible sidebar (`components/app/sidebar.tsx`):
- Desktop: Framer Motion animated width (64px collapsed ↔ 256px expanded), sticky, full-height
- Nav items: Dashboard, Documents, Disputes, Tools, Settings
- Active state via usePathname(), collapse state persisted to localStorage
- User avatar + email + sign out at bottom
- Mobile: hidden on <lg, replaced by slide-in drawer with backdrop
- App layout (`app/(app)/layout.tsx`) now uses `<AppShell>` wrapper
- Layout also redirects to /onboarding if onboarding not completed

## [2026-04-03] Design — Greeting Splash Animation
Full-screen splash for returning users on dashboard:
- KestrelMark scale-in (0.5s), time-aware greeting fade-up with 300ms delay
- "Good morning/afternoon/evening, [firstName]." in Satoshi display font
- Overlay lifts and fades out after 1.8s (EASE_OUT_EXPO)
- sessionStorage flag — shows once per browser session
- Respects prefers-reduced-motion (skips entirely)
- Locks body scroll while visible

## [2026-04-03] Architecture — Adaptive Dashboard
Dashboard conditionally renders based on data:
- **Empty state** (no disputes/documents): 4 guided first-action cards (create contract, calculate late payment, set up handshake, generate T&Cs) + "What is Kestrel?" context box
- **Populated state**: Two-column layout — disputes timeline (2/3) grouped by priority (needs attention → active → escalated → resolved) with status badges and deadline urgency + stats panel (1/3) with counts, recent documents, and quick actions
- Server component fetches data via `getDashboardData()` (parallel Supabase queries)
- Date formatting utilities in `lib/dates/format.ts`

## [2026-04-03] Architecture — Shared Constants
Extracted dropdown option arrays into `lib/constants.ts` (BUSINESS_TYPES, COMPANY_SIZES, INDUSTRIES, USE_CASES, DISPUTE_ESTIMATES, REFERRAL_SOURCES). Used by both onboarding and settings pages. Eliminates duplication.

## [2026-04-03] Architecture — Email Notification System
Built complete transactional email system using Resend:
- `lib/email/client.ts` — Resend client singleton
- `lib/email/types.ts` — EmailPayload, DisputeEmailContext, EmailResult types
- `lib/email/send.ts` — Main send wrapper: sends via Resend, creates notification record in DB, marks email_sent with timestamp. Errors logged but never thrown.
- `lib/email/templates/layout.ts` — Shared HTML email layout (table-based, inline CSS, Kestrel branding: #2B5C4F header, white content, cream background, rounded cards)
- 8 email templates: dispute-filed, submission-received, evidence-uploaded, status-changed, proposal-received, proposal-response, deadline-reminder, dispute-resolved
- `app/api/cron/deadline-reminders/route.ts` — Cron endpoint (CRON_SECRET auth) queries disputes with approaching/overdue deadlines, deduplicates by notification type (deadline_reminder_7d, deadline_reminder_3d, deadline_reminder_1d, deadline_overdue), sends emails to responding parties
- From address: "Kestrel <notifications@kestrel.law>"
- All links use NEXT_PUBLIC_SITE_URL
- All templates use EmailResult return type ({ subject, html })
- Brand voice: professional, calm, not accusatory. Urgency escalates appropriately for deadline reminders.

## [2026-04-03] Architecture — Disputes v1 Full Implementation
Built complete dispute resolution system (Phase 5 of build sequence). Decisions confirmed with founder:
- **Respondent auth:** Account required to view/respond (not token-based)
- **Communication model:** Structured submissions only (no freeform chat). 8 submission types: initial_claim, response, reply, evidence_summary, proposal, acceptance, rejection, withdrawal
- **Escalation:** Full mediator marketplace scaffold hidden behind `mediator_marketplace` feature flag in `feature_flags` table
- **Email notifications:** Comprehensive — every action triggers email via Resend. 8 templates + deadline reminder cron (daily 08:00 UTC)
- **File storage:** Supabase Storage `dispute-evidence` bucket (25MB/file, 100MB/dispute, whitelist: PDF/DOCX/XLSX/PNG/JPG)
- **Filing UX:** 4-step wizard (Type & Details → Respondent → Evidence → Review & File)
- **Real-time:** Supabase Realtime subscriptions on dispute detail page (submissions, evidence, dispute updates)
- **Reference numbers:** KST-YYYY-NNNNN format via PostgreSQL sequence (collision-safe)
- **Content integrity:** SHA-256 hash on every submission (Web Crypto API)

Database changes:
- Added `description` and `includes_dispute_clause` columns to disputes
- Created `dispute_reference_seq` sequence + `generate_dispute_reference()` function
- Created `mediators`, `mediator_specialisations`, `dispute_mediator_requests` tables (RLS: locked to service role for now)
- Created `feature_flags` table with `mediator_marketplace` = false
- Enabled Supabase Realtime on dispute_submissions, evidence_files, disputes
- Created `dispute-evidence` storage bucket with party-scoped RLS policies

Files created: 45 new files across lib/disputes/, lib/email/, lib/feature-flags/, lib/mediators/, components/app/disputes/, app/(app)/disputes/, app/api/cron/deadline-reminders/

## [2026-04-04] Architecture — Admin Panel (Separate App)
Decision: Build the admin panel as a separate Next.js app, deployed independently at admin.kestrel.pellar.co.uk. Shares the same Supabase project (zyebrpcjdoyrckxbpicz). Admin code never ships to the public site — clean security boundary.

Capabilities at launch:
- Platform analytics dashboard (sign-ups, tool usage, disputes, subscriptions, revenue)
- CRM-lite lead tracker (contacts, companies, deal stages, interaction notes, follow-up reminders, pipeline view)
- User management (search/view users, profile + subscription status, disable accounts)
- Dispute oversight (all disputes metadata + status, flag/escalate, compliance audit trail)

## [2026-04-04] Security — Admin Access Control
Decision: Separate `admin_users` table + Supabase Custom Access Token Hook.
- `admin_users` table stores `user_id`, `role`, `created_at`, `created_by` — locked by RLS (no public read/write)
- Custom Access Token Hook (PL/pgSQL) checks `admin_users` on every token issuance and injects `app_metadata.admin = true` into the JWT
- Admin app proxy.ts checks `session.user.app_metadata?.admin === true`
- RLS policies check `(select auth.jwt() -> 'app_metadata' ->> 'admin')::boolean = true`
- Defence in depth: DB table (source of truth) + JWT claim (signed, untamperable) + app-level proxy check

Rejected alternatives:
- Email allowlist: no database-level enforcement, single point of failure at app layer
- Role column on profiles: dangerous — existing `FOR ALL` RLS policy allows self-update, risk of privilege escalation

## [2026-04-04] Security — Admin Auth: Email+Password + Mandatory MFA
Decision: Admin panel uses email+password ONLY (no OAuth, no magic link). MFA (TOTP) is mandatory.
- Supabase Auth supports TOTP MFA natively (free, enabled by default)
- OAuth restriction is application-level: admin app only calls `signInWithPassword()`, never renders OAuth buttons
- MFA enforcement at three layers:
  1. Frontend: proxy.ts checks AAL level, redirects to MFA enrollment/verification if not aal2
  2. Server: server components check AAL before rendering admin content
  3. Database: restrictive RLS policies require `(select auth.jwt()->>'aal') = 'aal2'`
- Custom Access Token Hook and MFA are complementary: hook injects `user_role`/`admin` claim, Supabase Auth manages `aal` claim. Both checked together in RLS.
- Sign-in flow: email+password → check AAL → if no MFA enrolled, force TOTP enrollment → TOTP challenge → session upgraded to aal2 → access granted
- JWT contains both `aal: 'aal2'` and `user_role: 'admin'` after full authentication
- `as restrictive` keyword on admin RLS policies prevents other permissive policies from bypassing MFA requirement

## [2026-04-04] Architecture — Dispute Filing Sends Two Emails
Filing a dispute now sends two distinct transactional emails via Resend:
1. **Initiator confirmation** (`dispute-initiated.ts`): Confirms filing, shows reference number, respondent details, deadline, and "what happens next" steps. Tone: composed, reassuring, clear.
2. **Respondent notification** (`dispute-filed.ts`): Informs the respondent a formal dispute has been raised. Shows reference, subject, type, who filed, deadline. Includes "how to respond" steps. Tone: formal, respectful, neutral — conveys seriousness without being accusatory.

Both emails use the shared `emailLayout` (Kestrel-branded table-based HTML) and are sent via `Promise.allSettled()` so neither blocks the filing response. The old placeholder notification insert was replaced with proper `sendDisputeEmail()` calls that create notification records AND send via Resend.

Key implementation details:
- `fileDispute()` now selects `id, reference_number` from the dispute insert
- Fetches initiator profile for name/business/email
- Amounts formatted as `£X,XXX.XX` (en-GB locale)
- Deadlines formatted as "Wednesday, 18 April 2026" (en-GB long date)
- Subject line includes reference number for both (initiator: "Dispute filed: KST-...", respondent: "A dispute has been raised: KST-...")

## [2026-04-04] Architecture — Monorepo Conversion
Converted from single Next.js app to Turborepo monorepo. Structure:
- `apps/web/` — existing Kestrel app (all routes, components, lib)
- `apps/admin/` — new admin panel (to be built)
- `packages/shared/` — shared code: supabase clients, email infrastructure, constants, date utils, design tokens CSS
- Root: `turbo.json`, `tsconfig.base.json`, `package.json` (workspaces)
- Package manager: npm 11.11.0 with workspaces
- Web app dependency: `"@kestrel/shared": "*"` (npm workspace resolution)
- Turbopack root set to monorepo root via `path.resolve(__dirname, "../..")`
- Shared tokens imported in CSS via relative path: `@import "../../../packages/shared/tokens/globals.css"`
- All 36 files with shared imports updated from `@/lib/supabase/*` etc. to `@kestrel/shared/*`
- Build verified: `npx turbo build --filter=@kestrel/web` passes clean

## [2026-04-04] Database — Admin Panel Migrations
Applied 4 migrations to Supabase (zyebrpcjdoyrckxbpicz):
1. `create_admin_users` — admin access control table, RLS enabled, no public policies, only supabase_auth_admin can SELECT
2. `create_custom_access_token_hook` — PL/pgSQL function injects admin=true/false + admin_role into JWT on every token issuance. SECURITY DEFINER, search_path set. Handles non-admin case gracefully (admin=false, not error).
3. `create_leads` — CRM-lite lead tracking. Admin-only RLS (RESTRICTIVE, requires aal2 + admin=true). 4 indexes.
4. `create_lead_interactions` — Lead interaction history. Admin-only RLS. 2 indexes.
Seeded both founders (alex@pellar.co.uk, yuvi@yjstrategy.com) as super_admin.
TypeScript types regenerated (1449 lines, up from 1339). Updated in both packages/shared and apps/web.
MANUAL STEP REQUIRED: Enable Custom Access Token Hook in Supabase Dashboard → Authentication → Hooks.

## [2026-04-04] Architecture — Admin App Shell
Built admin app at apps/admin/. Next.js 16.2.2, port 3001.
Auth flow: email+password only → MFA enrollment/verification → admin dashboard.
- Sign-in: signInWithPassword server action, checks AAL, redirects to MFA
- MFA enroll: QR code display via supabase.auth.mfa.enroll(), secret fallback, 6-digit verify
- MFA verify: TOTP challenge on returning sessions
- proxy.ts: three security gates (auth required, aal2 required, MFA redirect logic)
- (admin) layout: server component checks getAdminUser() (admin claim + aal2), sidebar nav
- Sidebar: Dashboard, Users, Disputes, Leads, Settings. User email + role badge + sign out.
Build verified: both apps pass `npx turbo build` (7.9s total for web + admin).

## [2026-04-04] Product — AI Contract Analysis for Disputes
Feature documented in `/DISPUTES.md`. Key decisions:
- AI extracts key contract terms (parties, dates, amounts, payment terms, deliverables) when a dispute is filed
- Only available for contracts created through Kestrel that include the Kestrel dispute resolution clause
- Contracts without the clause can still be disputed, but AI extraction is unavailable (incentivises clause retention)
- Extraction runs on-demand only (user toggles it on at dispute time, not before)
- Both parties see the same extracted data and can challenge any field
- Challenged fields marked as "not agreed" with both versions visible — Kestrel does not adjudicate
- Extracted data stored with application-level encryption (non-negotiable)
- Pricing: included on higher subscription tiers, per-document upsell for lower tiers
- AI constraints: extraction only, no interpretation, no liability assessment, no recommendations
- GDPR: new processing activity, requires privacy policy update and DPIA consideration
- Prefer pulling from original structured questionnaire data over re-parsing generated documents where possible

## [2026-04-04] Architecture — Admin Auth Flow Built
Built complete admin auth flow at `apps/admin/`. 8 files created:
- `lib/auth/actions.ts` — server actions: `signInWithPassword` (with MFA redirect logic), `signOut`, `getAdminUser` (checks admin claim + aal2)
- `app/(auth)/layout.tsx` — centered auth card layout, Kestrel branding, no sign-up link
- `app/(auth)/sign-in/page.tsx` — email+password only form, `useActionState` pattern (React 19), no OAuth buttons
- `app/(auth)/mfa/enroll/page.tsx` — TOTP enrollment: QR code display, manual secret fallback, 6-digit verification
- `app/(auth)/mfa/verify/page.tsx` — TOTP challenge on subsequent sign-ins, sign-out link
- `app/(admin)/layout.tsx` — server component, calls `getAdminUser()`, redirects to `/sign-in` if null
- `app/(admin)/sidebar.tsx` — client component, 256px fixed sidebar, 5 nav items (Dashboard, Users, Disputes, Leads, Settings), inline SVG icons, user email + role badge, sign out
- `app/(admin)/page.tsx` + `app/(admin)/settings/page.tsx` — placeholder pages

Auth flow: email+password -> check AAL -> if no TOTP enrolled, redirect /mfa/enroll -> if TOTP enrolled but aal1, redirect /mfa/verify -> aal2 verified -> access granted. Three enforcement layers: proxy.ts (route-level), server component (getAdminUser), database (RLS requires aal2 + admin claim).

## [2026-04-04] Architecture — Admin Dispute Oversight & Lead Tracker
Built two major admin features:

**Dispute Oversight (metadata only)**:
- `lib/admin/dispute-queries.ts` — Query functions using service role client (bypasses RLS). Functions: `listDisputes` (paginated, filterable by status/type), `getDisputeOverview` (metadata + party profiles + submission/evidence counts + audit log), `escalateDispute`.
- `app/(admin)/disputes/page.tsx` — Dispute list with status/type filters via URL search params, data table with reference/type/status/subject/parties/deadline columns, coloured status badges, pagination.
- `app/(admin)/disputes/[id]/page.tsx` — Dispute detail: overview card, parties card, key dates timeline, activity stats (counts only, no content), audit log timeline, timestamps. Escalate button with confirmation dialog.
- Key design decision: admins can see dispute metadata but NOT submission content or evidence files. This is intentional for data isolation.

**Lead Tracker (CRM-lite)**:
- `lib/leads/schemas.ts` — Zod schemas for create/update lead + create interaction. Stages: lead/contacted/qualified/proposal/won/lost.
- `lib/leads/queries.ts` — Query functions using server client (admin JWT with RLS). Functions: `listLeads` (paginated, searchable, filterable), `getLeadsByStage` (grouped for pipeline), `getLeadDetail` (lead + interactions), `getOverdueFollowUps`.
- `lib/leads/actions.ts` — Server actions: `createLead`, `updateLead`, `updateLeadStage`, `archiveLead`, `addInteraction`. All use `getAdminUser()` for auth.
- `app/(admin)/leads/page.tsx` — Dual view: list (data table) and pipeline (kanban board). Toggle via `?view=list|pipeline`. Search, stage filter, status filter.
- `app/(admin)/leads/new/page.tsx` — New lead form with all fields, Zod validation, redirects to detail on success.
- `app/(admin)/leads/[id]/page.tsx` — Lead detail: editable contact card, interaction timeline, add interaction form, status/stage sidebar, stage change buttons, archive action.

**Shared admin components created**:
- `components/admin/data-table.tsx` — Generic HTML table with columns/data/render props
- `components/admin/timeline.tsx` — Vertical timeline with coloured dots per type
- `components/admin/pipeline-board.tsx` — Kanban board with stage columns, lead cards, overdue highlighting
- `components/admin/pagination.tsx` — URL-param-based pagination with prev/next
- `components/admin/status-badge.tsx` — Coloured badges for dispute statuses and lead stages

Build verified: `npx turbo build --filter=@kestrel/admin` passes clean (6.7s).

## [2026-04-04] Product — Mandatory Email Notifications on All Dispute Submissions
Founder requirement: both parties MUST be notified by email whenever any dispute activity occurs. Previously, only the initial filing triggered emails — all subsequent submissions (response, reply, proposal, acceptance, rejection, withdrawal, evidence summary) were silent.

**Implementation:** Added `notifyPartiesOfSubmission()` helper in `apps/web/lib/disputes/actions.ts`, called fire-and-forget from `addSubmission()` after audit log. Uses service client for cross-party profile lookups (bypasses RLS).

**Email routing by submission type:**
- `response`, `reply`, `evidence_summary`, `withdrawal` → generic `submissionReceivedEmail` to other party
- `proposal` → dedicated `proposalReceivedEmail` to other party
- `rejection` → `proposalResponseEmail` to proposer (with accepted=false)
- `acceptance` (resolves dispute) → `disputeResolvedEmail` to BOTH parties

All emails also create in-app notification records via `sendDisputeEmail()`. Errors are logged but never block the submission flow (fire-and-forget pattern via `Promise.allSettled` / `.catch`).

## [2026-04-04] Architecture — User-Facing Escalation
Built the full user-facing escalation flow (previously a dummy no-op):

**Database changes:**
- Added `escalation_reason TEXT` column to disputes table
- Added `'escalation'` value to `submission_type` enum

**Server action:** `escalateDispute()` in `apps/web/lib/disputes/actions.ts`:
- Either party can escalate when dispute is `in_progress`
- Validates via `escalationSchema` (Zod: dispute_id UUID, reason 20-2000 chars)
- Creates immutable `escalation` submission in dispute_submissions (audit trail + content hash)
- Updates dispute: status → `escalated`, `escalated_at`, `escalation_reason`
- Audit log entry with reason and escalator role
- Notifies BOTH parties via dedicated email template (fire-and-forget)

**Email template:** `dispute-escalated.ts` — sent to both parties. Shows escalator name, reason in a cream card with red left border. Explains: no further submissions, recommends external mediation (Civil Mediation Council) or solicitor. Uses standard Kestrel email layout.

**Modal UX:** Two-step modal with typed verification:
1. **Reason step:** Warning banner, textarea (20-2000 chars), character counter
2. **Confirm step:** Consequences listed (permanent status change, both parties notified, no further submissions, seek external advice). Reason displayed for review. **Two separate verification inputs:** user must type "escalate" in one field AND the full dispute reference number (e.g. KST-2026-00001) in a second field. Both must match exactly before the "Confirm escalation" button enables. Input borders turn red on mismatch.

**Design decisions:**
- No mediator marketplace yet — escalation is terminal. Recommends external professional mediation.
- Either party can escalate (not just initiating party) — both have standing
- Typed verification prevents accidental escalation (irreversible action)
- Constants updated: `escalation` added to SUBMISSION_TYPE_LABELS and STATUS_TRANSITIONS

## [2026-04-04] Architecture — Admin Portal Speed Optimisation
Applied 5 performance fixes to the admin panel:
1. **Loading skeletons**: Added `loading.tsx` files to all 9 admin routes for instant Suspense feedback
2. **React `cache()` on `getAdminUser`**: Per-request deduplication — layout + page calls only hit Supabase once
3. **`unstable_cache` on dashboard queries**: 60-second revalidation window for dashboard metrics
4. **Proxy API route bypass**: `/api/` routes skip auth/MFA checks in proxy (cron jobs handle own auth)
5. **TypeScript types regenerated** for new tables

## [2026-04-04] Database — Admin Portal Expansion Migrations
Applied 3 new migrations to Supabase (zyebrpcjdoyrckxbpicz):
1. `create_site_settings` — key-value settings table (jsonb values). Public read RLS (anonymous visitors), admin-only write RLS. Seeded with announcement + maintenance defaults.
2. `create_tool_usage_events` — anonymous/authenticated tool usage tracking. Public insert RLS, admin-only read RLS. Indexes on tool_name, user_id, created_at.
3. `add_score_to_leads` — added `score` (int), `score_breakdown` (jsonb), `last_scored_at` (timestamptz) to leads. Made `created_by` nullable for system-generated leads. Index on score DESC.

## [2026-04-04] Architecture — Announcement Bar
Admin-controlled announcement bar that renders on the main site:
- `packages/shared/supabase/site-settings.ts` — shared query helpers (getAnnouncementSettings, getSiteSetting, getAllSiteSettings)
- `apps/web/components/ui/announcement-bar.tsx` — server component, reads from site_settings, conditional render
- Integrated into both `(site)/layout.tsx` and `(tools)/layout.tsx` above Header
- Styles: info (kestrel green), warning (amber), success (sage green)
- Controlled via admin settings tab

## [2026-04-04] Architecture — Admin Settings Suite
Replaced placeholder settings page with full tabbed interface:
- **Announcement tab**: toggle, text (max 200), optional link, style selector, live preview
- **Feature Flags tab**: list all flags with inline toggles, add new flag form
- **Site Config tab**: maintenance mode toggle
- **Admin Team tab**: list admins, invite (super_admin only), change roles, remove
- Tab state stored in URL params (`?tab=`) for deep-linkability
- All mutations auth-gated via getAdminUser(), validated with Zod
- Admin team operations use service client (for auth.admin access)

## [2026-04-04] Architecture — Lead Scoring System
Automatic lead scoring from platform usage signals:
- `lib/leads/scoring.ts` — pure function `computeLeadScore()`: signed_up +20, onboarding +10, docs +5/each (cap 30), dispute +25, multi-tool +15, business name +10, recent activity +10. Max 120.
- Cron endpoint at `/api/cron/lead-scoring` (daily 03:00 UTC via vercel.json)
- Scores non-subscribed users, creates/updates leads for score > 20 with source "platform"
- Score displayed in leads table as color-coded badge (grey <30, kestrel 31-60, amber 61-90, sage 91+)

## [2026-04-04] Architecture — Google Places Lead Discovery
New page at `/leads/discover` for external lead sourcing:
- Search form: business type query + location + radius (5-50km)
- Calls Google Places Text Search API v1 server-side
- Results table: business name, address, phone, website, rating, reviews
- "Add as lead" button per result with deduplication by company name
- Added to leads with source "google_places", address/website/place_id in notes
- Env var: GOOGLE_PLACES_API_KEY required

## [2026-04-04] Architecture — Tool Usage Tracking
Fire-and-forget tool usage tracking via `apps/web/lib/tracking/tool-usage.ts`:
- Inserts into `tool_usage_events` table with tool_name, action, user_id (if authenticated), session_id, metadata
- Non-blocking — errors silently caught, never breaks user flow
- To be integrated into 7 tool pages for lead scoring data

## [2026-04-04] Architecture — AI Lead Scoring (Plan Fit Recommendation)
Added AI-powered plan-fit assessment that runs alongside the existing deterministic 120-point scoring system. When a lead is created (manual, cron, or Google Places), a Supabase Edge Function calls Claude Sonnet (pinned: claude-sonnet-4-20250514, temp 0) to recommend Free/Professional/Business plan with confidence level, reasoning, key signals, and sales talking points.

**Database:** Added `ai_assessment` (JSONB) and `ai_assessed_at` (timestamptz) columns to `leads` table.

**Edge Function:** `score-lead` — receives webhook payload on INSERT, enriches with Companies House API (free, no key) + website scrape (from notes URL), calls Anthropic API, writes assessment back. Best-effort enrichment (5s timeout, failures don't block). Returns 200 on all errors to prevent webhook retry storms.

**Admin UI:** `AiAssessmentCard` client component on lead detail page right column. Shows plan badge (colour-coded), confidence, reasoning, key signals, talking points, enrichment data, and "Re-score" button. Empty state with "Score now" button.

**Re-score API:** POST `/api/leads/[id]/score` — admin-auth guarded, calls the same Edge Function directly (single code path).

**Coexistence:** Deterministic score (engagement signals, 0-120) and AI assessment (plan recommendation) are fully independent. Different columns, different triggers, different update cadences.

**Env var needed:** `ANTHROPIC_API_KEY` in Supabase Edge Function secrets.
**Manual step:** Configure database webhook in Supabase Dashboard (leads INSERT → score-lead Edge Function).

## [2026-04-05] Architecture — Guided Tutorial for New Users
Added a 5-step guided tutorial that appears after onboarding for first-time users:
- **Trigger:** Shows on dashboard when `tutorial_completed` is false. Appears after the greeting splash finishes (2.6s delay).
- **Steps:** Welcome overview → Free Toolkit (6 tools) → Documents → Dispute Resolution → Profile & Settings
- **Each step:** Icon, title, subtitle, description, bullet-point details, optional action button that navigates to the relevant section
- **Skippable:** "Skip tutorial" link in top-right corner at every step
- **Persistence:** `tutorial_completed` boolean column on `profiles` table (default false). Set to true on skip or completion via `markTutorialComplete()` server action.
- **Session guard:** SessionStorage key `kestrel-tutorial-shown` prevents re-showing within same session even before DB write completes.
- **Reduced motion:** Respects `prefers-reduced-motion` — auto-marks as complete and skips entirely.
- **Dark mode:** Uses semantic tokens (`bg-cream`, `text-ink`, `bg-surface`, `text-text-secondary`, `bg-kestrel/10`, etc.) so it automatically works in both light and dark.
- **Animations:** Framer Motion AnimatePresence with slide transitions matching onboarding flow (EASE_OUT_EXPO). Step progress bar uses expanding dots.
- **Component:** `components/app/guided-tutorial.tsx` (client component, ~300 lines)
- **z-index:** 90 (below greeting splash at 100, above sidebar at 50)
- **Action buttons:** Each step (except welcome) has a secondary button to navigate directly to that section, which dismisses the tutorial first.

Database: Applied `add_tutorial_completed_to_profiles` migration. TypeScript types updated in both `packages/shared` and `apps/web`.

## [2026-04-05] Security — RLS & Function Security Hardening (5 Migrations)

Applied 5 security and performance migrations to Supabase (zyebrpcjdoyrckxbpicz):

### Migration 1: `add_email_verifications_rls_policies`
The `email_verifications` table had RLS enabled but zero policies. Added:
- Service role: full access (FOR ALL, service creates these server-side)
- Authenticated users: SELECT where `recipient_email` matches JWT email (subselect pattern)
- Anon users: SELECT by code (for email verification links)
- No public INSERT/UPDATE/DELETE

### Migration 2: `tighten_update_policies_on_free_tool_tables`
Replaced overly permissive `USING (true)` UPDATE policies on handshakes, notices, projects, and milestones. New policies enforce:
- **handshakes**: UPDATE by `x-access-token` header match OR authenticated party (party_a_user_id / party_b_user_id)
- **notices**: UPDATE by access_token OR authenticated sender (sender_user_id)
- **projects**: UPDATE by access_token OR authenticated party
- **milestones**: UPDATE via parent project accessibility (EXISTS subquery)
Note: API routes use service role client (bypasses RLS), so these are defence-in-depth for any direct PostgREST access.

### Migration 3: `fix_function_search_path`
Added `SET search_path = ''` to both PL/pgSQL functions:
- `update_updated_at_column()` (trigger function)
- `generate_dispute_reference()` (dispute reference sequence)
Prevents search_path injection attacks per Supabase security advisor.

### Migration 4: `wrap_auth_calls_in_subselect_for_rls_performance`
Dropped and recreated 17 RLS policies to wrap `auth.uid()` and `auth.jwt()` in `(select ...)` subselects. This ensures auth functions are evaluated once per query instead of once per row -- critical for performance at scale. Affected tables: admin_users, audit_log, dispute_mediator_requests, dispute_submissions, disputes, evidence_files, notifications, onboarding_responses, profiles, saved_documents, site_settings, subscriptions, tool_usage_events.
Excluded: leads, lead_interactions (already correct), email_verifications (already correct from Migration 1).

### Migration 5: `wrap_auth_calls_in_subselect_insert_policies`
Follow-up to Migration 4 -- fixed 6 INSERT policies that were missed in the initial pass: disputes (Initiator creates disputes), dispute_submissions (Parties create submissions), evidence_files (Parties upload evidence), dispute_mediator_requests (Parties create mediator requests), onboarding_responses (Users can insert own onboarding response), site_settings (Admins can insert site settings).

**Verification:** Final query against `pg_policies` confirmed zero remaining bare `auth.uid()` or `auth.jwt()` calls across all public schema policies. Supabase security advisor shows no new RLS-related issues (remaining warnings are intentional: permissive INSERT on free tool tables, leaked password protection is a dashboard setting).

## [2026-04-06] Architecture — Maintenance Mode Fix
The admin panel could toggle maintenance_mode in site_settings, but the web app never checked it. Added `isMaintenanceMode()` check in all three user-facing layouts: `(site)`, `(tools)`, `(app)`. When enabled, a full-screen branded maintenance page replaces all content. Auth routes remain accessible (admin can still sign in). Admin panel is unaffected (separate app). Also reset the accidentally-enabled maintenance_mode flag in the database.

## [2026-04-06] Product — Privacy Policy & Terms of Service Rewrite
Comprehensive rewrite of both /privacy and /terms pages to include proper liability limitation clauses:
- **Terms:** 16 numbered sections. Key additions: "What Kestrel is not" (no legal advice disclaimer), limitation of liability (cap at greater of 12-month fees or £100, excludes indirect/consequential damages), indemnification clause, IP ownership, paid services & refunds, acceptable use, severability.
- **Privacy:** 12 numbered sections. Key additions: sub-processor table (Supabase, Vercel, Resend, Stripe, GA), lawful basis stated per data category, data retention for payment records (7 years) and audit logs (6 years), limitation of liability for data processing, ICO complaints guidance, cookies section.
Both written in professional-but-plain language. Preserve Kestrel brand voice (not aggressive legalese).

## [2026-04-06] Security — Full Sweep Hardening
Comprehensive security audit and remediation:
1. **Open redirect fix**: Replaced string-matching redirect validation in auth callback/confirm routes with URL-parsing approach (`lib/security/redirect.ts`). Handles encoded slashes, protocol-relative URLs, and other bypass techniques.
2. **Account enumeration fix**: Unified all auth error messages in `signInWithPassword` and `signUpWithPassword` to prevent distinguishing "no account" from "wrong password" or "unconfirmed email". Sign-up with existing email now returns fake success.
3. **CSP hardening**: Removed `'unsafe-eval'` from both web and admin CSP headers. Added `https://js.stripe.com` to script-src and `https://api.stripe.com` to connect-src for embedded payment forms.
4. **Evidence upload hardening**: Added cumulative file count (MAX_EVIDENCE_FILES=10) and total size (MAX_TOTAL_EVIDENCE_BYTES=100MB) enforcement across entire dispute. Added server-side file magic byte verification (`lib/security/file-validation.ts`) — checks PDF, PNG, JPEG, DOCX/XLSX headers match declared MIME type.
5. **RLS performance migration**: Applied `wrap_remaining_auth_calls_in_subselect_v2` — fixed 20 RLS policies across leads, lead_interactions, email_verifications, handshakes, handshake_terms, handshake_responses, notices, projects, milestones, profiles, disputes, dispute_submissions, evidence_files. Dropped duplicate index on lead_interactions.
6. **Supabase advisors**: Reviewed all security and performance findings. Remaining intentional warnings: permissive INSERT on free tool tables (anonymous-first design), leaked password protection (dashboard setting to enable manually).

## [2026-04-06] Architecture — Voluntary MFA for Regular Users
Added optional TOTP-based two-factor authentication for regular (non-admin) users:
- **Enrollment**: New `/settings/security` page with `MfaSettings` client component. Users can enable MFA by scanning a QR code (Supabase `mfa.enroll()`), entering a 6-digit code to verify, and the session is upgraded to aal2.
- **Sign-in flow**: `signInWithPassword` server action now checks AAL after successful sign-in. If user has MFA enrolled (currentLevel=aal1, nextLevel=aal2), redirects to `/mfa/verify` instead of dashboard.
- **Verification**: New `(auth)/mfa/verify/page.tsx` — client component, loads verified TOTP factor, challenges and verifies code, upgrades session to aal2, redirects to dashboard.
- **Disable**: Users can unenroll their TOTP factor from the security settings page.
- **Not mandatory**: Unlike admin panel (mandatory MFA), regular users choose whether to enable it. No proxy-level AAL enforcement for regular users.
- Settings sidebar updated across all three settings pages (Profile, Security, Billing).

## [2026-04-06] Architecture — Stripe Custom Checkout Integration
Completed Stripe integration harnessing for custom on-site checkout (no redirect to Stripe-hosted checkout):
- **New API route**: `api/stripe/create-subscription` — creates a Stripe subscription with `payment_behavior: 'default_incomplete'`, returns `clientSecret` for the PaymentIntent.
- **Checkout component**: `components/app/billing/checkout-form.tsx` — uses `@stripe/react-stripe-js` Elements with PaymentElement. Kestrel-branded appearance (ink/kestrel colours, DM Sans font, border radius matching design tokens).
- **Webhook improvements**: Added `customer.subscription.created` and `invoice.payment_succeeded` handlers. Improved plan detection — `planFromPriceId()` matches against env var price IDs. Upsert with user_id from metadata on subscription.created.
- **Billing page**: Dynamic — fetches real subscription data from DB, shows plan name/status/next billing date, success banner after upgrade, working "Open billing portal" button (Stripe Customer Portal).
- **Dependencies**: Installed `@stripe/stripe-js` and `@stripe/react-stripe-js`.
- **CSP**: Added `js.stripe.com` to script-src and `api.stripe.com` to connect-src.
- **Env vars needed**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` for client-side Elements.
- Old checkout route (redirect-based) preserved as fallback — can be removed once custom checkout is validated.

## [2026-04-07] Product — Pricing model formalised (PRICING.md adopted)

The previous placeholder pricing (Single Case £49, Professional £29/mo, Business £79/mo on /pricing; matching subscription scaffold) was scrapped. Replaced with the founder's `PRICING.md` model (Draft v1, dated April 2026) which is now canonical at the project root alongside `CONTEXT.md`.

**Headline shape:**
- Free tools stay free, forever, no sign-up gate.
- Per-dispute fees in four tiers, set by declared dispute value:
  - Small (≤£1,000): £35 per party
  - Standard (£1,000–£10,000): £75 per party
  - Larger (£10,000–£25,000): £150 per party
  - Complex (£25,000+): £250 base + 0.5% above £25k, capped at £1,500/party
- **Good-faith refund**: respondent's fee is fully refunded if they pay within 14 days of notification, submit a substantive (≥100-word) response, and the dispute resolves within 14 days of them joining. Manual at MVP, automated by Y2.
- **Withdrawal refunds** per §4.4: pre-notification = full refund minus £5 Stripe retention; post-notification = no refund to claimant, full refund to respondent if paid.
- **Counter-claims**: filed as a separate dispute with `parent_dispute_id` link.
- **Kestrel Pro subscription**: deferred to Year 2. PRICING.md §7 still uses the working name "Pellar Pro" — rename noted with editor's note at top of PRICING.md.

**Files deleted (subscription scaffold removed):**
- `apps/web/lib/stripe/config.ts`
- `apps/web/app/api/stripe/checkout/route.ts`
- `apps/web/app/api/stripe/create-subscription/route.ts`
- `apps/web/app/api/stripe/portal/route.ts`
- `apps/web/components/app/billing/checkout-form.tsx`
- `apps/web/app/(app)/settings/billing/billing-actions.tsx`

The `subscriptions` DB table is preserved (dormant) for the Year 2 Kestrel Pro launch.

**New pricing core (`packages/shared/pricing/`):**
- `config.ts` — single source of truth for tier values (`YEAR_1_TIERS`), refund windows, Stripe statement descriptor, currency. All amounts integer pence, no floats. NEVER hardcode prices outside this file.
- `types.ts` — `TierId`, `PartyRole`, `PaymentPurpose`, `PaymentStatus`, `FeeQuote`, `TierBumpQuote`, `GoodFaithEligibilityResult`.
- `tiers.ts` — pure functions: `resolveTier()`, `quoteFee()` (handles Complex marginal + cap), `quoteTierBump()`, `evaluateGoodFaithRefund()` (the four-criterion predicate), `quoteWithdrawalRefund()`.
- `format.ts` — `formatGBP()`, `formatGBPCompact()`, `formatTierLabel()`, `formatTierRange()`.
- `apps/web/lib/pricing/{tiers,format,types,schemas}.ts` — re-export shells (so apps/web imports stay stable). `schemas.ts` adds Zod schemas for the future payment API route bodies.
- `apps/web/lib/pricing/__tests__/tiers.test.ts` — 45 unit tests pinning every PRICING.md §4/§5 rule including boundary cases (£999 → small, £1000 → standard, £25,001 → complex with 1p marginal, £325,000 → capped, refund eligibility for each criterion). All green via `npx vitest run lib/pricing`.

**Database migrations applied via Supabase MCP (project zyebrpcjdoyrckxbpicz):**
1. `add_pricing_enums` — `dispute_tier_id`, `dispute_payment_status`, `dispute_payment_party_role`, `dispute_payment_purpose`.
2. `add_pricing_columns_to_disputes` — added `tier_id`, `tier_locked_at`, `claimant_payment_status`, `claimant_paid_at`, `respondent_payment_status`, `respondent_paid_at`, `respondent_engagement_recorded_at`, `parent_dispute_id` (all nullable, fully backwards-compatible with legacy disputes).
3. `create_dispute_payments_table` — Stripe payment ledger. RLS: parties can `SELECT` their own dispute's payment rows; no public INSERT/UPDATE/DELETE (writes are service-role-only via webhook handlers and admin actions).
4. `create_dispute_payments_indexes_and_trigger` — `(dispute_id, party_role)` index, partial index on `stripe_payment_intent_id` and on active statuses, `updated_at` trigger.
5. `add_pricing_fk_covering_indexes` — covering indexes for `disputes.parent_dispute_id` and `dispute_payments.refund_processed_by` to satisfy advisor lint 0001.

TypeScript types regenerated and synced into both `packages/shared/supabase/types.ts` and `apps/web/lib/supabase/types.ts`. Supabase security advisor: zero new warnings on the new tables (the eight remaining warnings are all pre-existing and intentionally accepted per §2026-04-06 hardening sweep). Performance advisor: no new issues after the FK covering-index migration.

**Public `/pricing` page rewrite (`apps/web/app/(site)/pricing/page.tsx`):**
Three sections: free tools grid (six tools), four dispute fee tier cards (Standard tier highlighted as "Most common"), and a Kestrel Pro placeholder card ("Coming later"). All tier values pulled from `YEAR_1_TIERS` via `quoteFee()` — zero hardcoded prices. Includes a prominent good-faith refund callout and a §6.4-compliant "What the fee buys" disclaimer.

**Billing & receipts page rewrite (`apps/web/app/(app)/settings/billing/page.tsx`):**
Removed all subscription/plan UI. Replaced with a "How Kestrel charges" explainer card, a "Dispute fee history" table (queries `dispute_payments` joined to `disputes`, falls back to empty state if the table is missing or the user has no payments), and a Kestrel Pro placeholder. No more Stripe portal button (no subscriptions to manage).

**Stripe webhook handlers rewrite (`apps/web/lib/stripe/webhook-handlers.ts`):**
Removed all five subscription handlers. Added three new handlers, all idempotent and using `createServiceClient`:
- `payment_intent.succeeded` → marks `dispute_payments.status = 'succeeded'`, captures `latest_charge`, updates `disputes.{role}_payment_status` and `{role}_paid_at`. Logs a TODO for the Phase 6 respondent notification email trigger (deferred until Stripe IDs).
- `payment_intent.payment_failed` → marks status `failed`.
- `charge.refunded` → distinguishes `refunded` vs `partially_refunded` from `amount_refunded` vs `amount`, updates the row and the dispute. Idempotent.

**Admin pricing tooling (apps/admin/):**
- `lib/admin/pricing-queries.ts` — `getDisputePayments()`, `getDisputeFeeSummary()`. The summary aggregates dispute + payment rows + most-recent respondent response word count, then runs `evaluateGoodFaithRefund()` and decorates the result with per-criterion human-readable labels for the UI.
- `lib/admin/pricing-actions.ts` — server actions: `processGoodFaithRefund()`, `processWithdrawalRefund()`, `manuallyAdjustTier()`. All gated behind `getAdminUser()` (existing aal2 + admin claim). All audit-logged. The actual `stripe.refunds.create()` call is **deferred** — code is structured so the Stripe step is a single TODO block to uncomment when live keys land. The DB row is marked `refunded` immediately so the admin UI is consistent.
- `components/admin/dispute-fee-panel.tsx` — slotted into the right column of `apps/admin/app/(admin)/disputes/[id]/page.tsx`, above the Timestamps card. Shows tier, claimant + respondent payment badges, the four-item good-faith refund eligibility checklist (with detail per criterion), "Process good-faith refund" button (disabled unless eligible), "Process withdrawal refund" button. Both call server actions that re-evaluate eligibility server-side — never trusting the client checklist.

**New email templates (`apps/web/lib/email/templates/`):**
- `payment-receipt.ts` — receipt-style email. Variant copy for claimant vs respondent; respondent variant includes good-faith refund reminder.
- `refund-issued.ts` — admin-triggered refund email with three variants: `good_faith` (appreciative), `withdrawal` (factual), `manual` (neutral).
- `dispute-payment-required.ts` — replaces `dispute-filed.ts` for the respondent path once Phase 6 wires the new flow. Headline leads with the good-faith refund mechanic, NOT the fee. Pulls all fee/window values from `@kestrel/shared/pricing/config`.

**Documentation:**
- `PRICING.md` added to project root with editor's note about the Pellar Pro → Kestrel Pro rename.
- `CLAUDE.md` documentation table updated with PRICING.md row.
- `CONTEXT.md` Pricing Model section replaced with a one-paragraph pointer to PRICING.md.

**Verification:**
- 45 pricing unit tests pass: `cd apps/web && npx vitest run lib/pricing`
- `apps/web` builds clean: `npx turbo build --filter=@kestrel/web` (6.7s)
- `apps/admin` builds clean: `npx turbo build --filter=@kestrel/admin` (6.3s)
- Zero new TypeScript errors in pricing/admin files. Pre-existing admin TS errors (in `disputes/page.tsx`, `leads/page.tsx`, `dispute-queries.ts`, `leads/actions.ts`, `discover-actions.ts`) are unaffected and predate this change.
- Supabase advisors: zero new security/performance warnings on `dispute_payments` or the new `disputes` columns.

**Deferred to Phase 6 (per founder instruction — wait for live Stripe IDs):**
- Per-dispute payment API routes (`/api/disputes/[id]/payment/initiate` etc.)
- Adding a payment step to the dispute filing wizard
- Wiring `fileDispute()` to call `resolveTier()` and create the `dispute_payments` row
- Triggering the respondent notification email from the webhook on claimant payment success
- Triggering refund-issued emails from the admin actions
- Activating the Stripe SDK call inside `processGoodFaithRefund()` and `processWithdrawalRefund()` (currently a clear TODO block; the row is marked refunded and audit-logged but no money moves)
- Adding the `stripe` package to `apps/admin` (only needed when the SDK calls are uncommented)

**Open questions to resolve before merging Phase 6:**
1. Co-founder review of the §6.4 "what the fee buys" language as it appears on /pricing and in the new `dispute-payment-required.ts` email.
2. Tier-bump trigger UX for the respondent — PRICING.md §4.1 says they "contest" upward but doesn't specify the mechanism. Likely a structured `tier_challenge` submission type added in Phase 6.
3. Multi-respondent disputes (§4.4) — current schema has a single `responding_party_id`. Out of scope for this rewrite; tracked as a follow-up.
4. Statement descriptor `KESTREL DISPUTE FEE` is referenced in code (`STRIPE_STATEMENT_DESCRIPTOR` constant) but must also be configured in the Stripe Dashboard before going live.
5. Admin app does not yet have a `stripe` SDK dependency. Add it when uncommenting the deferred refund Stripe calls.
