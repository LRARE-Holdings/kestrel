# CLAUDE.md — Kestrel Build Instructions

You are building **Kestrel**, an online dispute resolution platform for businesses in England and Wales. This is a legal technology product. Trust, determinism, and data isolation are existential requirements — not nice-to-haves.

## First Action: Initialise Memory

Before doing anything else, create the `/memory` directory and initialise these files if they do not already exist:

```
/memory/
├── decisions.md    # Every architectural, product, or technical decision with rationale and date
├── people.md       # Team members, stakeholders, investors, contacts referenced in conversation
├── preferences.md  # User's coding style, communication preferences, workflow preferences
└── user.md         # User profile: founder context, background, current status, goals
```

**Memory rules:**
- Read all memory files at the start of every session
- Append to the appropriate file whenever a decision is made, a preference is expressed, or new context is shared
- Never overwrite — always append with a timestamp and category
- Format entries as `## [YYYY-MM-DD] Category — Title` followed by the detail
- If the user corrects you, log the correction in decisions.md as a reversal with the original and corrected position
- Memory files are the single source of truth for project history — treat them as sacred

### Initial user.md content (populate on first run):

```markdown
# User Profile

## Founder
- Founder of Pellar Technologies, Newcastle-upon-Tyne
- Law student at Northumbria University (human rights, tort law, innovation/technology law)
- Member of North East Chamber of Commerce
- Attends Tech Builders NCL
- Building Kestrel as a VC-backable product under Pellar, to be separately incorporated

## Current Status
- Pre-build phase: documentation complete, approaching Mercia Ventures NE Accelerate Fund
- Supabase project provisioned (ID: zyebrpcjdoyrckxbpicz)
- No code written yet — greenfield build
```

---

## Documentation (Read These First)

These files contain all product, technical, and business context. Read them before writing any code:

| File | Purpose | Read when |
|---|---|---|
| `context.md` | What Kestrel is, business logic, regulatory position, brand, pricing | Always — before any work |
| `agents.md` | AI usage policy, agent boundaries, evaluation requirements | Before building any AI feature |
| `ARCHITECTURE.md` | System design, data flow, clause library architecture, infrastructure | Before structural decisions |
| `SECURITY.md` | GDPR, threat model, encryption, incident response | When handling data, auth, uploads |
| `DATABASE.md` | Schema, RLS policies, migrations, indexes | When working with the database |
| `FREE_TOOLS.md` | All six free tools: specs, flows, inputs, outputs, priorities | When building any free tool |
| `DEVELOPMENT.md` | Setup, scripts, branch strategy, PR checklist, testing | Getting started and contributing |

If a decision contradicts these docs, **ask the user** before proceeding. Do not silently override documented decisions.

---

## Connected Services

### Supabase MCP
- **Project ID:** `zyebrpcjdoyrckxbpicz`
- Use the Supabase MCP tools for all database operations: migrations, SQL execution, edge functions, type generation
- **Always use `apply_migration`** for schema changes — never raw SQL executed directly against production
- **Always enable RLS** on every new table immediately after creation
- Run `generate_typescript_types` after any schema change to keep types in sync
- Use `list_tables` to verify state before and after migrations
- Check `get_advisors` periodically for security and performance recommendations

### Available Skills

#### Ruflo (Multi-Agent Orchestration)
Read the Ruflo SKILL.md before starting any complex build task. Ruflo is critical for this project — Kestrel is too large to build sequentially. Use Ruflo for:

- **Parallel component development:** Build multiple UI components simultaneously (e.g., all base UI primitives in one pass)
- **Full-stack parallel execution:** Frontend components + API routes + database migrations + validation schemas in one coordinated batch
- **Hierarchical agent topology** for complex features: Architect agent coordinates Frontend, Backend, Database, and Test agents working concurrently
- **Batch file creation:** When scaffolding a new free tool, create all files (page, component, API route, Zod schema, types, tests) in parallel via BatchTool
- **Quality gates:** Route dispute-related code through a Security Reviewer agent before merge
- **Swarm patterns for research tasks:** When building the clause library, use parallel agents to scaffold all clause modules simultaneously

