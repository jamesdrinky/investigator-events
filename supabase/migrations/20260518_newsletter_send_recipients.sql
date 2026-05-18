-- Per-recipient log for weekly newsletter sends.
-- newsletter_sends previously only stored aggregate counts.
create table if not exists public.newsletter_send_recipients (
  id uuid primary key default gen_random_uuid(),
  send_id uuid not null references public.newsletter_sends(id) on delete cascade,
  email text not null,
  status text not null check (status in ('sent', 'failed')),
  error text,
  sent_at timestamptz not null default now()
);

create index if not exists newsletter_send_recipients_send_id_idx on public.newsletter_send_recipients(send_id);
create index if not exists newsletter_send_recipients_email_idx on public.newsletter_send_recipients(email);

alter table public.newsletter_send_recipients enable row level security;
