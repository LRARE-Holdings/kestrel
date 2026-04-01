# Free Tools — Product Specification

## Role in the Product

The free tools are Kestrel's distribution mechanic. They solve the cold start problem: getting both parties onto the platform before a dispute exists. Every free tool produces a document or record that embeds the Kestrel dispute resolution clause by default, so that by the time a dispute arises, both parties have already agreed to resolve it on Kestrel.

The free tools are not a trial. They are not a teaser for paid features. They are genuinely useful standalone products that happen to plant the seed for Kestrel's paid dispute resolution workflow.

### Non-Negotiable Principles

1. **No sign-up required.** A user can use any free tool, generate a document, and download it without creating an account. Authentication adds value (saving documents, tracking milestones, receiving notifications) but is never a gate.

2. **Kestrel dispute resolution clause is on by default.** Every generated document includes it. It is clearly visible in the document preview — never hidden, never buried.

3. **Removable with one click.** A toggle or checkbox allows the user to remove the dispute resolution clause before generating. This is always visible and never requires scrolling to find. Transparency is the policy — not growth hacking.

4. **Deterministic generation.** All documents are assembled from the pre-written clause library with conditional logic. No AI API calls at runtime for legal text. Same inputs produce the same document every time.

5. **Zero marginal cost per document.** The clause library is code. There are no per-generation API costs, no token usage, no third-party billing. This is what makes free genuinely sustainable.

6. **England and Wales jurisdiction only.** All legal language, statutory references, and default terms are specific to England and Wales. The tools do not offer jurisdiction selection in Phase 1.

---

## Tool 1: Contract Templates

### Purpose
Generate professional, legally-structured contracts for common business arrangements. This is the highest-value free tool and the primary distribution vehicle for the Kestrel clause.

### User Flow (Unauthenticated)

```
Landing → Select contract type → Guided questionnaire → Preview document → Toggle dispute clause (on by default) → Download (PDF / DOCX)
```

### User Flow (Authenticated — additional features)

```
... → Preview document → Toggle dispute clause → Save to account → Download → Share link with counterparty → Counterparty views and optionally signs up
```

### Contract Types

| Type | Target User | Key Clauses |
|---|---|---|
| Freelancer Service Agreement | Freelancers, consultants, agencies | Scope of work, payment terms, IP assignment, termination, deliverables |
| SaaS Subscription Agreement | SaaS companies | Subscription terms, SLAs, data processing, liability caps, renewal/cancellation |
| Consulting Engagement Letter | Consultants, advisory firms | Engagement scope, fees, confidentiality, deliverables, conflict of interest |
| General Service Contract | Service businesses | Service description, payment, warranties, liability, termination |
| Subcontractor Agreement | Businesses outsourcing work | Scope, payment flow-down, IP, insurance, indemnity |
| Non-Disclosure Agreement (Mutual) | Any B2B relationship | Definition of confidential information, obligations, duration, exceptions |

### Questionnaire Inputs

Each contract type has its own conditional questionnaire. Common fields across all types:

**Party Details**
- Party A: Business name, registered address, company number (optional), contact name, contact email
- Party B: Same fields
- Both parties can be individuals (sole traders) or companies

**Agreement Basics**
- Effective date
- Term (fixed period / rolling / until completion)
- Governing law: England and Wales (not selectable in Phase 1, stated as default)

**Type-Specific Fields (example: Freelancer Service Agreement)**
- Description of services (freetext, structured into clauses)
- Deliverables (list with descriptions and deadlines)
- Payment: Fixed fee / hourly rate / milestone-based
- Payment terms: Days after invoice (default 30)
- Late payment interest: Statutory rate (Late Payment of Commercial Debts (Interest) Act 1998) / custom rate
- IP ownership: Client owns all IP / shared / freelancer retains with licence
- Confidentiality: Yes/No, duration if yes
- Termination notice period: 7/14/30/60/90 days

**Kestrel Dispute Resolution Clause**
- Toggle: Include Kestrel dispute resolution clause (default: ON)
- Clearly labelled: "If a dispute arises under this agreement, both parties agree to attempt resolution through Kestrel's structured dispute resolution process before pursuing other remedies."
- Visible in document preview with a subtle Kestrel badge/highlight
- One-click toggle to remove — no confirmation dialog, no guilt trip

