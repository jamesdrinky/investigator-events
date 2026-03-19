## Phase 1 Supabase Setup

This project expects two core tables:

- `public.events`: approved live events shown on public pages
- `public.event_submissions`: organiser submissions awaiting review
- `public.advertiser_leads`: advertiser, sponsor, vendor, and partner inquiries from `/advertise`
- Both tables now support `event_scope` with `main` and `secondary`

Apply the schema:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260310_phase1_events.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260315_submission_region.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260315_advertiser_inquiries.sql
```

Seed the real event dataset:

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed/phase1_events.sql
```

Clean out old fake/demo public events first if your Supabase table already contains mixed seed data:

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed/cleanup_public_events.sql
psql "$SUPABASE_DB_URL" -f supabase/seed/phase1_events.sql
```

Notes:

- Public pages only query rows from `events` where `approved = true`.
- The public calendar defaults to `main` events in the UI, with an `All events` toggle for broader browsing.
- The submit event form inserts into `event_submissions` with `status = 'pending'`.
- The advertise form inserts into `advertiser_leads` with inquiry type, optional region/audience context, and a default `new` status.
- Server actions use `SUPABASE_SERVICE_ROLE_KEY`, so no public insert policy is required for submissions.
- The public app now uses database data only. If no rows are present, public pages show empty states instead of local fallback data.
- The cleanup script keeps only the curated investigator event slugs and removes placeholder rows, including any `example.com` event links.
