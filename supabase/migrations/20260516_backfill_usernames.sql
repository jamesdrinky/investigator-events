-- Backfill usernames for profiles where username IS NULL.
-- Real users without a username slug were rendering as non-clickable divs
-- across /people and other listings. This migration generates a slug from
-- full_name + the first 6 chars of the user id (for collision safety).

UPDATE public.profiles
SET username = LOWER(
  REGEXP_REPLACE(
    COALESCE(NULLIF(TRIM(full_name), ''), 'user'),
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  )
) || '-' || LEFT(REPLACE(id::text, '-', ''), 6)
WHERE username IS NULL OR username = '';

-- Optional: enforce a unique non-null username going forward. Commented out
-- because adding a NOT NULL constraint to an existing table without a
-- default could break in-flight inserts. If James wants to add it later:
--   ALTER TABLE public.profiles ALTER COLUMN username SET NOT NULL;
--   CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (LOWER(username));
