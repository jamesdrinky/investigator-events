create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  city text not null,
  country text not null,
  region text not null,
  start_date date not null,
  end_date date,
  organiser text not null,
  association text,
  website text not null,
  category text not null,
  event_scope text not null default 'main' check (event_scope in ('main', 'secondary')),
  featured boolean not null default false,
  approved boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists events_approved_start_date_idx on public.events (approved, start_date);
create index if not exists events_slug_idx on public.events (slug);

create table if not exists public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  organiser text not null,
  city text not null,
  region text not null default 'Online / Global',
  country text not null,
  start_date date not null,
  end_date date,
  category text not null,
  website text not null,
  contact_email text not null,
  notes text,
  event_scope text not null default 'main' check (event_scope in ('main', 'secondary')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists event_submissions_status_start_date_idx on public.event_submissions (status, start_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_events_updated_at on public.events;

create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

alter table public.events enable row level security;
alter table public.event_submissions enable row level security;

drop policy if exists "Public can read approved events" on public.events;
create policy "Public can read approved events"
on public.events
for select
using (approved = true);

drop policy if exists "No direct public reads of submissions" on public.event_submissions;
create policy "No direct public reads of submissions"
on public.event_submissions
for select
using (false);
