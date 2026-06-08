# Association Videos — Full Build Breakdown

_Reference doc for the member-video feature built on 2026-06-04/05. Phase 1 (free member videos) is complete and deployed to the database. Phase 2 (paid event-explainer videos) is designed-for but not yet built._

---

## 1. The goal (in plain terms)

Two related features were requested:

1. **Paid flow (Phase 2 — not built yet):** companies / associations pay to submit a 0–45 second video explaining their event. Triggered from the event-submission success screen and/or the approval email.
2. **Free flow (Phase 1 — BUILT):** signed-in members submit a 0–45 second video for free, shown on their association's page.

Hard requirement for both: **everything must pass admin verification before it appears publicly.** Nothing goes live automatically.

We agreed to build the **free flow first** because it proves the whole pipeline (upload → verify → display) with no payment vendor in the chain, then layer Stripe on a proven base.

---

## 2. What the platform already was (context we discovered)

- **Stack:** Next.js 14.2.35 (App Router) + Supabase (Postgres + Storage + Auth) + Resend (email), deployed on Vercel, also shipped as **iOS + Android apps** via Capacitor.
- **Event submission today:** `/submit-event` → `app/submit-event/actions.ts` validates + inserts into `event_submissions` (status `pending`) → sends an immediate "Event received" confirmation email via Resend → an admin later approves it in `/admin`.
  - Clarification we established: that email fires **on submission**, not on a separate "authentication" step. Approval is a later admin action.
- **Associations:** `/associations/[slug]` pages with tabs for events, members, posts, jobs (`components/associations/AssociationPageTabs.tsx`, driven by the `association_pages` table). 54 association pages exist.
- **Advertiser inquiries:** `/advertise` → `advertiser_leads` table already lets companies get in touch.
- **Existing upload pattern (the key reuse):** message images already upload via a **presigned Supabase Storage URL** (`app/api/upload-message-image/presign/route.ts`) — the client `PUT`s the file straight to storage, bypassing Vercel's 4.5 MB request-body limit. We mirrored this exact pattern for video.
- **No payment system and no video infrastructure existed** before this work.

---

## 3. Key decisions made

| Decision | Choice | Why |
|---|---|---|
| Build order | Free flow first, paid later | Prove upload→verify→display before adding payment complexity |
| Video storage | **Supabase Storage** (dedicated `event-videos` bucket) for now | Reuses the proven presign pattern, zero new vendor/env, works immediately. The DB stores a plain URL, so moving to **Vercel Blob** later is a localized change (presign route + form upload call only) |
| Payments (Phase 2) | Deferred. Leaning Stripe **web-only** | Apple/Google can demand in-app purchase + 30% for digital goods bought inside the app; web-only sidesteps that |
| Verification | Mandatory admin approval, reusing the existing `pending → approved` pattern | Brand safety; matches how `event_submissions` already works |
| New-table typing | Use `as any` casts on `.from('association_videos')` | The codebase already does this for `association_pages`, `association_posts`, etc., instead of editing the big generated `lib/types/database.ts` |

---

## 4. Files created / changed

### Created
| File | Purpose |
|---|---|
| `supabase/migrations/20260604_association_videos.sql` | The `association_videos` table + the `event-videos` storage bucket |
| `lib/data/association-videos.ts` | Data layer: `fetchApprovedVideosForAssociation(slug)` + `fetchPendingVideos()` + row mapper |
| `app/api/upload-video/presign/route.ts` | Auth-gated, rate-limited presigned-upload endpoint for videos |
| `app/associations/[slug]/submit-video/actions.ts` | Server action `submitAssociationVideoAction` — validates + inserts a `pending` row + sends confirmation email |
| `app/associations/[slug]/submit-video/page.tsx` | The submit page (auth-gated, success/error states) |
| `components/associations/SubmitVideoForm.tsx` | Client form: file pick, 45s client check, upload to signed URL, submit metadata |
| `app/admin/videos/page.tsx` | Admin verification queue (lists pending videos with previews) |
| `app/admin/videos/actions.ts` | Server actions `approveVideoAction` / `rejectVideoAction` |

