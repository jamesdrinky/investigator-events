-- Transcode status for the two-tier video pipeline.
--   pending      = just submitted, awaiting the transcode cron
--   ready        = web-friendly (MP4/H.264) and safe to show
--   needs_manual = too big to auto-convert, or transcode failed → admin handles
alter table public.association_videos
  add column if not exists transcode_status text not null default 'pending';

create index if not exists association_videos_transcode_idx
  on public.association_videos (transcode_status, created_at);
