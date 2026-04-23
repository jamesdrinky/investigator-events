-- Outreach email tracking
create table if not exists outreach_sends (
  id uuid primary key default gen_random_uuid(),
  resend_id text,
  recipient_email text not null,
  recipient_name text,
  association text not null,
  region text,
  sender text not null default 'mike',
  subject text,
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  clicked_at timestamptz
);

-- Index for looking up sends by association
create index if not exists idx_outreach_sends_association on outreach_sends(association);

-- RLS: only service role can insert/read (server-side only)
alter table outreach_sends enable row level security;
