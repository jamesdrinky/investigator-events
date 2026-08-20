-- Industry news hub: articles written by the team, cross-published from the
-- weekly newsletter, or submitted by members (pending until approved).
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  dek text,
  body text not null,
  category text not null default 'Industry news',
  hero_image_url text,
  author_name text,
  author_title text,
  author_avatar_url text,
  source text not null default 'editorial' check (source in ('editorial', 'newsletter', 'member')),
  status text not null default 'published' check (status in ('pending', 'published', 'rejected')),
  submitter_name text,
  submitter_email text,
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists articles_status_published_idx on articles (status, published_at desc);

alter table articles enable row level security;

-- Public read of published articles only; writes go through the service role.
create policy "articles_public_read" on articles
  for select using (status = 'published');
