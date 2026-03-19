create table if not exists public.advertiser_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  website text,
  inquiry_type text not null default 'Advertising',
  region_or_audience text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.advertiser_leads
  add column if not exists inquiry_type text not null default 'Advertising';

alter table public.advertiser_leads
  add column if not exists region_or_audience text;

alter table public.advertiser_leads
  add column if not exists status text not null default 'new';

create index if not exists advertiser_leads_status_created_at_idx
  on public.advertiser_leads (status, created_at desc);

alter table public.advertiser_leads enable row level security;

drop policy if exists "No direct public reads of advertiser leads" on public.advertiser_leads;
create policy "No direct public reads of advertiser leads"
on public.advertiser_leads
for select
using (false);
