# Kestrel Pricing Model

**Status:** Draft v1 — pre-MVP
**Owner:** Alex
**Last reviewed:** April 2026

> **Editor's note:** "Pellar Pro" in §7 was an earlier working name. The product is called **Kestrel Pro**. This rename does not affect any other content in this document.

---

## 1. Pricing philosophy

Kestrel's pricing is built around three structural facts about the business:

1. **The free tools are distribution, not a freemium ladder.** Every contract, T&C, Handshake agreement, and milestone tracker generated on Kestrel embeds (by default) a dispute resolution clause pointing to the platform. The tools must remain genuinely free forever, with no usage caps, no sign-up wall, and no premium gating. Their job is to seed the clause into the wild. Monetising them directly would kill the cold-start solution.

2. **Disputes are the wedge revenue.** People pay Kestrel under duress — when something has already gone wrong. This is the only point in the customer journey where willingness-to-pay is high and the value is unambiguous. Year 1 pricing must therefore be modest enough to generate case volume and testimonials, then ratchet up as the platform earns credibility. Pay-per-case (not subscription) is the honest model for an unproven platform.

3. **Kestrel is a venue, not a service.** Fees are charged for access to structured communication infrastructure and case management — not for mediation, legal advice, or adjudication. This is what keeps Kestrel outside the regulated activities under LSA 2007 and the ADR Regulations 2015 at launch. Pricing language and terms must reinforce this consistently.

---

## 2. Pricing structure overview

| Layer | Year 1 | Year 2 | Year 3 | Year 4 | Year 5 |
|---|---|---|---|---|---|
| Free tools | Free | Free | Free | Free | Free |
| Dispute fees (blended avg per case) | ~£69 | ~£110 | ~£160 | ~£205 | ~£249 |
| Pellar Pro subscription | — | £19/mo | £19/mo | £24/mo | £24/mo |
| Enterprise / partnership | — | — | Bespoke | Bespoke | Bespoke |

The blended average dispute fee rises not by raising every tier proportionally, but by raising the **Standard tier** first (the volume tier), then the **Larger** and **Complex** tiers as platform credibility and case-data justify it. The Small tier stays flat or near-flat throughout — it's the on-ramp.

---

## 3. The free tools layer

**What's free, forever, with no sign-up:**
- Contract templates (freelance, services, supply, subcontracting)
- T&C generator
- Handshake (lightweight mutual agreement tool)
- Milestone tracker
- Late payment toolkit
- Notice log

**What sign-up unlocks (still free):**
- Saved document history
- Document re-export and editing
- Multi-document management
- Email reminders for milestones and notices

**What sign-up must never gate:**
- Generating any document
- Downloading any document
- Embedding the Kestrel clause

**Why this matters:** every gate you put on the free tools reduces the rate at which the Kestrel clause spreads into UK SME contracting. The cost of generating a document is effectively zero (deterministic clause library, no AI runtime calls), so there is no marginal-cost reason to gate. The only reason to gate would be to drive subscription conversion, and that trade is not worth it pre-Year 2.

---

## 4. Dispute resolution fees — the core model

### 4.1 Tier structure (Year 1)

| Tier | Dispute value | Fee per party | Total platform fee |
|---|---|---|---|
| Small | Up to £1,000 | £35 | £70 |
| Standard | £1,000–£10,000 | £75 | £150 |
| Larger | £10,000–£25,000 | £150 | £300 |
| Complex | £25,000+ | £250 + 0.5% over £25k (capped at £1,500/party) | £500–£3,000 |

**Tier determination:** the claimant declares the disputed value at filing. If the respondent contests the value, the case is bumped to the higher tier and the claimant is charged the difference (not the respondent — this prevents respondents using tier-bumping as a cost weapon). If the respondent contests *downward*, the original tier stands.

**The 0.5% marginal charge on Complex tier:** this is not a percentage-of-claim contingency fee (which would invite SRA scrutiny and feel lawyerly). It's a platform load charge that scales modestly with case complexity, capped at £1,500/party so the worst case is £3,000 total — still an order of magnitude cheaper than litigation.

### 4.2 Year-by-year fee escalation

| Tier | Y1 per party | Y2 | Y3 | Y4 | Y5 |
|---|---|---|---|---|---|
| Small | £35 | £35 | £40 | £40 | £45 |
| Standard | £75 | £95 | £120 | £140 | £165 |
| Larger | £150 | £175 | £220 | £270 | £325 |
| Complex base | £250 | £275 | £325 | £400 | £475 |
| Complex marginal | 0.5% | 0.5% | 0.6% | 0.7% | 0.75% |

**Why this shape:** the Standard tier is the volume driver — most SME disputes will sit in the £1k–£10k range. Raising it from £75 to £165 over five years roughly doubles unit revenue on the most common case type while keeping it psychologically far below solicitor rates (£200–£400/hour). The Small tier barely moves because it's the conversion on-ramp and the case type most likely to attract first-time users who become repeat referrers.

