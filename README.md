# Investigator Events

## City Hero Image Downloader

Set `PEXELS_API_KEY` in `.env.local` or your shell before running the downloader.

Example:

```bash
PEXELS_API_KEY=your_key_here npm run download:city-images
```

The downloader will:

- read the live event city list when Supabase env vars are available
- fall back to `supabase/seed/phase1_events.sql` if needed
- search Pexels for a landscape city hero image
- save images to `public/cities/{city-slug}/hero.jpg`

Existing `hero.jpg` files are skipped automatically.
