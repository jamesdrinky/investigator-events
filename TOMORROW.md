# Tomorrow's Submission Checklist

One-page, do-in-order. Read top to bottom while you work.

Total time: ~4 hours focused + ~30 min for Xcode quirks.

---

## ⏱ 0. Quick env check (5 min)

In your terminal at the repo root:

```bash
# Pull latest
git pull origin main

# Confirm the demo account is set up (already done — re-running is safe)
npx tsx scripts/create-apple-demo-account.ts
```

In **Vercel → Project Settings → Environment Variables**, confirm these exist (or add them):
- `APPLE_TEAM_ID` = `72YT6AF3RL`
- `ANDROID_CERT_SHA256` = (leave for tomorrow, only needed for Play Store)

Redeploy if you added anything.

---

## ⏱ 1. Xcode wiring (30 min)

Open `ios/App/App.xcworkspace`.

1. **Select the App target** in the left navigator → **Signing & Capabilities** tab.
2. **+ Capability** → add **Push Notifications**.
3. **+ Capability** → add **Associated Domains**. Under it add:
   - `applinks:investigatorevents.com`
   - `applinks:www.investigatorevents.com`
   - `webcredentials:investigatorevents.com`
4. **+ Capability** → add **Sign in with Apple**.
5. **Build Settings** tab → search "Code Signing Entitlements" → set to `App/App.entitlements` for both Debug and Release.
6. **General** tab → **Deployment Info** → uncheck **iPad** under Supported Destinations (iPhone only for v1).
7. **General** tab → **Identity** → set **Version** `1.0.0`, **Build** `1`.
8. **Signing & Capabilities** → make sure **Automatically manage signing** is on and the **Team** dropdown shows your team (`72YT6AF3RL`).

---

## ⏱ 2. App icon (15 min — skip if already done)

1. Get a 1024×1024 PNG of your logo (no transparency, no rounded corners — Apple rounds them).
2. In Xcode left navigator → **App** → **Assets.xcassets** → **AppIcon**.
3. Drag the 1024 PNG onto the largest slot. Xcode 14+ auto-generates all sizes.

---

## ⏱ 3. TestFlight build (45 min total — 15 active, 30 waiting)

1. In Xcode top bar, set the run destination to **Any iOS Device (arm64)**.
2. **Product → Archive**. Wait ~5 min for compile.
3. The Organizer window opens. Click **Distribute App** → **App Store Connect** → **Upload**.
4. Wait ~5-30 min for App Store Connect to process. You'll get an email when done.

---

## ⏱ 4. Smoke test on phone (20 min)

