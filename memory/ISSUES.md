
## [2026-07-07] Founder dashboard actions required (cannot be fixed in code)
1. Supabase Studio: check site_settings.maintenance_mode — if true, the entire platform renders the maintenance screen (prime "nothing works" suspect; unverifiable from this session, MCP permission-denied).
2. Vercel: confirm NEXT_PUBLIC_SITE_URL is https://onkestrel.com (STATUS.md still documents the old kestrel.pellar.co.uk value).
3. Supabase Auth: add onkestrel.com to the redirect URL allow-list; point Confirm signup / Reset password email templates at /auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&redirect_to={{ .RedirectTo }}; configure custom SMTP (built-in mailer rate-limits to a few emails/hour).
4. Supabase Auth: register Google + Microsoft OAuth credentials (buttons now show a calm error instead of failing silently, but the providers still need configuring).
5. Deprioritised per founder instruction (platform focus): apps/admin typecheck errors (Zod v3 .errors API, select handler types, join typing) and its completely broken ESLint flat-config; admin first-admin bootstrap procedure is undocumented (only a super_admin can invite admins — chicken-and-egg).