### Output
- **Document preview:** Rendered in-browser, scrollable, with clause sections clearly delineated
- **Download formats:** PDF, DOCX
- **Metadata embedded in document:** Clause versions used, generation timestamp, whether dispute clause was included
- **No Kestrel branding in the document body** — the document looks like a professional contract, not a Kestrel advertisement. The dispute resolution clause references Kestrel by name as the resolution venue, but the document itself is clean.

---

## Tool 2: Terms & Conditions Generator

### Purpose
Generate terms and conditions for businesses that sell products or services. Covers e-commerce, SaaS, and general service businesses. Particularly valuable for small businesses that currently operate without proper T&Cs.

### User Flow

```
Landing → Select business type → Guided questionnaire → Preview T&Cs → Toggle dispute clause (on by default) → Download (PDF / DOCX / Markdown for website embedding)
```

### Business Types

| Type | Target | Key Sections |
|---|---|---|
| E-commerce | Online shops, marketplaces | Orders, delivery, returns, refunds, consumer rights (Consumer Rights Act 2015) |
| SaaS / Digital Services | Software companies, app developers | Subscriptions, acceptable use, data, SLAs, cancellation |
| Professional Services | Consultants, agencies, freelancers | Engagement terms, payment, liability, IP, confidentiality |

### Questionnaire Inputs

**Business Details**
- Business name, trading name (if different), registered address
- Company number (optional)
- Business type: sole trader / limited company / LLP / partnership
- Website URL (for e-commerce / SaaS)
- Contact email for customer enquiries

**Type-Specific Fields (example: E-commerce)**
- Products: Physical goods / digital goods / both
- Delivery: UK only / UK + international
- Returns policy: Statutory only (Consumer Rights Act 2015) / extended returns window
- Payment methods accepted
- Whether prices include VAT
- Age restrictions on any products

**Type-Specific Fields (example: SaaS)**
- Free tier available: Yes / No
- Trial period: None / 7 / 14 / 30 days
- Billing cycle: Monthly / annual / both
- Auto-renewal: Yes / No
- Data hosting location
- Uptime commitment: None / 99% / 99.9% / 99.99%

**Data Protection**
- Does the business collect personal data: Yes (always yes, practically)
- Link to privacy policy (optional — note: "You should have a separate privacy policy")
- Data processor or data controller

**Dispute Resolution Clause**
- Same toggle mechanic as Contract Templates
- In T&Cs context, the clause reads as a customer-facing term: disputes between the business and its customers are first attempted through Kestrel

### Output
- **Document preview** with section navigation
- **Download formats:** PDF, DOCX, Markdown (for pasting into a website CMS), raw HTML (for embedding)
- **Copy-to-clipboard** for individual sections
- The Markdown and HTML outputs are particularly important — T&Cs live on websites, not in filing cabinets

---

## Tool 3: Handshake

### Purpose
A lightweight agreement confirmation for when two parties agree to something informally — over a call, in a meeting, via email — and want a structured record of what was agreed. Not a full contract. Think of it as a documented handshake with a timestamp and both parties' acknowledgment.

This is the tool that most naturally introduces the Kestrel clause into existing business relationships where a full contract doesn't exist or wasn't used.

### User Flow

```
Creator fills in what was agreed → Preview → Toggle dispute clause → Generate Handshake link → Share link with other party → Other party reviews and confirms (or suggests changes) → Both parties receive a copy
```

### Inputs

**What was agreed**
- Title / subject (short, e.g., "Website redesign for Acme Ltd")
- Description of the agreement (structured freetext — what, who, when, how much)
- Key terms (repeatable fields):
  - Term description (e.g., "Delivery by 15 May 2026")
  - Responsible party: Party A / Party B / Both
  - Deadline (optional)
  - Amount (optional, GBP)

**Party Details**
- Party A (creator): Name, email, business name
- Party B: Name, email, business name

**Dispute Resolution Clause**
- Default: ON
- In the Handshake context: "If either party disputes any term of this Handshake, both parties agree to first attempt resolution through Kestrel."

### The Confirmation Flow

This is what makes Handshake different from just generating a document:

1. **Creator** generates the Handshake and gets a unique, shareable link
2. **Link sent to Party B** (via email — either automatically if creator provides email, or manually copied)
3. **Party B opens the link**, sees what was agreed, and can:
   - **Confirm** — both parties get a timestamped, confirmed Handshake record
   - **Suggest changes** — sends a modification request back to the creator (structured, not freetext)
   - **Decline** — the Handshake is marked as not confirmed
