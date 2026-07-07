-- Add created_by to the tool tables (handshakes, notices, projects) so that a
-- signed-in creator can find records they generated even if they lose the
-- share link. These tables are written by service-role API routes and read
-- publicly via an access token; this migration adds an OPTIONAL owner link and
-- a creator-scoped SELECT policy WITHOUT touching the existing anonymous,
-- token-based access paths.
--
-- Safe to run repeatedly (idempotent guards throughout).

-- ---------------------------------------------------------------------------
-- Columns (nullable — anonymous creation stays supported)
-- ---------------------------------------------------------------------------
alter table public.handshakes
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.notices
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.projects
  add column if not exists created_by uuid references auth.users(id) on delete set null;

-- ---------------------------------------------------------------------------
-- Indexes (creator lookups from the dashboard / documents page)
-- ---------------------------------------------------------------------------
create index if not exists idx_handshakes_created_by on public.handshakes (created_by);
create index if not exists idx_notices_created_by on public.notices (created_by);
create index if not exists idx_projects_created_by on public.projects (created_by);

-- ---------------------------------------------------------------------------
-- RLS: let an authenticated creator SELECT their own rows. The existing
-- token-based / anonymous policies are left in place and continue to apply.
-- ---------------------------------------------------------------------------
drop policy if exists "Creators can view their own handshakes" on public.handshakes;
create policy "Creators can view their own handshakes"
  on public.handshakes
  for select
  to authenticated
  using (created_by = auth.uid());

drop policy if exists "Creators can view their own notices" on public.notices;
create policy "Creators can view their own notices"
  on public.notices
  for select
  to authenticated
  using (created_by = auth.uid());

drop policy if exists "Creators can view their own projects" on public.projects;
create policy "Creators can view their own projects"
  on public.projects
  for select
  to authenticated
  using (created_by = auth.uid());
