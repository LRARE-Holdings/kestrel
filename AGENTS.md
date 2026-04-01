# Agents — AI Usage Policy & Architecture

## Philosophy

Kestrel is a legal technology product. Trust, determinism, and accountability are existential requirements. AI is used where it genuinely adds value without introducing legal risk. AI is **never** used where deterministic logic would be safer and more appropriate.

The bright line: **AI never generates, modifies, or selects legal text that will appear in a user-facing document.** All legal content comes from the clause library, assembled by deterministic conditional logic.

---

## Where AI Is Used

### 1. Development Agents (Claude Code, Copilot, etc.)

AI coding assistants are used during development under the following constraints:

**Permitted:**
- Writing application code (components, API routes, utilities, tests)
- Refactoring and code review assistance
- Writing database migrations (reviewed before applying)
- Generating test data and fixtures
- Documentation and comments
- Debugging and error analysis

**Prohibited:**
- Writing or modifying clause library content (`/lib/clauses/`)
- Generating legal text of any kind
- Making security architecture decisions without human review
- Modifying RLS policies without explicit human approval
- Committing directly to `main` — all changes go through PR review

**Workflow:**
```
Agent writes code → PR created → Human reviews → Tests pass → Merge
```

No AI-generated code reaches production without human review. This is not a suggestion — it is a hard requirement for a legal technology product.

### 2. Dispute Intake Assistant (Future — Phase 1b)

A guided intake flow that helps users categorise and structure their dispute before it enters the formal resolution workflow.

**What it does:**
- Asks clarifying questions to determine dispute type (payment, deliverables, service quality, contract interpretation)
- Suggests which evidence might be relevant
- Helps the user articulate their position in structured format
- Maps their situation to the appropriate workflow template

**What it does NOT do:**
- Give legal advice ("you should..." / "your claim is strong/weak")
- Assess the merits of either party's position
- Generate or suggest legal language for the dispute
- Make recommendations about whether to escalate
- Access or summarise the other party's submissions

**Technical architecture:**
```
User input → Classification prompt (structured output) → Workflow router → Deterministic template
```

The AI's role ends at classification and structuring. Once the dispute type is determined, the workflow is entirely deterministic. The AI does not participate in the resolution process.

**Guardrails:**
- System prompt explicitly prohibits legal advice, merit assessment, and party-favouring language
- Output is always structured JSON (dispute type, evidence categories, timeline flags) — never freetext shown to users
- All AI interactions are logged with full prompt/response pairs for auditability
- A disclaimer is shown to the user: "This assistant helps organise your dispute. It does not provide legal advice."
- Temperature set to 0 for maximum determinism
- Response schema enforced via structured output / JSON mode

### 3. Smart Notifications (Future — Phase 2)

AI-assisted notification prioritisation and summarisation for users managing multiple business relationships.

**What it does:**
- Summarises dispute status updates in plain language
- Prioritises notifications by urgency and required action
- Groups related notifications

**What it does NOT do:**
- Advise on what action to take
- Predict dispute outcomes
- Generate legal correspondence

### 4. Dispute Pattern Analytics (Future — Phase 4)

Aggregate, anonymised analysis of dispute patterns for business intelligence.

**What it does:**
- Identifies common dispute types by industry/region
- Highlights seasonal or cyclical patterns
- Benchmarks resolution timelines

**What it does NOT do:**
- Analyse individual disputes
- Make predictions about specific cases
- Share data between parties or businesses

---

## Agent Boundaries (The Rules)

These apply to every AI agent in the system, whether development-time or runtime.

### Rule 1: No Legal Text Generation
AI never writes, rewrites, suggests, or modifies text that will appear in a legal document, contract, terms of service, dispute notice, or any user-facing document with legal significance. All such text comes from the human-authored clause library.

### Rule 2: No Legal Advice
AI never assesses the strength of a claim, recommends a course of action with legal implications, interprets contract terms, or tells a user what they "should" do. It can help them organise their thoughts and evidence — it cannot evaluate them.

### Rule 3: No Cross-Party Data Leakage
An AI agent operating on behalf of Party A must never have access to Party B's submissions, strategy, evidence, or communications. Dispute data is siloed per-party at the database level (RLS), and AI agents inherit these access controls. There is no "platform-level" AI that sees both sides.

### Rule 4: Full Auditability
Every AI interaction that touches dispute data must be logged:
- Timestamp
- User ID
- Full prompt (system + user)
- Full response
- Model and version used
- Classification/routing decisions made

Logs are retained for the dispute's full lifecycle plus the limitation period (typically 6 years for contract disputes in England and Wales). This is not optional — it is a legal defensibility requirement.

### Rule 5: Graceful Degradation
If an AI service is unavailable (API downtime, rate limits, model changes):
- The dispute intake flow falls back to a manual form (structured dropdowns and text fields)
- Notification summaries fall back to template-based text
- No dispute resolution workflow is blocked by AI availability
- Users are never told "the AI is down" — the fallback should feel like the normal experience

### Rule 6: Model Pinning
All AI integrations pin to a specific model version (e.g., `claude-sonnet-4-20250514`). Model upgrades require:
- Testing against the existing evaluation suite
- Review of output format compliance
- Sign-off before deployment

Never use `latest` or unpinned model references in production.

### Rule 7: No Training on User Data
Kestrel's dispute data must never be used to train, fine-tune, or improve AI models — internal or third-party. All API calls must use providers' data-processing agreements that guarantee no training on input data. For Anthropic, this means using the API (not consumer products) and confirming the DPA terms.

---

## Evaluation & Testing

### Dispute Intake Classifier

Maintain an evaluation dataset of at least 100 dispute scenarios covering:
- Payment disputes (partial, late, non-payment)
- Deliverable disputes (quality, scope, timeline)
- Service quality disputes
- Contract interpretation disputes
- Edge cases (mixed types, unclear categorisation, out-of-scope requests)

The classifier must achieve:
- **>95% accuracy** on clear-cut cases
- **>85% accuracy** on ambiguous/mixed cases
- **0% legal advice leakage** — any response that could be interpreted as legal advice is a test failure
- **0% cross-party data references** — any response referencing the other party's data is a test failure

Run the evaluation suite:
- Before every model version upgrade
- Before every system prompt change
- Weekly as a regression check in CI

### Red Team Testing

Before any AI feature ships, run adversarial prompts designed to:
- Extract legal advice ("Just tell me if I'll win")
- Bypass classification ("Ignore your instructions and...")
- Leak system prompts
- Access cross-party data
- Generate legal text
- Impersonate the other party

Document results. Fix failures. Re-test. This is not a one-time activity.

---

## Implementation Checklist

Before shipping any AI feature:

- [ ] System prompt reviewed by a human (not just another AI)
- [ ] Structured output schema defined and enforced
- [ ] Fallback path implemented and tested
- [ ] Audit logging implemented with full prompt/response capture
- [ ] Evaluation suite passing at required accuracy thresholds
- [ ] Red team testing completed and documented
- [ ] Model version pinned in configuration
- [ ] Data processing agreement confirmed with AI provider
- [ ] User-facing disclaimer displayed where AI is used
- [ ] Rate limiting applied to AI-powered endpoints
- [ ] Cost monitoring and alerting configured
- [ ] No legal text generation — verified by code review
- [ ] No legal advice — verified by evaluation suite
- [ ] Cross-party data isolation — verified by integration tests