4. Both parties receive a copy of the final confirmed Handshake (PDF via email, or saved to account if authenticated)

**No sign-up required for either party.** Party B can confirm a Handshake without creating an account. If they do sign up, the Handshake is saved to their account.

### Output
- **Confirmed Handshake document** (PDF) with:
  - What was agreed (structured terms)
  - Both parties' details
  - Confirmation timestamp (server-side, not client)
  - Unique reference number
  - Kestrel dispute resolution clause (if included)
  - Status: Confirmed / Pending / Modified / Declined

### Why This Tool Matters Strategically
Handshake is the only free tool that **requires both parties to interact with the platform**. Contract templates and T&C generators are single-party tools — one person generates, the other receives a static document. Handshake gets both parties onto Kestrel before any dispute exists. It's the strongest distribution mechanic in the suite.

---

## Tool 4: Milestone Tracker

### Purpose
Track deliverables, deadlines, and responsibilities for project-based work. When milestones are missed or deliverables are disputed, the Kestrel clause is already in place.

### User Flow

```
Create project → Add milestones → Share with other party → Both parties track progress → Mark milestones complete/disputed
```

### Inputs

**Project Details**
- Project name
- Description (brief)
- Party A: Name, email, business name (creator)
- Party B: Name, email, business name
- Start date
- Expected end date

**Milestones** (repeatable, minimum 1)
- Milestone title
- Description
- Responsible party: Party A / Party B
- Due date
- Payment amount tied to milestone (optional, GBP)
- Deliverables (list of items that constitute completion)

**Dispute Resolution Clause**
- Default: ON
- Context: "If either party disputes the completion or quality of a milestone, both parties agree to first attempt resolution through Kestrel."

### Authenticated Experience (Where Sign-Up Adds Value)

The milestone tracker is the free tool that benefits most from authentication:

**Without sign-up:**
- Create a milestone tracker → get a shareable link → both parties can view
- Static snapshot — no live updates, no notifications

**With sign-up:**
- Both parties see a live, shared tracker
- Either party can mark a milestone as complete
- The other party can confirm completion or raise a dispute
- Email notifications on status changes and approaching deadlines
- Full history of milestone status changes (audit trail)

This is the natural upsell into Kestrel accounts. The static version is useful. The live version is significantly more useful. No feature is locked — it's just better with an account.

### Output
- **Shareable tracker link** (live if both parties authenticated, static snapshot otherwise)
- **PDF export** of current milestone status (for records)
- **Timeline view** showing milestones on a visual timeline

---

## Tool 5: Late Payment Toolkit

### Purpose
Help businesses deal with late payments — the single most common commercial dispute for SMEs. Includes a statutory interest calculator and a sequence of letter templates escalating from polite reminder to formal demand.

This tool is emotionally charged. When someone searches for "late payment letter template," they're already frustrated. The experience should be calm, competent, and immediately useful.

### Components

#### 5a. Late Payment Calculator

**Inputs:**
- Invoice amount (GBP)
- Invoice date
- Payment terms (days): 30 / 60 / 90 / custom
- Date payment was due (auto-calculated or manual override)
- Date of calculation (defaults to today)

**Output:**
- Days overdue
- Statutory interest accrued (Late Payment of Commercial Debts (Interest) Act 1998 — currently 8% + Bank of England base rate, calculated daily from the date payment was due)
- Fixed-sum compensation amount (£40 / £70 / £100 based on debt amount per the Act)
- Total amount now owed (original + interest + compensation)
- Breakdown shown clearly — the user needs to understand where each number comes from

**Important:** The calculator references the current Bank of England base rate. This must be kept up to date — either fetched at build time from a reliable source, or maintained as a configuration value with a "last updated" date displayed to the user.

#### 5b. Letter Templates

A sequence of escalating letters, each appropriate for a different stage of a late payment dispute:

| Stage | Letter | Tone | When to Send |
|---|---|---|---|
| 1 | Friendly Reminder | Warm, assumes oversight | 1–7 days overdue |
| 2 | Firm Reminder | Professional, references terms | 14–21 days overdue |
| 3 | Formal Demand (Letter Before Action) | Formal, references statutory rights | 30+ days overdue |
| 4 | Notice of Intent to Commence Proceedings | Final warning, references court action | 45+ days overdue |