### Modified
| File | Change |
|---|---|
| `components/associations/AssociationPageTabs.tsx` | Added `AssocVideo` type + `videos` prop, a new "Videos from the community" section (grid + empty state), `Video`/`Plus` icons, `Route` import, `as Route` casts on the two new links |
| `app/associations/[slug]/page.tsx` | Import + call `fetchApprovedVideosForAssociation`, map results, pass `videos={videos}` to the tabs component |
| `app/admin/page.tsx` | Added a "🎬 Video verification" link chip to the dashboard header |

---

## 5. The database (already applied to production)

Applied via Supabase MCP to project **`dbeyznsxcetpwfcicimz`** (investigator-events, eu-north-1). Verified live: table `public.association_videos` exists with RLS enabled, 0 rows; `event-videos` bucket created.

### Table: `public.association_videos`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `kind` | text | `'association_member'` (free) or `'event_promo'` (paid, Phase 2) |
| `association_page_id` | uuid | FK-feel link to `association_pages.id` |
| `association_slug` | text | Denormalised so the public query needs no join |
| `event_submission_id` | uuid | **Phase 2** — link to originating event submission (null for now) |
| `submitter_user_id` | uuid | The auth user who submitted |
| `submitter_name` | text | Captured server-side from profile |
| `submitter_email` | text | Captured server-side from auth user |
| `title` | text | required |
| `description` | text | optional |
| `video_url` | text | Public storage URL |
| `thumbnail_url` | text | optional (not generated yet) |
| `duration_seconds` | numeric | from client-side check |
| `status` | text | `pending` / `approved` / `rejected` (CHECK constrained) |
| `rejection_reason` | text | optional, set on reject |
| `is_paid` | boolean | **Phase 2** default false |
| `payment_status` | text | **Phase 2** — `none`/`pending`/`paid`/`refunded` |
| `stripe_session_id` | text | **Phase 2** |
| `created_at` | timestamptz | default now (UTC) |
| `reviewed_at` | timestamptz | set on approve/reject |

Indexes: `(association_slug, status, created_at desc)`, `(status, created_at desc)`, `(submitter_user_id)`.

### Row-Level Security (the verification gate, enforced at the DB)
- **"Public can read approved videos"** — `SELECT` allowed only `using (status = 'approved')`. Pending/rejected rows are invisible to the public/anon key.
- **"Users can read own video submissions"** — `SELECT` allowed `using (auth.uid() = submitter_user_id)` so a member can see their own pending item.
- **No public INSERT/UPDATE/DELETE policies.** All writes go through server code using the **service-role key**, which bypasses RLS. The browser can never write directly.

### Storage bucket: `event-videos`
- Public (so `<video>` tags can stream).
- `file_size_limit` = 104857600 (100 MB).
- `allowed_mime_types` = `video/mp4`, `video/quicktime`, `video/webm`.
- Uploads happen via service-role **signed URLs** (bypass storage RLS), so no extra storage policies needed.

---

## 6. End-to-end data flow