### 4.3 Blended average sensitivity

The £69 → £249 blend depends entirely on the **tier mix**. Modelled assumption:

| Year | Small | Standard | Larger | Complex |
|---|---|---|---|---|
| Y1 | 60% | 32% | 6% | 2% |
| Y2 | 50% | 38% | 9% | 3% |
| Y3 | 42% | 42% | 12% | 4% |
| Y4 | 35% | 45% | 15% | 5% |
| Y5 | 30% | 47% | 17% | 6% |

The shift from Small-heavy to Standard-heavy reflects the platform earning credibility for higher-value cases over time. **This is the single most important assumption in the model and the one most likely to be wrong.** Pressure-test it as soon as you have 50+ resolved cases. If the mix stays Small-heavy beyond Year 2, breakeven slips by roughly six months per percentage point of Small overrepresentation.

### 4.4 Edge cases

- **Multi-respondent disputes** (e.g., claimant vs. two subcontractors): each respondent pays a separate fee. Claimant fee unchanged.
- **Counter-claims**: treated as a new dispute filed by the respondent against the claimant, separate fee, separate case ID, but linked in the platform UI. This is honest pricing — it's genuinely a second case to manage.
- **Withdrawn cases** (claimant withdraws before respondent notification): full refund minus £5 Stripe fee retention.
- **Withdrawn cases** (claimant withdraws after respondent notification): no refund to claimant; respondent fully refunded if they paid.
- **Settled offline**: parties can mark a case as "settled outside platform" at any time. No refund to either party — the platform did its job by creating the conversation venue. Worth being clear about this in terms.

---

## 5. The good-faith refund mechanic

This is the most important behavioural lever in the entire pricing model.

**Rule:** if the respondent (a) pays their fee within 14 days of notification, (b) engages substantively in the structured negotiation (not "I deny everything" boilerplate), and (c) the case reaches a recorded resolution within 14 days of their joining, their fee is refunded in full.

**Why this works:**
- It converts the respondent fee from a penalty into a deposit, removing the single biggest psychological barrier to engagement
- It's the headline line in the respondent notification email ("if you respond in good faith, your fee is refunded")
- It costs Kestrel relatively little — fast-resolving cases are also the cheapest to operate, and the claimant fee is retained
- It gives Kestrel a clean metric for investor reporting: "good-faith engagement rate" is a powerful number that distinguishes Kestrel from Simply Resolved-style platforms with low activation

**What "substantive engagement" means in practice:** at MVP, define this as "submitted a written response of 100+ words addressing the claimant's specific allegations." This is mechanical and reviewable. Refine as you accumulate case data and can recognise patterns of bad-faith engagement (copy-paste responses, irrelevant content, etc.).

**Refund processing:** triggered manually at MVP by the case-handling admin (you), automated by Y2 once the engagement criteria are codified. Stripe refund API handles the mechanics.

**Cost modelling:** assume 40% of cases qualify for refund in Y1, dropping to 30% by Y3 as case mix shifts to higher tiers where refund is less behaviourally necessary. This is built into the blended average calculation in §4.3.

---

## 6. Payment mechanics

### 6.1 Rails

