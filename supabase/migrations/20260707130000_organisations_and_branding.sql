-- Organisations & firm-specific login branding.
--
-- Adds multi-tenant "organisations" (law firms / businesses) so each can have
-- its own branded login page at /f/{slug} (and, later, {slug}.onkestrel.com).
--
-- Design constraints honoured here:
--   * RLS is enabled on every new table.
--   * The login page is UNAUTHENTICATED, so branding is exposed to `anon` ONLY
--     through a security-definer function returning a whitelisted column set —
--     there is deliberately NO anon SELECT policy on the organisations table.
--   * Membership visibility, org SELECT and owner-only UPDATE are enforced via
--     security-definer helper functions to avoid RLS recursion.
--   * GDPR: organisations/membership hold business identifiers only (firm name,
--     slug, logo, brand colours). `organisation_members` links to auth.users;
--     rows cascade-delete with the user. No new personal-data categories beyond
--     the existing user link.
--
-- Idempotent throughout — safe to run repeatedly.

-- ---------------------------------------------------------------------------
-- updated_at trigger helper (idempotent create-or-replace)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- organisations
-- ---------------------------------------------------------------------------
create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 63),
  display_name text not null check (char_length(display_name) between 1 and 120),
  logo_url text,
  brand_color text not null default '#2B5C4F'
    check (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  brand_color_hover text not null default '#234A40'
    check (brand_color_hover ~ '^#[0-9A-Fa-f]{6}$'),
  tagline text check (tagline is null or char_length(tagline) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organisations enable row level security;

drop trigger if exists trg_organisations_updated_at on public.organisations;
create trigger trg_organisations_updated_at
  before update on public.organisations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- organisation_members
-- ---------------------------------------------------------------------------
create table if not exists public.organisation_members (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (organisation_id, user_id)
);

alter table public.organisation_members enable row level security;

create index if not exists idx_org_members_user on public.organisation_members(user_id);
create index if not exists idx_org_members_org on public.organisation_members(organisation_id);

-- ---------------------------------------------------------------------------
-- profiles.organisation_id (nullable link)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists organisation_id uuid
    references public.organisations(id) on delete set null;

create index if not exists idx_profiles_organisation on public.profiles(organisation_id);

-- ---------------------------------------------------------------------------
-- Security-definer helpers (bypass RLS internally → prevent policy recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organisation_members m
    where m.organisation_id = org_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_owner(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organisation_members m
    where m.organisation_id = org_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

-- organisations: members can read their org; owners can update branding.
-- No INSERT/DELETE policy — creation happens via create_organisation() below.
drop policy if exists "Members can view their organisation" on public.organisations;
create policy "Members can view their organisation"
  on public.organisations
  for select
  to authenticated
  using (public.is_org_member(id));

drop policy if exists "Owners can update their organisation" on public.organisations;
create policy "Owners can update their organisation"
  on public.organisations
  for update
  to authenticated
  using (public.is_org_owner(id))
  with check (public.is_org_owner(id));

-- organisation_members: rows are visible to fellow members of the same org.
drop policy if exists "Members can view co-members" on public.organisation_members;
create policy "Members can view co-members"
  on public.organisation_members
  for select
  to authenticated
  using (public.is_org_member(organisation_id));

-- ---------------------------------------------------------------------------
-- Anon-safe branding read (whitelisted columns only — NO table exposure)
-- ---------------------------------------------------------------------------
create or replace function public.get_organisation_branding(org_slug text)
returns table (
  slug text,
  display_name text,
  logo_url text,
  brand_color text,
  brand_color_hover text,
  tagline text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select o.slug, o.display_name, o.logo_url, o.brand_color, o.brand_color_hover, o.tagline
  from public.organisations o
  where o.slug = lower(org_slug)
  limit 1;
$$;

revoke all on function public.get_organisation_branding(text) from public;
grant execute on function public.get_organisation_branding(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Slug availability (for the create-organisation flow)
-- ---------------------------------------------------------------------------
create or replace function public.organisation_slug_available(org_slug text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    org_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(org_slug) between 2 and 63
    and not exists (
      select 1 from public.organisations o where o.slug = lower(org_slug)
    );
$$;

revoke all on function public.organisation_slug_available(text) from public;
grant execute on function public.organisation_slug_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Atomic organisation creation: org + owner membership + profile link.
-- Runs as definer so it can bootstrap the first owner membership without a
-- permissive INSERT policy. Guards authentication and one-org-per-user.
-- ---------------------------------------------------------------------------
create or replace function public.create_organisation(org_name text, org_slug text)
returns public.organisations
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  new_org public.organisations;
begin
  if uid is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if org_name is null or char_length(trim(org_name)) = 0 then
    raise exception 'Organisation name is required' using errcode = '22023';
  end if;

  if org_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' or char_length(org_slug) not between 2 and 63 then
    raise exception 'Invalid organisation slug' using errcode = '22023';
  end if;

  if exists (select 1 from public.organisation_members m where m.user_id = uid) then
    raise exception 'You already belong to an organisation' using errcode = '23505';
  end if;

  insert into public.organisations (slug, display_name)
  values (lower(org_slug), trim(org_name))
  returning * into new_org;

  insert into public.organisation_members (organisation_id, user_id, role)
  values (new_org.id, uid, 'owner');

  update public.profiles
     set organisation_id = new_org.id,
         updated_at = now()
   where id = uid;

  return new_org;
end;
$$;

revoke all on function public.create_organisation(text, text) from public;
grant execute on function public.create_organisation(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public-read `org-logos` bucket + owner-scoped write policies.
-- Logos live under a `{organisation_id}/` prefix; only that org's owners may
-- upload/update/delete, and anyone may read (public bucket for the login page).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

drop policy if exists "Org logos are publicly readable" on storage.objects;
create policy "Org logos are publicly readable"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'org-logos');

drop policy if exists "Org owners upload logos" on storage.objects;
create policy "Org owners upload logos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    and public.is_org_owner(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Org owners update logos" on storage.objects;
create policy "Org owners update logos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    and public.is_org_owner(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    and public.is_org_owner(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "Org owners delete logos" on storage.objects;
create policy "Org owners delete logos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'org-logos'
    and (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    and public.is_org_owner(((storage.foldername(name))[1])::uuid)
  );
