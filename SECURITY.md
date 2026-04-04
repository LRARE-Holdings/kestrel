# Security & Compliance

Kestrel handles personal data and commercially sensitive dispute information. Security is not a feature — it is a prerequisite. A breach would not just be a technical incident; it would destroy the trust that the entire product depends on.

## Regulatory Obligations

### ICO Registration (Mandatory Before Launch)

Kestrel must be registered with the Information Commissioner's Office before processing any personal data. This includes beta testing, pilot programmes, and any form of user-facing deployment.

**Registration details:**
- Data controller: OnKestrel Limited
- Lawful basis for processing: Legitimate interests (dispute resolution services) + Consent (where appropriate)
- Data protection contact must be named in registration

### GDPR Compliance

Kestrel processes personal data of UK residents under the UK GDPR (retained EU law). Key obligations:

**Data Minimisation:** Collect only what is necessary for dispute resolution. Do not collect data "in case it's useful later."

**Purpose Limitation:** Data collected for dispute resolution is used for dispute resolution. Not marketing. Not analytics (unless anonymised and aggregated). Not AI training.

**Storage Limitation:** Define retention periods for every data category:

| Data Category | Retention Period | Justification |
|---|---|---|
| Account data (name, email) | Account lifetime + 30 days after deletion | Service provision |
| Dispute records | Dispute closure + 6 years | Limitation period for contract claims (England & Wales) |
| Evidence files | Same as dispute records | Part of dispute record |
| Communication logs | Same as dispute records | Part of dispute record |
| Generated documents (unsigned) | 90 days if unauthenticated | User convenience; no legal obligation to retain |
| AI interaction logs | Same as associated dispute | Auditability requirement |
| Server logs | 90 days | Debugging and security monitoring |

**Right of Access (Subject Access Requests):** Build an export function from day one. A user must be able to download all data Kestrel holds about them in a machine-readable format. Do not wait until someone asks — build it into the account settings.

**Right to Erasure:** Users can request deletion of their account and associated data. However, dispute records may need to be retained for the limitation period even after account deletion. In that case:
- Anonymise the personal data within the dispute record
- Delete all non-essential personal data
- Retain only what is legally required, with a documented justification
- Inform the user what was deleted and what was retained (and why)

**Right to Portability:** Users can export their data. Same mechanism as Subject Access Requests.

**Data Processing Agreements:** Any third-party service that processes personal data on Kestrel's behalf must have a signed DPA. This includes:
- Supabase (database hosting)
- Vercel (application hosting)
- Resend (email delivery)
- Any AI provider used for dispute intake or notifications
- Any mediator marketplace partners

---

## Threat Model

### Threat 1: Cross-Party Data Leakage
**Risk:** Party A sees Party B's submissions, evidence, or strategy.
**Impact:** Catastrophic. Destroys platform trust, potential legal liability.
**Mitigation:**
- Row Level Security on all dispute-related tables
- Per-party database policies — no application-level access control only
- Integration tests that attempt cross-party access and must fail
- No admin UI that displays both parties' data side-by-side
- AI agents never receive cross-party data in their context

### Threat 2: Clause Library Tampering
**Risk:** Legal text is modified maliciously or accidentally, producing incorrect contracts.
**Impact:** Severe. Users rely on generated documents for legal agreements.
**Mitigation:**
- Clause library is code, version-controlled in Git
- All changes require PR review by a human
- Clause integrity checksums verified at build time
- Generated documents include clause version metadata
- No runtime modification of clause content

### Threat 3: Evidence File Exploits
**Risk:** Malicious files uploaded as "evidence" — malware, oversized files, scripts disguised as documents.
**Impact:** High. Could compromise other users or platform infrastructure.
**Mitigation:**
- File type whitelist (PDF, DOCX, XLSX, PNG, JPG, JPEG only)
- File size limits (25MB per file, 100MB per dispute)
- Malware scanning before storage
- Files served via signed URLs with expiry, never directly
- No client-side rendering of uploaded files without sanitisation