**Stripe Checkout, card-only, at MVP.** No Stripe Connect (Kestrel doesn't handle settlement money — parties resolve directly). No GoCardless, no open banking, no bank transfer. Friction kills respondent conversion at sub-£100 fees, and card-only is correct for the volume tier.

### 6.2 Statement descriptor

**"KESTREL DISPUTE FEE"** — clear, not cryptic. Cryptic descriptors at sub-£100 fees produce chargebacks at volume, and Stripe will flag a young account with high chargeback rates. Clarity at the descriptor level is non-negotiable.

### 6.3 Payment flow

**Claimant filing:**
1. Claimant completes case filing form (parties, contract reference, dispute value, summary)
2. Tier auto-determined by declared value
3. Stripe Checkout opens with correct fee
4. On payment success, case is created with status "Awaiting respondent notification"
5. Respondent notification email sent within 1 hour (manual at MVP, automated thereafter)

**Respondent payment:**
1. Respondent receives notification email with secure case link
2. Link opens case summary (read-only) showing claimant's submission
3. "Respond to this dispute — £35" CTA opens Stripe Checkout
4. On payment success, case status moves to "Active negotiation," 14-day refund clock starts
5. Respondent can now submit their response and engage in structured exchange

### 6.4 What the fee buys, legally

The fee buys **access to the structured communication venue and case management infrastructure**. It does not buy:
- Mediation
- Legal advice
- Adjudication
- A guaranteed outcome
- Representation

This language must appear in the terms, on the payment page, and in the receipt. Consistency here is what protects the no-SRA-authorisation position. Worth having your co-founder draft this language alongside the dispute resolution clause itself so the two documents are linguistically aligned.

### 6.5 Refunds and chargebacks

- **Good-faith refund (§5):** processed via Stripe refund API, full amount, within 48 hours of qualifying resolution
- **Withdrawn case refund (§4.4):** processed within 24 hours, minus £5 Stripe fee retention where applicable
- **Chargebacks:** dispute via Stripe with the case record (timestamped filings, payment confirmations, terms acceptance log). Aim for <0.5% chargeback rate. Above 1% triggers Stripe review.

---

## 7. Pellar Pro — the subscription layer (Year 2+)

**Do not launch at MVP.** Launch when the platform has (a) at least 5,000 monthly active free-tool users, (b) at least 6 months of dispute resolution data, and (c) clear retention signals from repeat free-tool users.

### 7.1 Pricing

- **Monthly:** £19/month
- **Annual:** £180/year (21% discount, ~£15/month effective)
- **Year 4 increase:** £24/month, £228/year

### 7.2 What it includes

- Unlimited document vault with version history
- Branded contract exports (logo, business details auto-applied)
- Multi-user accounts (up to 5 users)
- Priority dispute queue (faster admin handling)
- Dispute history dashboard
- Bulk document operations
- API access (Year 3+)

### 7.3 What it doesn't include

- Discounted dispute fees (avoid coupling — disputes should remain pay-per-case so the unit economics stay legible)
- Legal advice or templates beyond the free library
- White-label options (that's the Enterprise tier)

### 7.4 Conversion assumption

Target 2% of registered free-tool users converting to Pro by end of Y2, scaling to 4% by Y5. This is conservative — typical SaaS freemium conversion is 2–5% — and reflects the fact that Pellar Pro is a "nice to have" upgrade rather than a "need to have" gate.

---

## 8. Enterprise / partnership tier (Year 3+)

**Bespoke pricing, no published rates.** Target customers:
- Trade associations (FSB, federations, sector bodies)
- Franchise networks
- Accountancy practices serving SMEs
- Chambers of commerce
- Insurance brokers (legal expenses cover providers)

**Deal structure options:**
- **White-label licence:** annual fee + per-dispute revenue share
- **Member benefit deal:** flat annual fee giving members discounted dispute access
- **Referral partnership:** revenue share on disputes referred from partner channels

**Why it waits until Year 3:** you need (a) resolved-case volume to demonstrate, (b) a brand that partners want to associate with, and (c) the bandwidth to do bespoke deals. This is also where the LawtechUK and Small Business Commissioner credibility angle becomes a commercial channel rather than just a positioning story.

---

## 9. What Kestrel will deliberately not do

- **No freemium gating on free tools.** Kills the clause-distribution mechanic.
- **No subscription at launch.** Requires retention data Kestrel doesn't have at MVP.
- **No percentage-of-claim pricing below £25k.** Reads as lawyerly, invites scrutiny.
- **No "first dispute free" promotions.** Attracts bad-faith users, undermines price anchoring.
- **No subscription discounts on dispute fees.** Couples two unit economics that should stay separate.
- **No escrow or settlement handling.** Crosses into regulated financial services territory, requires FCA authorisation, kills the venue-not-service positioning.
- **No tiered "premium dispute" service with mediator involvement.** Crosses into ADR entity territory under the 2015 Regulations.

---

## 10. Open questions to resolve before launch

1. **Tier mix sensitivity** (§4.3) — needs real data, but worth modelling worst case (Small-heavy) to understand breakeven slip
2. **Respondent fee A/B test plan** — £25 vs £35 vs £50, needs ~200 cases minimum for statistical signal, plan from month 3
3. **Good-faith refund operational definition** (§5) — needs co-founder review before the terms are drafted
4. **Tier-bumping rules** (§4.1) — edge case behaviour needs clear policy before first multi-tier dispute
5. **VAT treatment** — Kestrel will need to register for VAT once turnover crosses the threshold (£90k as of 2026). Until then, fees are inclusive. After registration, decide whether to absorb or pass through. Pass-through is cleaner but raises the headline price ~20%; absorb-and-quietly-eat is friendlier to early users but compresses margin. Worth a separate decision before Year 2.
6. **Co-founder review of all fee-related language** — particularly §6.4, which is load-bearing for the regulatory position

---

## 11. Investor narrative summary

The pricing model tells a clear story to Mercia and London VCs:

- **Year 1:** prove the wedge works. Modest unit revenue, high case volume, accumulating testimonials and resolved-case data. Loss-making but with clear leading indicators (free-tool generation rate, clause embedment rate, claim filing rate).
- **Year 2:** introduce subscription, raise Standard tier, begin partnership conversations. Approaching breakeven on contribution margin.
- **Year 3:** full breakeven. Enterprise deals begin landing. Tier mix shifts upward.
- **Year 4–5:** profitability, partnership revenue scaling, platform credibility supports premium pricing across the board.

The story is **not** "we'll charge more later because we can." It's "the value Kestrel delivers grows with platform credibility, and the price reflects that growth." Investors who understand two-sided platforms will recognise this immediately. Investors who don't will object to the modest Year 1 numbers — those are not the right investors for Kestrel anyway.