**Ruflo configuration for Kestrel:**
```yaml
kestrel_topology:
  type: hierarchical
  max_agents: 8
  strategy: balanced
  coordinator:
    role: System Architect
    focus: [architecture, task-decomposition, quality-gates]
  agents:
    - type: coder
      name: Frontend Developer
      capabilities: [next.js, react, tailwind, typescript]
      constraints: [use-kestrel-design-tokens, no-default-exports, server-components-first, no-inter-font]
    - type: coder
      name: Backend Developer
      capabilities: [supabase, api-routes, rls-policies, edge-functions]
      constraints: [always-rls, parameterised-queries, zod-validation, no-raw-sql-in-app]
    - type: coder
      name: Clause Engineer
      capabilities: [typescript, conditional-logic, document-assembly, pdf-generation]
      constraints: [no-ai-generation, deterministic-only, human-authored-legal-text]
    - type: tester
      name: QA Engineer
      capabilities: [vitest, integration-tests, rls-verification, cross-party-isolation]
    - type: reviewer
      name: Security Reviewer
      capabilities: [rls-audit, data-isolation, gdpr-compliance, file-upload-validation]
```

**When to use Ruflo vs sequential work:**
- **Use Ruflo** for: scaffolding new features, building UI component libraries, full-stack feature development, test suite generation, multi-file refactors
- **Work sequentially** for: clause library text (needs human review), security policy changes, single-file bug fixes, database migration design (think first, execute once)

#### Frontend Design Skill (Anthropic)
Read the frontend-design SKILL.md for all user-facing UI work. But **override its aesthetic defaults** with Kestrel's brand:

**Kestrel design direction:** Calm, self-assured, modern luxury legal. Not AI startup. Not cyberpunk. Not corporate bland. Quiet competence — the visual equivalent of a confident professional who doesn't need to shout.

**Mandatory design tokens** (these override any skill defaults):
```css
:root {
  --font-display: 'Instrument Serif', serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --color-ink: #0C1311;
  --color-kestrel: #2B5C4F;
  --color-kestrel-hover: #234A40;
  --color-sage: #7FA691;
  --color-warm: #C4B5A0;
  --color-stone: #E8E2D8;
  --color-cream: #F6F3EE;
  --color-text-primary: var(--color-ink);
  --color-text-secondary: #4A5553;
  --color-text-muted: #7A8583;
  --color-bg-page: var(--color-cream);
  --color-bg-card: #FFFFFF;
  --color-bg-elevated: var(--color-stone);
  --color-border: #D4CEC6;
  --color-border-subtle: #E8E2D8;
  --color-accent: var(--color-kestrel);
  --color-success: var(--color-sage);
  --color-error: #B54444;
  --color-warning: #C4943A;
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem;
  --space-4: 1rem; --space-6: 1.5rem; --space-8: 2rem;
  --space-12: 3rem; --space-16: 4rem; --space-24: 6rem;
  --radius-sm: 0.375rem; --radius-md: 0.5rem;
  --radius-lg: 0.75rem; --radius-xl: 1rem;
  --shadow-sm: 0 1px 2px rgba(12, 19, 17, 0.05);
  --shadow-md: 0 4px 12px rgba(12, 19, 17, 0.08);
  --shadow-lg: 0 8px 24px rgba(12, 19, 17, 0.12);
}
```

**Tailwind extension:**
```js
colors: {
  ink: '#0C1311',
  kestrel: { DEFAULT: '#2B5C4F', hover: '#234A40' },
  sage: '#7FA691',
  warm: '#C4B5A0',
  stone: '#E8E2D8',
  cream: '#F6F3EE',
  border: { DEFAULT: '#D4CEC6', subtle: '#E8E2D8' },
  error: '#B54444',
  warning: '#C4943A',
}
```

Never use Inter, Roboto, Arial, or system fonts. Never use purple gradients. Never use generic card-grid layouts.

---

## Critical Rules (Non-Negotiable)

### 1. No AI-Generated Legal Text
All legal language comes from `/lib/clauses/`. Deterministic conditional logic. Same inputs = same document. No LLM calls for legal content at runtime.

### 2. No Auth Gates on Free Tools
Every free tool at `/tools/*` works without sign-up. Auth adds value but is never a gate.

### 3. Row Level Security on Every Table
No exceptions. Include RLS policies in every migration.

### 4. Dispute Data Isolation
Party A never sees Party B's data. Enforced via RLS, not application code.

### 5. ICO/GDPR Compliance
Flag new personal data fields explicitly. Document retention periods. Build SAR export early.

### 6. England & Wales Only
No multi-jurisdiction abstractions until explicitly told otherwise.

