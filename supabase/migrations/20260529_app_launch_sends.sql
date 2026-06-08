-- One-shot app launch announcement broadcast tracking.
-- Lets /api/admin/send-app-launch be re-run safely without double-sending
-- to the same address. Single row per (campaign, recipient_email).
create table if not exists public.app_launch_sends (
  id uuid primary key default gen_random_uuid(),
  campaign text not null default 'app_launch_v1',
  recipient_email text not null,
  user_id uuid,
  source text not null check (source in ('account', 'newsletter', 'both')),
  status text not null check (status in ('sent', 'failed')) default 'sent',
  resend_id text,
  error text,
  sent_at timestamptz not null default now(),
  unique (campaign, recipient_email)
);

create index if not exists app_launch_sends_campaign_idx
  on public.app_launch_sends(campaign);

alter table public.app_launch_sends enable row level security;
