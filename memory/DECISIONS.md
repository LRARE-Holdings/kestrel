# Decisions Log

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

## [2026-04-03] Architecture — Auth Methods Confirmed
Final auth lineup:
1. **Google OAuth** — social login via Supabase `signInWithOAuth({ provider: 'google' })`
2. **Microsoft OAuth** — social login via Supabase `signInWithOAuth({ provider: 'azure' })`
3. **Email + password** — traditional sign-up/sign-in via Supabase `signUp` / `signInWithPassword`
4. **Enterprise SSO (SAML/OIDC)** — for companies with own IdP, via Supabase SSO (Pro plan feature) or WorkOS
5. **Passkeys** — deferred until Supabase ships native support or founder decides on custom implementation
No magic link. SECURITY.md and auth code to be updated accordingly.