### 7. No Hardcoded Pricing
Configuration or environment variables only.

### 8. Kestrel Dispute Clause Defaults
ON by default. Always visible. One-click removable. No dark patterns.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | TypeScript strict, server components default |
| Database | Supabase (PostgreSQL) | MCP connected: `zyebrpcjdoyrckxbpicz` |
| Auth | Supabase Auth | Magic link only |
| Storage | Supabase Storage | Evidence files, documents |
| Styling | Tailwind CSS | Kestrel design tokens |
| Validation | Zod | Every boundary |
| Forms | react-hook-form + zodResolver | All forms |
| Testing | Vitest | Unit + integration |
| Deployment | Vercel | Edge where appropriate |
| Email | Resend | Transactional only |
| Monitoring | Sentry | From day one |

---

## Build Sequence

### Phase 0: Foundation
Use Ruflo parallel execution:
1. Init Next.js 15 + TypeScript strict
2. Tailwind + Kestrel tokens
3. Supabase client setup (server + browser)
4. Apply ALL initial migrations from DATABASE.md via Supabase MCP
5. Generate TypeScript types
6. Base UI components: Button, Input, Card, Badge, Toggle, Modal, Select, Textarea
7. Layouts: Header, Footer, shells for (marketing), (tools), (app)
8. Sentry, ESLint, Prettier, Vitest
9. `/memory` directory + initial files
10. Log decisions

### Phase 1: Late Payment Toolkit (SHIP FIRST — show to Mercia)
Ruflo parallel:
- **Frontend:** Calculator UI + letter selector + document preview
- **Backend:** Interest calculation + PDF generation route
- **Clause:** 4-stage letter templates + Kestrel clause integration
- **Tests:** Calculator accuracy, clause toggle, PDF output

### Phase 2: Contract Templates
Ruflo parallel:
- **Clause library:** Shared definitions, boilerplate, dispute clause, freelancer + general service clauses
- **Frontend:** Type selector, questionnaire, live preview, clause toggle
- **Backend:** Assembler engine, PDF/DOCX renderer, download API
- **Tests:** Clause combinations, dependency resolution, conflict detection

### Phase 3: Auth + Dashboard
- Supabase Auth magic link
- Profile creation
- Dashboard shell
- Document saving for authenticated users

### Phase 4: Handshake Tool
- Party A creation flow
- Shareable link
- Party B confirmation (no auth)
- Email notifications

### Phase 5: Dispute Resolution
- Filing, communication, evidence, status, escalation

### Phase 6: Remaining Tools
- T&C Generator, Notice Log, Milestone Tracker

---

## Supabase MCP Workflow

```
Schema change:
1. Draft migration SQL (include RLS)
2. Supabase MCP → apply_migration
3. Supabase MCP → list_tables (verify)
4. Supabase MCP → generate_typescript_types
5. Update src/lib/supabase/types.ts
6. Log in /memory/decisions.md

Querying:
1. Supabase client query builder (never raw SQL in app)
2. Trust RLS — don't duplicate filtering
3. .single() for single-row, handle null/error
4. Always: const { data, error } = await ...
```

---

## Memory Update Triggers

| Trigger | File | Format |
|---|---|---|
| Tech/arch decision | decisions.md | `## [date] Architecture — [title]` |
| Product decision | decisions.md | `## [date] Product — [title]` |
| User preference | preferences.md | `## [date] [category] — [detail]` |
| Correction | decisions.md | `## [date] Correction — [old] → [new]` |
| Person mentioned | people.md | `## [name] — [role]` |
| Personal context | user.md | Append under section |
| Migration applied | decisions.md | `## [date] Database — [name]` |
| Dependency added | decisions.md | `## [date] Dependency — [pkg] for [why]` |

---

## Before Every Task

1. Read `/memory/*.md`
2. Read relevant docs
3. Complex build → Ruflo SKILL.md → parallel execution
4. UI work → frontend-design SKILL.md → Kestrel tokens
5. Personal data → flag GDPR, check SECURITY.md
6. Legal text → clause library only
7. After → update `/memory/decisions.md`

---

## What NOT to Build

- AI legal advice or document analysis
- Internal mediation/arbitration
- Multi-currency/jurisdiction
- Social features
- Native mobile apps
- Blockchain/NFT/crypto
- Admin panel (use Supabase Studio)
- Complex RBAC (unauth + auth only)
- Anything from Phase 2+ of five-year roadmap