-- Add queuing columns to outreach_sends
alter table outreach_sends add column if not exists status text not null default 'sent';
alter table outreach_sends add column if not exists send_after timestamptz;
alter table outreach_sends add column if not exists event_name text;
alter table outreach_sends add column if not exists html text;

-- Index for the cron to find pending sends efficiently
create index if not exists idx_outreach_sends_pending on outreach_sends(status, send_after) where status = 'pending';
