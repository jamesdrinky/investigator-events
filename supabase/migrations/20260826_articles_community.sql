-- Take The Brief off its island.
--
-- Until now an article belonged to nobody: it had an author *name* as free text
-- and no link to the association it came from. That made the news hub a
-- read-only destination — you could publish into it, but nothing else on the
-- site could pull from it.
--
-- These two columns are what turn articles into shared content: an association
-- page can list the pieces its members wrote, and a profile can show what that
-- person has published. Both nullable, because editorial and newsletter
-- cross-posts belong to neither.

alter table articles add column if not exists association_slug text;
alter table articles add column if not exists author_user_id uuid;

-- Association page reads: "published pieces for this association, newest first".
create index if not exists articles_association_idx
  on articles (association_slug, status, published_at desc)
  where association_slug is not null;

-- Profile page reads: "what has this member published".
create index if not exists articles_author_idx
  on articles (author_user_id, status, published_at desc)
  where author_user_id is not null;
