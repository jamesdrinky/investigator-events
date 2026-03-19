alter table public.event_submissions
add column if not exists region text not null default 'Online / Global';