**Inputs for each letter:**
- Creditor details (name, business name, address)
- Debtor details (name, business name, address)
- Invoice number and date
- Amount owed
- Original payment terms
- Amount including statutory interest and compensation (auto-populated from calculator if used)
- Any previous correspondence dates (for letters 2–4)

**Output:**
- Letter preview with all fields populated
- Download as PDF / DOCX
- Each letter includes the Kestrel dispute resolution clause as an alternative to court proceedings: "Before commencing formal proceedings, [Creditor] invites [Debtor] to resolve this matter through Kestrel's structured dispute resolution process at kestrel.law."
- The letter sequence naturally escalates toward Kestrel as the resolution venue — by letter 3, the clause positions Kestrel as the sensible middle ground between "keep chasing" and "go to court"

**Legal note:** Letter 3 (Formal Demand) functions as a Letter Before Action under the Pre-Action Protocol for Debt Claims. The template must comply with the protocol's requirements. This template needs legal review before launch.

### Why This Tool Matters Strategically
Late payments are the most common trigger for the exact type of dispute Kestrel resolves. A business that uses the Late Payment Toolkit today is the business that files a dispute on Kestrel tomorrow. The toolkit positions Kestrel as helpful before it's necessary — building trust and familiarity before the user ever needs the paid product.

---

## Tool 6: Notice Log

### Purpose
Create a structured, timestamped record of formal notices sent between parties. Many contracts require formal notice for certain actions (termination, breach, change requests). The notice log provides proof that notice was given, when, and what it said.

### User Flow

```
Create notice → Select notice type → Fill in details → Generate notice document → Send to recipient (email or link) → Log entry created with timestamp
```

### Notice Types

| Type | Purpose | Typical Use |
|---|---|---|
| Breach of Contract | Notify the other party of a contractual breach | Party fails to deliver, violates terms |
| Termination Notice | Formally end a contract or agreement | End of engagement, cancellation |
| Change Request | Request a change to agreed terms | Scope change, timeline adjustment |
| Payment Demand | Formal demand for payment (overlaps with Late Payment Toolkit but lighter) | Standalone payment notice |
| General Notice | Catch-all for contractual notifications | Any formal communication required by a contract |

### Inputs