### Threat 4: Account Takeover
**Risk:** Attacker gains access to a user's account and their dispute data.
**Impact:** High. Access to commercially sensitive information.
**Mitigation:**
- Magic link authentication (no passwords to steal)
- Session expiry and rotation
- Login notification emails
- Rate limiting on auth endpoints
- Suspicious activity detection (multiple failed attempts, unusual locations)

### Threat 5: Dispute Manipulation
**Risk:** A party tampers with their own submissions after the fact to gain advantage.
**Impact:** Medium-high. Undermines dispute integrity.
**Mitigation:**
- Submissions are immutable once filed (append-only, no edits)
- All submissions timestamped with server time (not client time)
- Full audit trail of all dispute actions
- Hash of submission content stored at creation time for tamper detection

### Threat 6: Platform Abuse
**Risk:** Filing frivolous or harassing disputes to intimidate the other party.
**Impact:** Medium. Erodes platform trust, potential legal exposure.
**Mitigation:**
- Rate limiting on dispute filing
- Structured dispute forms (harder to abuse than freetext)
- Reporting mechanism for abusive disputes
- Repeat-offender detection and suspension

---

## Authentication & Authorisation

### Authentication
- **Provider:** Supabase Auth
- **Methods:**
  - Email + password (with email confirmation)
  - Google OAuth (social login)
  - Microsoft / Azure AD OAuth (social login)
  - Enterprise SSO via SAML/OIDC (future — Supabase Team/Enterprise plan, dashboard-configured)
  - Passkeys / WebAuthn (deferred — pending native Supabase support)
- **Session:** JWT stored in httpOnly cookie, refreshed automatically
- **Expiry:** 7 days idle, 30 days absolute
- **Password requirements:** Minimum 8 characters (enforced client-side and by Supabase)
- **MFA:** Not required at launch, but the architecture should support adding it

### Authorisation Model

```
User → Account → Organisation (future) → Dispute (as party)
```

Roles at launch:
- **Unauthenticated:** Access to free tools only
- **Authenticated User:** Can file and manage disputes, save documents, manage account
- **Dispute Party:** Access to specific dispute (via RLS, not application role)

Do not build an admin role into the application at launch. Admin operations (user management, dispute inspection for compliance) happen through Supabase dashboard with separate audit logging.

---

## Encryption

| Data State | Method | Notes |
|---|---|---|
| In transit | TLS 1.3 | Enforced by Vercel and Supabase |
| At rest (database) | AES-256 | Supabase managed encryption |
| At rest (files) | AES-256 | Supabase Storage encryption |
| Backups | Encrypted | Supabase managed |

Consider field-level encryption for highly sensitive dispute content in future phases. Not required for launch, but the data model should not make it impossible to add later.

---

## Incident Response

If a security incident occurs:

1. **Contain:** Isolate affected systems. Revoke compromised credentials.
2. **Assess:** Determine scope — what data was accessed, by whom, for how long.
3. **Notify:** If personal data was breached, notify the ICO within 72 hours (UK GDPR requirement). Notify affected users without unreasonable delay.
4. **Remediate:** Fix the vulnerability. Verify the fix.
5. **Document:** Full incident report with timeline, impact, root cause, and remediation.

This process must exist before launch, even if it's just a documented checklist. Do not wait for the first incident to figure out how to respond.

---

## Security Headers

All responses must include:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Configure these in Next.js middleware or `next.config.ts` headers. Test with securityheaders.com before launch.

---

## Dependency Security

- Run `npm audit` in CI — fail the build on high/critical vulnerabilities
- Enable Dependabot or Renovate for automated dependency updates
- Pin major versions — allow minor/patch auto-updates
- Review changelogs for security-relevant dependencies (Supabase, Next.js, auth libraries)
- No dependencies with fewer than 100 weekly downloads unless absolutely necessary and manually reviewed