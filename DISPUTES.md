# Disputes: AI Contract Analysis

## Overview

When a dispute is filed against a contract created through Kestrel, the platform offers AI-powered extraction of key contract terms. This gives both parties an agreed factual starting point for the dispute, reduces manual review, and positions Kestrel as the source of record.

This feature is only available for contracts that include the Kestrel dispute resolution clause.

---

## Eligibility

| Condition | Required |
|---|---|
| Contract created through Kestrel | Yes |
| Kestrel dispute resolution clause present | Yes |
| User on eligible subscription tier (or per-document upsell) | Yes |
| User explicitly toggles on AI extraction | Yes |

Contracts without the Kestrel clause can still go through the dispute process, but AI extraction is unavailable. The UI should communicate this clearly: the contract must include the clause to unlock analysis. This creates a genuine incentive for users to keep the clause in their contracts.

---

## How It Works

### Filing Flow

1. Logged-in user navigates to a saved contract on their dashboard
2. User initiates a dispute against that contract
3. If the contract includes the Kestrel dispute resolution clause, the AI extraction toggle is shown
4. User enables the toggle (opt-in per dispute)
5. AI extracts key structured data from the contract
6. Extracted data is presented to the filing party for review
7. The other party receives the dispute notification and sees the same extracted data
8. Either party can challenge any extracted field
9. Agreed fields form the factual basis for the dispute

### Without the Clause

1. User files a dispute against a contract that lacks the Kestrel clause
2. AI extraction toggle is not shown
3. A message explains: "AI contract analysis is available for contracts that include the Kestrel dispute resolution clause"
4. The dispute proceeds without automated extraction — parties manage facts manually

---

## Extracted Fields

The AI should extract a defined, narrow set of structured data. This is **data extraction, not legal interpretation**. The system must never infer meaning, assess liability, or offer opinions.

| Field | Example |
|---|---|
| Parties | "Kestrel Solutions Ltd" and "Acme Corp" |
| Effective date | 15 March 2026 |
| Payment amount(s) | GBP 5,000 |
| Payment terms | Net 30 from invoice date |
| Deliverables | "Brand identity package including logo, guidelines, and templates" |
| Key deadlines / milestones | "First draft due 1 April 2026" |
| Termination terms | "Either party may terminate with 14 days written notice" |
| Governing law | England and Wales |
| Dispute resolution clause | Kestrel ODR as per clause 12.1 |

This list should expand cautiously over time, only as accuracy is proven.

---

## Challenge Process

Either party can dispute the AI's extraction for any field. The process:

1. Party flags a field as incorrect
2. Party provides their version of what the field should say
3. The field is marked as **"not agreed"** with both versions visible
4. The dispute proceeds with the disagreement noted — Kestrel does not adjudicate what the contract says
5. Parties can resolve the factual disagreement themselves, or it becomes part of the dispute

Kestrel never takes a position on which version is correct. The AI output is a starting point, not a ruling.

---

## Pricing

| Tier | Access |
|---|---|
| Higher-tier subscription | AI extraction included for all disputes |
| Lower-tier subscription | Per-document upsell (pay per extraction) |
| Free / unauthenticated | Not available |

Exact pricing TBD. The feature must be positioned as a premium capability that adds clear value, not a basic expectation.

---

## Data Handling

### Storage
- Extracted data is stored **encrypted at rest** (application-level encryption, not just database-level)
- Raw contract content processed by the AI is not stored separately — extraction results reference the original document
- Encrypted storage applies to both the extraction results and any challenge/correction data

### GDPR
- AI extraction is a new processing activity — must be documented in the privacy policy
- Processing occurs only on explicit user action (toggle), providing lawful basis via consent
- Extracted data is subject to the same retention periods as the dispute itself
- Must be included in Subject Access Request (SAR) exports
- Users can request deletion of extracted data independently of the dispute record

### Access
- Both parties to the dispute can view extracted data
- No third-party access without explicit consent or legal obligation
- Kestrel staff access only for support purposes, logged and auditable

---

## AI Constraints

These are non-negotiable:

1. **No legal interpretation** — Extract what the contract says, never what it means
2. **No liability assessment** — Never suggest who is at fault or in breach
3. **No recommendations** — Never suggest what a party should do
4. **Extraction only** — Structured data out, nothing more
5. **Confidence indicators** — If the AI is uncertain about a field, flag it rather than guessing
6. **Human review framing** — All extracted data is presented as "for your review", never as established fact
7. **Deterministic where possible** — For contracts created through Kestrel's tools, prefer pulling from the original structured input data over re-parsing the document

---

## UX Principles

- The toggle is always visible but never pre-enabled — the user must actively choose to run extraction
- Clear labelling: "Analyse contract with AI" or similar, not buried in settings
- Both parties see exactly the same extracted data — no asymmetry
- Challenge flow must be simple — one click to flag, one field to provide a correction
- The "not available without clause" message should be informative, not punitive

---

## Technical Notes

- Extraction should run against contracts generated by Kestrel's own tools, so the source format is known and controlled
- Since Kestrel created the document, structured input data from the original questionnaire may be available — this is more reliable than re-parsing and should be preferred where possible
- AI extraction serves as a verification/presentation layer on top of known data, not a blind analysis of unknown documents
- The extraction API must be idempotent — running it twice on the same contract produces the same result
- Rate limiting per user to prevent abuse
