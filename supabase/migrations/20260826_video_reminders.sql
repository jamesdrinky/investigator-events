-- Weekly nudge sequence asking an event organiser to submit a promo video.
--
-- Kept separate from outreach_sends on purpose: that table is the cold-outreach
-- ledger the admin dashboard reads, its `association` column is NOT NULL, and
-- mixing automated per-event reminders into it would make "who have we actually
-- approached" unanswerable.
--
-- One row per scheduled send. The whole sequence is enqueued at approval time
-- and individual steps are cancelled — not deleted — when the video arrives, so
-- the reason a nudge stopped stays auditable.

create table if not exists public.video_reminders (
  id uuid primary key default gen_random_uuid(),

  -- What we're nudging about.
  event_submission_id uuid,
  event_name text not null,
  event_slug text,
  association_slug text,

  recipient_email text not null,
  recipient_name text,

  -- 1-based position in the sequence; see VIDEO_REMINDER_STEPS.
  step integer not null,
  send_after timestamptz not null,

  status text not null default 'pending'
    check (status in ('pending', 'sent', 'cancelled', 'failed')),
  cancelled_reason text,
  sent_at timestamptz,
  resend_id text,
  error text,

  -- Per-sequence opt-out. Every reminder carries this token; hitting it stops
  -- the remaining steps without touching the newsletter list.
  opt_out_token uuid not null default gen_random_uuid(),

  created_at timestamptz not null default now()
);

-- The cron's hot path: due, still pending.
create index if not exists video_reminders_due_idx
  on public.video_reminders (send_after)
  where status = 'pending';

create index if not exists video_reminders_opt_out_idx
  on public.video_reminders (opt_out_token);

create index if not exists video_reminders_email_idx
  on public.video_reminders (recipient_email, event_name);

-- Re-approving the same submission must not double-book the sequence.
create unique index if not exists video_reminders_unique_step_idx
  on public.video_reminders (recipient_email, event_name, step);

alter table public.video_reminders enable row level security;
-- No policies: this table is service-role only. Opt-out goes through an API
-- route using the admin client, so a token in an email can never be used to
-- read the table.

-- Ships disarmed. The sequence only sends once someone deliberately turns this
-- on, so the code can be deployed and reviewed without emailing anyone.
insert into public.feature_flags (key, enabled)
values ('video_reminders', false)
on conflict (key) do nothing;