1. Install **TestFlight** from the App Store on your iPhone (if not already).
2. App Store Connect → My Apps → IE Events → **TestFlight** tab.
3. **Internal Testing** → New Group → name it "Internal" → add yourself (your Apple ID email).
4. Wait ~1 min for TestFlight to invite you. Open TestFlight on phone, install IE Events.
5. **Test these flows** (anything broken = fix before submitting):
   - [ ] Sign in with Apple → completes a login, lands on home / profile setup
   - [ ] Sign in with Google → completes
   - [ ] Sign in with LinkedIn → completes
   - [ ] Tap "+ Submit" on Events tab → form opens, can fill it in
   - [ ] Upload an avatar (Profile → Edit → photo)
   - [ ] Push notification arrives (use admin's "Send test email" or similar trigger)
   - [ ] No crashes opening any tab

---

## ⏱ 5. App Store Connect listing (45 min)

Go to: https://appstoreconnect.apple.com → My Apps → **+ → New App** (or open existing).

Use this listing copy (full version in `STORE_SUBMISSION.md` §5):

| Field | Value |
|---|---|
| Name | `Investigator Events` |
| Subtitle | `Global PI conference calendar` |
| Bundle ID | `com.investigatorevents.app` |
| SKU | `investigator-events-1` |
| Primary Language | English (UK) |
| Primary Category | Business |
| Secondary Category | Social Networking |
| Support URL | `https://investigatorevents.com` |
| Marketing URL | `https://investigatorevents.com` |
| Privacy Policy URL | `https://investigatorevents.com/privacy` |
| Copyright | `© 2026 Investigator Events` |

**Promotional Text** (editable any time without re-review):

> The live calendar of every private investigation conference, AGM, training day and association meeting worldwide. Connect with peers, RSVP, and never miss an event.

**Description** — copy the full ~3000-char block from `STORE_SUBMISSION.md` §5.

**Keywords** (100 chars max):

```
private investigator,investigations,PI conference,investigator events,investigation,AGM,detective,fraud
```

**What's New in This Version** (1.0):

> Initial release. Browse the global calendar of private investigator events, find peers in the directory, RSVP, leave reviews, and stay connected to the profession.

---

## ⏱ 6. Privacy nutrition labels (15 min)

App Store Connect → **App Privacy** → Get Started. Use answers from `STORE_SUBMISSION.md` §6. Quick version:

- **Data used to track you**: None
- **Data linked to you**: Email Address, Photos or Videos, User Content, User ID, Crash Data
- **Data not linked to you**: None

For each data type, purposes are: **App Functionality** and (where you collect them) **Analytics**. Encryption in transit: Yes.

---

## ⏱ 7. App Review Information (10 min)

App Store Connect → app version → **App Review Information**. **Required** — without this Apple bounces on first review.

**Sign-in required**: Yes

**Demo Account**:
- Username: `apple-reviewer@investigatorevents.com`
- Password: use `APPLE_REVIEW_DEMO_PASSWORD` from local `.env.local`

(That account is already created in your Supabase. The password is stored locally only in `.env.local` — change it if you ever want, re-run `npx tsx scripts/create-apple-demo-account.ts`, and update App Review Info.)

**Notes** — paste this block verbatim:

> Investigator Events is the global event calendar for private investigators. It aggregates conferences, AGMs, training days, association meetings, and networking events from associations worldwide.
>
> **To test the app:**
> - Sign in with Apple is the fastest path. Use any Apple ID — a new profile will be created. The first time you sign in with Apple, you'll land on a profile setup page where you can fill in optional details and skip.
> - Alternatively, use the demo account credentials above to sign in with email/password.
>
> **Features to evaluate:**
> - Calendar (Events tab): browse events by month, swipe horizontally through cards per month, filter by country/region/category.
> - Network tab: browse professional associations and their member directories.
> - Forum tab: read community posts. Open the welcome post to see how content displays.
> - Profile tab: view the demo account profile.
> - "I'm Going" button on any event opens the public RSVP flow. RSVPs are public to other users.
>
> **Sign in with Apple:** is offered alongside Google and LinkedIn as required by Guideline 4.8. All three are configured via Supabase Auth.
>
> **Push notifications:** are used to notify users of new connections, messages, event invitations, and platform updates. Standard transactional only; no marketing pushes.
>
> **Self-reported credentials:** users add their own association memberships. Investigator Events does not verify professional licensing or credentials — this is disclosed in the Terms of Service (section 5). The "verified" badge on a profile indicates LinkedIn OAuth or an admin identity check, not licensing verification.
>
> **Contact:** james@drinky.com for any questions during review.

**Contact Information**:
- First name: `James`
- Last name: `Drinkwater`
- Phone: (your number — required by Apple)
- Email: `james@drinky.com`

---

## ⏱ 8. Screenshots (1-2 hours)

Required: **6.7" iPhone** (iPhone 16 Pro Max). Apple usually accepts a 6.7" set as a substitute for older 6.5"/5.5" sizes.

**Easiest method:**
1. Open Xcode → **Open Developer Tool → Simulator**
2. Pick **iPhone 16 Pro Max**
3. Open Safari in the simulator, go to `https://investigatorevents.com`, sign in with the demo account
4. Press **Cmd+S** on each screen to save a screenshot to your Mac desktop
5. Take 4-6 of these:
   - Home tab (logged in, with upcoming events visible)
   - Events tab (the new horizontal-scroll calendar)
   - An event detail page
   - Network tab (association directory)
   - Profile tab
   - Optional: Forum tab or messaging
6. Upload all 6 to App Store Connect → app version → **iPhone screenshots → 6.7"**

If you have time, add light marketing text overlays in Figma or Preview — not required but lifts the listing significantly.

---

## ⏱ 9. Submit

App Store Connect → app version → top right → **Add for Review** → confirm. Submitted.

**Expected wait**: 24-72 hours.

**If rejected**: 95% chance it's a "please clarify X" message you can answer in the resolution centre. Reply, push a new build if asked, second review usually approves.

---

## Common gotchas (you'll thank me)

- **"Asset validation failed: missing icon"** → AppIcon set wasn't filled. Go back to step 2.
- **"Provisioning profile doesn't match entitlements"** → in Xcode, click the warning, Xcode regenerates. Or trigger via Signing & Capabilities → Team dropdown re-selected.
- **"Sign in with Apple bundle ID doesn't match"** → the Service ID you created earlier (`com.investigatorevents.app.web`) must match what's in Supabase Auth → Providers → Apple. Don't confuse with the bundle ID (`com.investigatorevents.app`).
- **Universal Link doesn't work on TestFlight build** → tap an investigatorevents.com link from iMessage. If it opens Safari instead of the app, the AASA file isn't being served correctly. Check `https://investigatorevents.com/.well-known/apple-app-site-association` returns JSON with your Team ID (set `APPLE_TEAM_ID` in Vercel if missing).
- **Push notifications not arriving on TestFlight** → entitlements file's `aps-environment` is set to `production`. For TestFlight builds (development signing), it should also work because Apple's APNs accepts both. If they really don't arrive, double-check Push Notifications capability is enabled in Xcode → Signing & Capabilities.

---

That's the whole submission. You've got this.
