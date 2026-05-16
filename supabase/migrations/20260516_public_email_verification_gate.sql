alter table public.profiles
  add column if not exists email_verified_for_public boolean not null default true;

-- New code writes false for new email/password signups and true for trusted
-- OAuth providers. Existing users stay true by default so we do not
-- accidentally hide established real accounts.

-- Korper.nl is likely a real company, so do not delete or rename anyone.
-- These recent email-provider accounts should prove inbox control before
-- appearing publicly.
update public.profiles p
set
  email_verified_for_public = false,
  is_public = false
from auth.users u
where u.id = p.id
  and lower(u.email) like '%@korper.nl'
  and coalesce(u.raw_app_meta_data->>'provider', '') = 'email';

-- Quarantine obvious random-name email accounts without deleting them. They
-- can still sign in; clicking the verification email and editing their profile
-- can make them visible again.
update public.profiles p
set
  email_verified_for_public = false,
  is_public = false
from auth.users u
where u.id = p.id
  and coalesce(u.raw_app_meta_data->>'provider', '') = 'email'
  and p.full_name ~ '^[A-Za-z0-9]{14,}$'
  and p.full_name !~ '\s'
  and coalesce(p.avatar_url, '') = ''
  and coalesce(p.country, '') = ''
  and coalesce(p.specialisation, '') = ''
  and coalesce(p.headline, '') = ''
  and coalesce(p.bio, '') = '';
