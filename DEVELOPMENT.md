# Development Guide

## Prerequisites

- Node.js 20+ (LTS)
- pnpm (preferred) or npm
- Docker (for local Supabase)
- Supabase CLI (`npx supabase@latest`)
- Git

## Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd kestrel

# Install dependencies
pnpm install

# Start local Supabase (PostgreSQL, Auth, Storage, Studio)
npx supabase start

# Copy environment template and fill in local values
cp .env.example .env.local

# Apply database migrations
npx supabase db push

# Seed development data (optional)
pnpm db:seed

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.
Supabase Studio (database GUI) will be at `http://localhost:54323`.

## Environment Variables

```env
# .env.local (never committed)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
RESEND_API_KEY=<your test key>
SENTRY_DSN=<your project DSN>
```

`NEXT_PUBLIC_` variables are exposed to the browser. Never put secrets in `NEXT_PUBLIC_` variables.

## Project Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript compiler (no emit) |
| `pnpm test` | Run Vitest |
| `pnpm test:watch` | Run Vitest in watch mode |
| `pnpm db:seed` | Seed local database with test data |
| `pnpm db:reset` | Reset local database and reapply migrations |
| `pnpm db:migrate` | Create a new migration file |
| `pnpm clauses:validate` | Validate clause library integrity |
| `pnpm clauses:checksum` | Generate clause integrity checksums |

## Branch Strategy

```
main          ← production (auto-deploys to production)
├── staging   ← pre-production (auto-deploys to staging)
└── feat/*    ← feature branches (deploy to Vercel preview)
    fix/*     ← bug fixes
    docs/*    ← documentation only
    chore/*   ← tooling, deps, config
```

All work happens on feature branches. PRs target `staging`. Staging is promoted to `main` after testing.

## PR Checklist

Every pull request must satisfy:

- [ ] TypeScript compiles with no errors (`pnpm typecheck`)
- [ ] ESLint passes with no warnings (`pnpm lint`)
- [ ] All tests pass (`pnpm test`)
- [ ] New database tables have RLS policies
- [ ] New personal data fields are flagged for GDPR review
- [ ] No hardcoded pricing, no hardcoded legal text
- [ ] Free tools remain usable without authentication
- [ ] Commit messages follow conventional commits
- [ ] PR description explains what and why (not just what)

## Clause Library Development

The clause library lives in `/lib/clauses/` and follows strict rules:

1. **Never use AI to write clause text.** All legal language is human-authored and reviewed.
2. **Every clause has a unique, stable ID.** IDs never change once published.
3. **Clause versions are semver.** Breaking changes (text meaning changes) are major bumps.
4. **Run `pnpm clauses:validate` after any change.** This checks for:
   - Dangling references (clauses referencing non-existent dependencies)
   - Circular dependencies
   - Missing required variables
   - Incompatibility conflicts
   - Checksum integrity

## Testing Strategy

### What to Test

| Category | Tool | What |
|---|---|---|
| Clause assembly | Vitest (unit) | Every clause combination produces valid output |
| Validation schemas | Vitest (unit) | Zod schemas accept valid data, reject invalid |
| Utility functions | Vitest (unit) | Pure functions with edge cases |
| Dispute workflows | Vitest (integration) | Filing → response → resolution flow |
| RLS policies | Vitest (integration) | Cross-party access attempts fail |
| API routes | Vitest (integration) | Auth, validation, error handling |

### What Not to Test

- Simple React components with no logic
- Third-party library behaviour
- Supabase internal functionality
- CSS/styling

### Running Tests

```bash
# All tests
pnpm test

# Watch mode (re-runs on file change)
pnpm test:watch

# Specific file
pnpm test -- lib/clauses/assembler.test.ts

# With coverage
pnpm test:coverage
```

## Debugging

### Local Supabase

```bash
# Check Supabase status
npx supabase status

# View database logs
npx supabase db logs

# Open Supabase Studio (database GUI)
# http://localhost:54323

# Reset everything (nuclear option)
npx supabase stop
npx supabase start
npx supabase db push
pnpm db:seed
```

### Common Issues

**"Permission denied" on dispute queries:**
RLS policy is blocking access. Check that the test user is a named party on the dispute. Use Supabase Studio to inspect RLS policies.

**Clause assembly returns empty document:**
Run `pnpm clauses:validate` to check for broken dependencies. Check that the condition logic matches the test inputs.

**Auth emails not arriving locally (confirmation, password reset):**
Supabase local auth captures emails in Inbucket: `http://localhost:54324`. Check there instead of your real inbox.

---

## Documentation Map

| File | Purpose | Read When |
|---|---|---|
| `context.md` | What Kestrel is, business logic, brand | Starting work on the project |
| `claude.md` | Claude Code instructions, tech stack, conventions | Before writing any code |
| `agents.md` | AI usage policy, agent boundaries | Building or modifying AI features |
| `ARCHITECTURE.md` | System design, data flow, infrastructure | Making structural decisions |
| `FREE_TOOLS.md` | Specs for all six free tools | Building or modifying any free tool |
| `SECURITY.md` | GDPR, threat model, compliance | Handling data, auth, or file uploads |
| `DATABASE.md` | Schema, RLS, migrations | Working with the database |
| `DEVELOPMENT.md` | This file — setup, workflow, debugging | Getting started |