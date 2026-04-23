create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  actor_id uuid,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  emailed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id, is_read, created_at desc);
create index if not exists idx_notifications_actor on notifications(actor_id);

alter table notifications enable row level security;

create policy "Users can read own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);

-- Function to get user email (for notification emails)
create or replace function get_user_email(uid uuid)
returns text
language sql
security definer
as $$
  select email from auth.users where id = uid limit 1;
$$;
