# Google Play — Launch Runbook

A do-this-in-order checklist to ship the Android app. The **code side is done**
(manifest, permissions, deep-link intent filter, release signing config, icons,
`targetSdk 36`, conditional google-services). Everything below is the manual
account/secret/asset work that only you can do. For the long store description
and full data declarations, this references `STORE_SUBMISSION.md §5/§6` so
there's one source of truth.

Two facts decide your timeline — find these out first:
- **Do you have a Google Play Console account?** ($25 one-time, identity
  verification 1–3 days.)
- **Is it a personal account?** New personal accounts must run **closed testing
  with 12 testers for 14 continuous days** before production (Step 8). Google
  *organisation* accounts are exempt. This 14-day clock is usually the longest
  pole — start it ASAP.

---

## 1. Generate the upload keystore  (~15 min, one-time)
```bash
keytool -genkey -v \
  -keystore ~/investigator-events-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias investigator-events
```
- Choose strong passwords; **save them in a password manager** (losing them = you
  can never update the app under this upload key without a Play reset).
- Create `android/keystore.properties` (already gitignored):
  ```properties
  storeFile=/Users/jamesdrinkwater/investigator-events-release.jks
  keyAlias=investigator-events
  keyPassword=<your-key-password>
  storePassword=<your-keystore-password>
  ```

## 2. Build the signed AAB  (~15–30 min first time)
```bash
npm run build && npx cap sync android
cd android && ./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab` — this is what
you upload to Play.

## 3. Firebase / push notifications  (~45 min)
Push won't work on Android without this.
1. https://console.firebase.google.com → Add project "Investigator Events".
2. Add **Android app**, package `com.investigatorevents.app` → download
   `google-services.json`.
3. Drop it at `android/app/google-services.json` (gitignored). The build picks it
   up automatically.
4. Rebuild the AAB (Step 2) so the FCM config is baked in.
> Note: server-side Android push (FCM send) still isn't wired in the backend —
> iOS push works; Android delivery is a later task. The app will still build and
> run fine without it.

## 4. Enable Play App Signing + wire deep links  (~15 min, CRITICAL for deep links)
1. In Play Console, when you create the app, **opt in to Play App Signing**
   (default, recommended).
2. After uploading your first AAB, go to **Play Console → App integrity → App
   signing** and copy **both** SHA-256 fingerprints:
   - the **App signing key** certificate, and
   - the **Upload key** certificate.
3. In **Vercel → Project → Settings → Environment Variables**, set:
   - `ANDROID_CERT_SHA256` = both fingerprints, **comma-separated**
     (e.g. `14:6D:...:0A,AB:CD:...:99`).
4. **Redeploy** so `https://www.investigatorevents.com/.well-known/assetlinks.json`
   serves the real fingerprints (it currently serves a placeholder — verified).
   Confirm by opening that URL; it must show your fingerprints, not
   `REPLACE_WITH_SHA256_FINGERPRINT`.

## 5. Create the app + store listing  (~1–1.5h)
Play Console → **Create app**. Main store listing:
- **App name:** `Investigator Events`
- **Short description (≤80):** `The global calendar of private investigator events, conferences and AGMs.`
- **Full description:** use the long copy in `STORE_SUBMISSION.md §5`.
- **App category:** Business · **Tags:** networking, productivity, professional
- **Contact email / website / privacy policy:**
  - Website: `https://investigatorevents.com`
  - Privacy: `https://investigatorevents.com/privacy`
  - Support/contact: `https://investigatorevents.com/support`

### Graphics you must provide (I can't generate these)
- **App icon:** 512×512 PNG (32-bit, with alpha).
- **Feature graphic:** **1024×500** PNG/JPG — *required*, shows at the top of the
  listing. (iOS didn't need this.)
- **Phone screenshots:** 2–8, PNG/JPG, 16:9 or 9:16, each side 320–3840px.
  Suggested shot list (take on a device/emulator):
  1. The calendar/home (the core value)
  2. An event detail page
  3. The PI directory / a profile
  4. An association page
  5. Reviews or the activity feed
- *(Optional)* 7-inch & 10-inch tablet screenshots if you want tablet placement.

## 6. App content declarations  (~1h — easy to miss, common rejection causes)
Play Console → **App content**:
- **Privacy policy:** `https://investigatorevents.com/privacy`
- **App access:** the app is login-gated → choose **"All or some functionality is
  restricted"** and **provide test login credentials** (a real working account:
  email + password) so Google's reviewers can get in. *Skipping this = rejection.*
- **Ads:** No ads (no third-party ad SDKs).
- **Content rating:** complete the IARC questionnaire. It's a business/social app
  with user-generated content + messaging → expect **Everyone / PEGI 3** but
  answer honestly: declare **users can interact / share content** and that there's
  **user-generated content + direct messaging** (this may push it to Teen — that's
  fine and accurate).
- **Target audience:** 18+ (professional tool) — keeps you clear of the Families
  policy and child-data rules.
- **Data safety:** fill using the table in `STORE_SUBMISSION.md §6` (email, name,
  photos, messages, UGC, app interactions, crash logs, device IDs; encrypted in
  transit; deletion via privacy page). Confirm your `/privacy` page states how
  users request **data deletion** (Google checks this).
- **Government apps / Financial features / Health:** No.

## 7. Set up the release
- Upload `app-release.aab` to a release.
- **Release name / version:** `1.0 (1)` — matches `versionCode 1`, `versionName "1.0"`.
  Bump `versionCode` (integer) every future upload.
- **What's new:** `Initial release. Browse the global calendar of private
  investigator events, find peers, RSVP, leave reviews, and stay connected to the
  profession.`
- Countries: select your target markets (or all).

## 8. Closed testing (only if your account requires it)
If a **new personal account**: create a **Closed testing** track, add **≥12
testers** (emails or a Google Group), and keep them opted-in for **14 continuous
days** before you can apply for production access. Start this **first** so the
clock runs while you do screenshots/graphics. Org accounts can skip straight to
production.

## 9. Submit for review
- Production → create release → roll out. First review is usually **1–3 days**
  (can be hours, occasionally up to a week).

---

## Pre-submit checklist
- [ ] Keystore generated + passwords saved; `android/keystore.properties` set
- [ ] Signed `app-release.aab` builds cleanly
- [ ] `google-services.json` in place (if you want push later) + AAB rebuilt
- [ ] Play App Signing enabled; both SHA-256s in Vercel `ANDROID_CERT_SHA256`
- [ ] Live `assetlinks.json` shows real fingerprints (not the placeholder)
- [ ] Listing copy, icon (512²), feature graphic (1024×500), ≥2 screenshots
- [ ] **App access: working test login provided to reviewers**
- [ ] Content rating questionnaire completed
- [ ] Data safety form completed; `/privacy` mentions data deletion
- [ ] Target audience 18+
- [ ] Closed test running 14 days (personal accounts) OR org account confirmed exempt
- [ ] AAB uploaded, version `1.0 (1)`, what's-new set
- [ ] Deep link test after go-live: tap an `investigatorevents.com` link → app opens

## What only you can do (no way around it)
Google account + $25 + identity verification · keystore passwords · Firebase
project · screenshots + feature graphic (need a running device + design) · the
test login for reviewers · clicking submit. Everything in the repo is ready for
all of the above.
```
