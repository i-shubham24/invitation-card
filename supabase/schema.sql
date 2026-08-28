-- ===========================================================================
-- RSVP storage for the wedding invitation.
-- Run this once in your Supabase project: Dashboard -> SQL Editor -> New query
-- -> paste -> Run.
-- ===========================================================================

create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text        not null,
  contact     text,
  attending   boolean,
  guests      integer     not null default 1,
  events      text[]      not null default '{}',
  message     text
);

-- Row Level Security: guests may add their RSVP; the admin (using the anon key)
-- may read them. Nobody can edit or delete via the API.
alter table public.rsvps enable row level security;

drop policy if exists "anon can insert rsvp" on public.rsvps;
create policy "anon can insert rsvp"
  on public.rsvps for insert
  to anon
  with check (true);

drop policy if exists "anon can read rsvp" on public.rsvps;
create policy "anon can read rsvp"
  on public.rsvps for select
  to anon
  using (true);

-- Allow the site to merge a guest's RSVP + blessing into their existing row,
-- and the admin's "Clear all" to remove entries.
drop policy if exists "anon can update rsvp" on public.rsvps;
create policy "anon can update rsvp"
  on public.rsvps for update
  to anon
  using (true) with check (true);

drop policy if exists "anon can delete rsvp" on public.rsvps;
create policy "anon can delete rsvp"
  on public.rsvps for delete
  to anon
  using (true);

create index if not exists rsvps_created_at_idx
  on public.rsvps (created_at desc);
