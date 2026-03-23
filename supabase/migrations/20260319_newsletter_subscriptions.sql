create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  region text,
  interests text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