**Notice Details**
- Notice type (from list above)
- From: Name, business name, address, email
- To: Name, business name, address, email
- Reference (contract name, project name, or agreement reference)
- Subject line
- Notice content (guided template with freetext sections):
  - What is being notified (structured)
  - Relevant contract clause (optional — user can reference the specific clause they're invoking)
  - Required action from recipient (if any)
  - Deadline for response/action (if any)
  - Consequences of non-response (templated options based on notice type)

**Dispute Resolution Clause**
- Default: ON
- Context: "If this notice leads to a dispute, both parties agree to first attempt resolution through Kestrel."

### The Log

The unique value of this tool is the **log** — a running record of all notices sent, with timestamps:

**Without sign-up:**
- Generate a single notice → download PDF → done
- No log persistence (it's a one-off document generator)

**With sign-up:**
- All notices saved chronologically in a searchable log
- Each notice entry: date sent, type, recipient, subject, status (sent / acknowledged / disputed)
- Export full log as PDF (useful as evidence in a dispute or court proceeding)
- If the other party is also on Kestrel, they see the notice in their dashboard and can acknowledge receipt

### Output
- **Notice document** (PDF / DOCX) — formal, professional, includes all required details
- **Log entry** (if authenticated) with timestamp and delivery confirmation
- **Shareable link** for the recipient to view and acknowledge

---

## Dispute Resolution Clause — Standard Wording

The following is the standard clause embedded across all free tools. Exact wording will vary slightly by tool context, but the substance is consistent:

> **Dispute Resolution**
>
> If a dispute arises in connection with this [agreement/document/arrangement], the parties agree to first attempt to resolve the dispute through Kestrel's structured online dispute resolution process (kestrel.law) before pursuing mediation, arbitration, or court proceedings. Either party may initiate a dispute on Kestrel by filing a structured dispute notice. Both parties agree to engage in good faith with the Kestrel process for a minimum period of 30 days before pursuing other remedies. This clause does not prevent either party from seeking urgent injunctive relief where necessary.
>
> This agreement is governed by the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction, subject to the dispute resolution process described above.

**This wording needs legal review before launch.** It is a starting point, not a final draft. Key questions for legal review:
- Is the 30-day good faith period enforceable?
- Does the "urgent injunctive relief" carve-out need to be more specific?
- Does the clause create a binding obligation to use Kestrel, or merely an agreement to attempt it?
- How does this interact with the Consumer Rights Act 2015 for B2C terms?

---

## URL Structure

All free tools live under the `/tools` path, outside the authenticated app:

```
/tools                          → Free tools landing page (grid of all tools)
/tools/contracts                → Contract template selector
/tools/contracts/freelancer     → Freelancer service agreement generator
/tools/contracts/saas           → SaaS agreement generator
/tools/contracts/[type]         → Other contract types
/tools/terms                    → T&C generator selector
/tools/terms/ecommerce          → E-commerce T&C generator
/tools/terms/[type]             → Other T&C types
/tools/handshake                → Create a new Handshake
/tools/handshake/[id]           → View/confirm a Handshake (shareable link)
/tools/milestones               → Create a new milestone tracker
/tools/milestones/[id]          → View a milestone tracker (shareable link)
/tools/late-payment             → Late payment toolkit landing
/tools/late-payment/calculator  → Statutory interest calculator
/tools/late-payment/letters     → Letter template generator
/tools/notices                  → Create a new notice
/tools/notices/[id]             → View a notice (shareable link)
```

All `/tools/*` routes are server-rendered, publicly accessible, and optimised for search engines. These pages are Kestrel's primary SEO surface.

---

## SEO Strategy for Free Tools

Each free tool targets specific, high-intent search queries:

| Tool | Target Queries |
|---|---|
| Contract Templates | "freelancer contract template UK", "SaaS agreement template", "free service contract template" |
| T&C Generator | "terms and conditions generator UK", "ecommerce terms template", "SaaS terms of service template" |
| Handshake | "simple agreement template", "informal agreement confirmation", "handshake agreement template" |
| Milestone Tracker | "project milestone tracker", "deliverable tracking template", "freelance project tracker" |
| Late Payment Toolkit | "late payment interest calculator UK", "late payment letter template", "letter before action template" |
| Notice Log | "breach of contract notice template UK", "termination notice template", "formal notice letter template" |

Each tool page should have:
- A clear H1 matching the target query
- A brief, helpful introduction (2–3 sentences, not marketing fluff)
- The tool itself (interactive, immediately usable)
- Structured data markup (FAQPage schema for common questions)
- Internal links to related tools

---

## Analytics Events

Track usage across all free tools to understand adoption and conversion:

| Event | Properties | Notes |
|---|---|---|
| `tool.started` | `tool_type`, `sub_type` | User begins using a tool |
| `tool.completed` | `tool_type`, `sub_type`, `dispute_clause_included` | Document generated |
| `tool.downloaded` | `tool_type`, `format` (pdf/docx/md) | Document downloaded |
| `tool.clause_removed` | `tool_type` | User toggled off the dispute clause |
| `tool.shared` | `tool_type`, `method` (link/email) | Handshake/milestone/notice shared |
| `tool.signup_prompted` | `tool_type`, `trigger` | User shown sign-up suggestion |
| `tool.signup_completed` | `tool_type` | User signed up after using a tool |
| `handshake.confirmed` | `handshake_id` | Party B confirmed a Handshake |
| `milestone.status_changed` | `milestone_id`, `new_status` | Milestone marked complete/disputed |

**Privacy note:** Analytics must not capture the content of generated documents, personal details entered into forms, or any data that would require additional consent. Track actions, not content.

---

## Implementation Priority

Build and ship in this order:

| Priority | Tool | Reason |
|---|---|---|
| 1 | Late Payment Toolkit (calculator + letters) | Highest search volume, strongest emotional hook, clearest path to disputes |
| 2 | Contract Templates (freelancer + general service) | Highest long-term distribution value, embeds clause at relationship start |
| 3 | Handshake | Only tool requiring both parties on platform, strongest network effect |
| 4 | Terms & Conditions Generator (e-commerce) | Good SEO surface, lower urgency than contracts |
| 5 | Notice Log | Completes the toolkit, supports existing relationships |
| 6 | Milestone Tracker | Most complex to build, highest value when authenticated, lower priority as a free tool |

Ship each tool individually. Don't wait for the full suite. A single excellent Late Payment Calculator with letter templates is more valuable than six half-built tools.