-- Event-scoped videos: extend association_videos so a video can attach to a
-- live event (shown on the event page) as well as an association. kind is set
-- to 'event_promo' for these; event_slug is denormalised for the page query.
alter table public.association_videos
  add column if not exists event_id uuid,
  add column if not exists event_slug text;

create index if not exists association_videos_event_slug_status_idx
  on public.association_videos (event_slug, status, created_at desc);

-- Event showcase videos can be longer than the 45s member clips, so raise the
-- private bucket's per-file limit to 200 MB.
update storage.buckets set file_size_limit = 209715200 where id = 'event-videos';
