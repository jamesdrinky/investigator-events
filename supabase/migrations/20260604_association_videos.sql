-- Association / event explainer videos.
--
-- Phase 1 (now): free member-submitted videos shown on an association page.
-- Phase 2 (later): paid company/association event-explainer videos. The
-- payment columns (is_paid, payment_status, stripe_session_id) and the
-- event_submission_id link are included up front so the paid flow can reuse
-- this table without another migration.
--
-- Everything lands as status='pending' and is only ever shown publicly once an
-- admin sets status='approved' (see lib/data/association-videos.ts and the
-- /admin/videos verification queue).

create table if not exists public.association_videos (
  id uuid primary key default gen_random_uuid(),

  -- 'association_member' = free member video on an association page
  -- 'event_promo'        = paid event-explainer video (phase 2)
  kind text not null default 'association_member',

  -- Which association this belongs to. Slug is denormalised so the public
  -- page query (by slug) needs no join; page_id kept for a clean FK feel.
  association_page_id uuid,
  association_slug text,

  -- Link to the originating event submission (phase 2, nullable for now).
  event_submission_id uuid,

  -- Who submitted it. user_id is the auth user (member videos require login);
  -- name/email are captured for the moderation queue + confirmation emails.
  submitter_user_id uuid,
  submitter_name text not null,
  submitter_email text not null,

  title text not null,
  description text,

  -- Stored file. For member videos this holds the object PATH inside the
  -- private `event-videos` bucket (e.g. `<user_id>/<ts>-<uuid>.mp4`); the app
  -- mints short-lived signed read URLs at render time. A full https URL is also
  -- accepted (e.g. a Vercel Blob URL in phase 2) and used as-is.
  video_url text not null,
  thumbnail_url text,
  duration_seconds numeric,

  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,

  -- Phase 2 payment fields (unused by the free flow).
  is_paid boolean not null default false,
  payment_status text not null default 'none' check (payment_status in ('none', 'pending', 'paid', 'refunded')),
  stripe_session_id text,

  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz
);

create index if not exists association_videos_slug_status_idx
  on public.association_videos (association_slug, status, created_at desc);

create index if not exists association_videos_status_created_idx
  on public.association_videos (status, created_at desc);

create index if not exists association_videos_submitter_idx
  on public.association_videos (submitter_user_id);

alter table public.association_videos enable row level security;

-- Public can read ONLY approved videos. Pending/rejected stay private and are
-- reached exclusively through the service-role admin client.
drop policy if exists "Public can read approved videos" on public.association_videos;
create policy "Public can read approved videos"
  on public.association_videos
  for select
  using (status = 'approved');

-- A signed-in user can read their own submissions (to see pending status).
drop policy if exists "Users can read own video submissions" on public.association_videos;
create policy "Users can read own video submissions"
  on public.association_videos
  for select
  using (auth.uid() = submitter_user_id);

-- No public INSERT/UPDATE/DELETE policies: writes go through the server action
-- and admin actions using the service-role key, which bypasses RLS.

-- Dedicated PRIVATE storage bucket for the video files. Private so a raw file
-- is never world-readable just because someone has the URL — pending and
-- rejected clips stay inaccessible, and approved clips are served via
-- short-lived signed URLs minted server-side (see lib/data/association-videos.ts).
-- Uploads happen via service-role signed upload URLs (which bypass storage RLS),
-- so no extra storage policies are required. allowed_mime_types is the
-- server-side guard against non-video uploads (the content type is otherwise
-- client-asserted). 100 MB cap comfortably covers a 45-second clip.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-videos',
  'event-videos',
  false,
  104857600,
  array['video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