### Submission (free member video)
1. Member opens `/associations/[slug]/submit-video`. The **page server component** checks the association exists and that the user is signed in (else redirect to `/signin?next=...`).
2. `SubmitVideoForm` (client):
   - User picks a file. Client validates: type in {mp4, mov, webm}, size ≤ 80 MB, and reads the video's duration via a hidden `<video>` element — **rejects > 45s** before any upload.
   - On "Upload video": `POST /api/upload-video/presign` with the content type → gets back a Supabase **signed upload URL** + path + public URL.
   - `supabase.storage.from('event-videos').uploadToSignedUrl(...)` `PUT`s the file straight to storage (bypasses Vercel's body limit).
   - The returned public URL is stashed in a hidden field; the submit button unlocks.
3. On submit, the form posts to `submitAssociationVideoAction`:
   - `assertSameOriginRequest()` (CSRF-style guard), rate limit (5/hour), re-checks auth.
   - Confirms the association exists; validates title, that `video_url` starts with the Supabase URL (so only our storage is accepted), and duration ≤ 46s.
   - **Pulls submitter name/email from the server** (profile + auth user), never trusting the client.
   - Inserts a row with `status='pending'`, `is_paid=false` via the **admin (service-role)** client.
   - Fires a "Video received" confirmation email (Resend, fire-and-forget — only if `RESEND_API_KEY` is set).
   - Redirects to `?status=success`.

### Verification (admin)
1. `/admin/videos` (server component) requires a valid admin session cookie (`hasValidAdminSessionCookie`), else redirects to `/admin?error=auth`.
2. `fetchPendingVideos()` lists all `status='pending'` rows. Each renders with a `<video>` preview + metadata (association, submitter, email, duration).
3. **Approve** (`approveVideoAction`): sets `status='approved'` + `reviewed_at`, sends a "your video is live" email with a link, and `revalidatePath`s the association page so it appears immediately.
4. **Reject** (`rejectVideoAction`): sets `status='rejected'` + optional `rejection_reason` + `reviewed_at`.
- Both actions re-check the admin session and `assertSameOriginRequest()`.

### Display (public)
1. `app/associations/[slug]/page.tsx` calls `fetchApprovedVideosForAssociation(slug)` (only `status='approved'`), maps to a lightweight shape, passes `videos` to `AssociationPageTabs`.
2. The **Videos section** renders a responsive grid (1/2/3 columns) of `<video controls playsInline preload="metadata">` cards with title, description, submitter name. If empty, shows a "No videos yet" CTA. Both states show a **Submit a video** button.

---

## 7. Security & abuse controls

- **RLS** hides non-approved rows from the public key (defence in depth even if a query is wrong).
- **Service-role-only writes** — the browser can't insert/update video rows directly.
- **Auth required** to submit; identity (name/email) taken server-side, not from the form.
- **`assertSameOriginRequest()`** on the submit + admin actions.
- **Rate limiting:** 10/min on the presign endpoint, 5/hour on submissions.
- **Storage constraints:** bucket enforces 100 MB max + video MIME types; client enforces ≤ 80 MB and ≤ 45s before upload; server re-checks the duration and that the URL is our own storage origin.
- **Admin gate** on the verification queue + both moderation actions.

---

## 8. Testing performed

- **Typecheck:** `npx tsc --noEmit` → **0 errors** (after fixing two Next `typedRoutes` errors on the new dynamic links by casting `as Route`, matching the existing `navbar.tsx` convention).
- **Migration:** applied to production Supabase and verified the table + bucket exist.
- **Test email:** sent the real "Event received" submission-confirmation email to **james@drinky.com** via Resend (message id `5f675313-...`, `error: null`). _(Done with a one-off script that was deleted afterwards.)_
- **Dev smoke test** (`npm run dev`, on **http://localhost:3001** because 3000 was busy):
  - `/associations/abi` renders the new Videos section ("Submit a video", "No videos yet"). ✅
  - `/associations/abi/submit-video` → 200. ✅
  - `/admin/videos` → 200. ✅
  - No runtime errors in the dev log. ✅
- **Not yet done:** the manual end-to-end click-through (sign in → upload a real clip → approve → see it live). That's the last thing to verify before pushing to `main`.

---

## 9. Git / deploy status

- All work is **local only** on branch `main` — **nothing has been committed or pushed.**
- The repo auto-deploys to Vercel on push to `main`, so pushing = going live. Recommendation: do the manual click-through locally first, then either push to `main` or open a branch/PR for a Vercel **preview URL**.
- The **database migration is already live in production** (it was applied directly), so the table/bucket exist regardless of when the code ships. The code is purely additive and doesn't change existing flows.

---

## 10. How to switch storage to Vercel Blob later

Because the DB just stores a URL, moving from Supabase Storage to Vercel Blob touches only:
1. `app/api/upload-video/presign/route.ts` — issue a Blob upload token instead of a Supabase signed URL.
2. `components/associations/SubmitVideoForm.tsx` — upload via the Blob client instead of `uploadToSignedUrl`.
3. Add `@vercel/blob` dependency + `BLOB_READ_WRITE_TOKEN` env var.

Everything else (table, display, verification, validation) is unchanged.

---

## 11. Phase 2 — the paid flow (designed, not built)

The table already has `is_paid`, `payment_status`, `stripe_session_id`, `event_submission_id`, and `kind='event_promo'` so no further migration is needed. Remaining work when you're ready:
1. **Decisions needed:** Stripe web-only vs everywhere (App Store rule); one-time per video vs recurring listing fee; price.
2. Stripe Checkout + webhook (`payment_status` → `paid`), keyed off `stripe_session_id`.
3. Entry points: a "add a video to your listing" CTA on the submit-event success screen and a link in the approval email.
4. The paid video flows into the **same** `/admin/videos` verification queue (it shows a "Paid" badge there already).
5. Display the approved paid video on the event page and/or association page.

---

_End of breakdown._
