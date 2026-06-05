-- Simple key/value feature flags, read + written only via the service-role
-- admin client (no public access). Used to lock the public video-submission
-- flow on/off from the admin panel without a redeploy.
create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

-- Seed the video-submissions flag as ON (open for testing).
insert into public.feature_flags (key, enabled)
values ('video_submissions', true)
on conflict (key) do nothing;

alter table public.feature_flags enable row level security;
-- No policies: only the service-role key (which bypasses RLS) touches this table.
