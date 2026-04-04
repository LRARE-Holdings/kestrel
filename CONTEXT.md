# Kestrel — Project Context

## What Kestrel Is

Kestrel is an online dispute resolution (ODR) platform for businesses in England and Wales. It provides structured communication infrastructure for resolving commercial disputes without solicitors, courts, or formal ADR proceedings at the point of first contact.

Kestrel is **not** a law firm, a mediation service, or an arbitration provider. It is a structured communication venue — a place where two parties can work through a dispute using guided workflows, documented timelines, and escalation paths to external professionals if resolution fails.

The tagline is: **"Resolve it on Kestrel."**

## Who Builds It

Kestrel is built by **OnKestrel Limited**, a software company registered in England and based in Newcastle-upon-Tyne. The founder is a law student at Northumbria University studying human rights, tort law, and innovation/technology law.

Kestrel is its own company from launch — an independent, VC-backable limited company.

## The Core Problem

Small and medium businesses in England and Wales have no practical middle ground between "send an angry email" and "instruct a solicitor." Court is slow, expensive, and adversarial. Mediation requires both parties to agree to it after a dispute has already escalated. There is no infrastructure for structured early-stage dispute resolution that both parties have already opted into before a dispute arises.

## The Distribution Mechanic (Critical)

Kestrel solves the cold start problem — getting both parties onto the platform before any dispute exists — through a suite of **free business tools**:

- Contract templates
- Terms and conditions generators
- Handshake tools (lightweight agreement confirmations)
- Milestone trackers
- Late payment toolkits
- Notice logs

Each of these tools **embeds a Kestrel dispute resolution clause by default**. The clause is:

- **On by default** in all templates and generated documents
- **Removable with one click** — always transparently, never hidden
- **Not a dark pattern** — the user is clearly informed of its presence

This means that by the time a dispute arises between two businesses, both parties have already agreed to resolve it on Kestrel as a first step. The Disney forced arbitration case is a real-world precedent that validates this mechanic in the market.

## How the Free Tools Work

The contract and terms generation system is built on a **pre-written clause library with conditional logic**, not AI API calls at runtime. This is a deliberate architectural decision:

- Marginal cost per document is effectively **zero**
- No dependency on third-party AI APIs for core document generation
- Deterministic output — the same inputs always produce the same clauses
- Legally reviewable — every clause in the library can be vetted once
- Genuinely scalable as a free product

Free tools **require no sign-up**. Sign-up adds value (saving documents, tracking milestones, receiving notifications) but is never a gate. A user should be able to generate a contract template and download it without creating an account.

## Dispute Resolution Flow

When a dispute is raised on Kestrel:

1. **Initiating party** files a structured dispute notice (guided form, not freetext)
2. **Responding party** receives notification and is guided through the platform
3. Both parties use **structured communication** — templated responses, evidence uploads, timeline documentation
4. The platform provides **guided workflows** based on dispute type (payment, deliverables, service quality, contract interpretation)
5. If resolution is not reached, Kestrel offers a **clean escalation path to external mediators/arbitrators** — vetted professionals, not Kestrel employees

Kestrel does **not** employ or contract mediators internally. The internal mediator mechanic was explicitly dropped. Kestrel is purely a structured communication venue with escalation paths.

## Regulatory Position

| Requirement | Status | Notes |
|---|---|---|
| SRA Authorisation | **Not required** | Kestrel does not provide legal advice or reserved legal activities |
| CMC Registration | **Not required** | Kestrel does not manage claims on behalf of claimants |
| ADR Entity Approval | **Not required at launch** | Kestrel is a communication venue, not a certified ADR provider |
| ICO Registration | **MANDATORY before launch** | Personal data is processed from day one. This is non-negotiable. |

ICO registration is the single hard regulatory gate before any public launch, beta, or pilot. Do not ship anything that processes personal data without confirming ICO registration is complete.

## Five-Year Strategic Arc

| Phase | Name | Focus |
|---|---|---|
| 1 | The Wedge | Dispute resolution + free tools distribution |
| 2 | The Relationship | Ongoing business relationship management |
| 3 | The Transaction | Payment and contract lifecycle tooling |
| 4 | The Intelligence | Data-driven insights from dispute patterns |
| 5 | The Operating System | Full business operations infrastructure |

Phase 1 is the only phase that matters right now. Everything else is strategic context for investors and long-term planning. Do not build for Phase 2+ until Phase 1 is validated.

## Brand Identity

### Voice
Calm, self-assured, modern. Not AI-forward. Not uptight. Not cyberpunk. Think: a confident professional who doesn't need to shout.

### Colour Palette

| Name | Hex | Usage |
|---|---|---|
| Ink | `#0C1311` | Primary text, dark backgrounds |
| Kestrel | `#2B5C4F` | Brand primary, CTAs, accent |
| Sage | `#7FA691` | Secondary accent, success states |
| Warm | `#C4B5A0` | Warm neutral, highlights |
| Stone | `#E8E2D8` | Light backgrounds, cards |
| Cream | `#F6F3EE` | Page background, whitespace |

### Typography

| Role | Font | Notes |
|---|---|---|
| Display / Headings | Instrument Serif | Warm, authoritative, distinctive |
| UI / Body | DM Sans | Clean, readable, modern |
| Data / Code / Legal | JetBrains Mono | Precision, structure, trust |

### Logo
Geometric swept-wing bird outline (Concept A). Available in: mark in Kestrel green, full logo light, full logo dark, mark mono, mark white.

### Domains
- `kestrel.law` (primary)
- `onkestrel.com`
- `usekestrel.co.uk`

## Pricing Model

Free tools are free forever — they are the distribution mechanic, not a trial.

Paid revenue comes from:
- Dispute resolution workflows (per-dispute or subscription)
- Premium features for businesses managing multiple relationships
- Escalation/mediator marketplace fees

Exact pricing tiers should be validated through early user research. Do not hardcode pricing assumptions into the architecture.

## Key Principles

1. **Free tools are genuinely free.** No sign-up gates. No feature crippling. No bait-and-switch.
2. **Transparency over growth hacking.** The dispute resolution clause is visible and removable. Always.
3. **Platform, not provider.** Kestrel is infrastructure. It does not give legal advice, mediate disputes, or take sides.
4. **England and Wales first.** Do not abstract for multi-jurisdiction until Phase 1 is proven. Legal specificity is a feature.
5. **Deterministic document generation.** Clause library with conditional logic. No runtime AI for legal text.
6. **ICO compliance is a hard gate.** Nothing launches without it.