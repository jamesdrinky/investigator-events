-- Add an 'archived' status for event submissions.
--
-- 'archived' is a soft hold — "not approving this right now, but not a hard
-- reject either." It keeps the submission out of the active pending queue while
-- staying restorable. Admin can move pending → archived and archived → pending.
alter table public.event_submissions
  drop constraint if exists event_submissions_status_check;

alter table public.event_submissions
  add constraint event_submissions_status_check
  check (status in ('pending', 'approved', 'rejected', 'archived'));
