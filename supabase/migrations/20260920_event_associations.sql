-- Multi-association events.
--
-- `events.association` + `events.co_association` allowed exactly two, which
-- was already being worked around in prose: the D.A.CH Forum names four
-- patrons (BUDEG, ÖDV, FSPD, SFPP) in its description and links to none of
-- them, and the SNARP AGM describes a joint meeting with WAD the same way.
--
-- Labels are stored as text, not a foreign key, because the whole site
-- resolves branding through findAssociationBranding(label) and several
-- listed bodies have no row of their own yet. `role` is kept because a
-- patron is not a co-host, and association pages will want to say which.

create table if not exists public.event_associations (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  label       text not null,
  role        text not null default 'co-host'
              check (role in ('host', 'co-host', 'patron', 'supporter')),
  position    int  not null default 0,
  created_at  timestamptz not null default now(),
  unique (event_id, label)
);

create index if not exists event_associations_event_idx
  on public.event_associations (event_id, position);
create index if not exists event_associations_label_idx
  on public.event_associations (label);

alter table public.event_associations enable row level security;

-- Readable by anyone (event pages are public); writes stay service-role only,
-- matching how events themselves are moderated.
drop policy if exists "event_associations are public" on public.event_associations;
create policy "event_associations are public"
  on public.event_associations for select using (true);

-- Backfill the two existing columns so nothing is lost on cutover.
insert into public.event_associations (event_id, label, role, position)
select id, trim(association), 'host', 0
  from public.events
 where association is not null and trim(association) <> ''
on conflict (event_id, label) do nothing;

insert into public.event_associations (event_id, label, role, position)
select id, trim(co_association), 'co-host', 1
  from public.events
 where co_association is not null and trim(co_association) <> ''
on conflict (event_id, label) do nothing;
