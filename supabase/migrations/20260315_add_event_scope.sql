alter table public.events
add column if not exists event_scope text not null default 'main';

alter table public.events
drop constraint if exists events_event_scope_check;

alter table public.events
add constraint events_event_scope_check
check (event_scope in ('main', 'secondary'));

alter table public.event_submissions
add column if not exists event_scope text not null default 'main';

alter table public.event_submissions
drop constraint if exists event_submissions_event_scope_check;

alter table public.event_submissions
add constraint event_submissions_event_scope_check
check (event_scope in ('main', 'secondary'));
