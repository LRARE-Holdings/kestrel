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
