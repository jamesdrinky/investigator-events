# App Store + Play Store Submission Guide

Everything you need to ship the iOS and Android apps. Code-side prep is done — what's left is the irreducibly manual stuff (signing keys, screenshots, store listing forms).

Read this top-to-bottom once, then do it in order. **Estimated total active work: 6–8 hours** (assuming the existing Apple Developer account; new Google Play account is +1 hour signup + ~24h verification wait).

---

## What's already done in code

- **iOS Info.plist** — armv7 → arm64, privacy usage strings (camera/photo), ATS web content allow.
- **iOS App.entitlements** (`ios/App/App/App.entitlements`) — push environment, associated domains for `investigatorevents.com`, Sign in with Apple. **You still need to attach this in Xcode** — see step 1.3 below.
- **Android AndroidManifest.xml** — `POST_NOTIFICATIONS`, `CAMERA`, `READ_MEDIA_IMAGES`, `READ_EXTERNAL_STORAGE` (≤ API 32), deep-link intent filter for `investigatorevents.com` and `www.investigatorevents.com`.
- **Android build.gradle** — release signing config wired to read from `android/keystore.properties` (which is gitignored).
- **Universal Links manifests** — both served at:
  - `https://investigatorevents.com/.well-known/apple-app-site-association`
  - `https://investigatorevents.com/.well-known/assetlinks.json`
  Both read placeholder values (Team ID, SHA-256 fingerprint) from env vars — set those in Vercel after you have them (steps 1.1 and 2.2).
- **Sign in with Apple** — button visible on `/signin` and `/signup`. Auth flow goes through Supabase. **Supabase Apple provider config is required** — step 1.2 below.

---

## 1. iOS

### 1.1 Find your Apple Team ID and put it in Vercel

1. Sign in to https://developer.apple.com/account.
2. Click **Membership details**. Your **Team ID** is a 10-character string.
3. In Vercel → Project Settings → Environment Variables, add:
   - Name: `APPLE_TEAM_ID`
   - Value: your team ID
   - Environments: Production, Preview, Development
4. Redeploy. Verify by hitting `https://investigatorevents.com/.well-known/apple-app-site-association` and confirming `appID` shows your real Team ID prefix instead of `REPLACE_WITH_TEAM_ID`.

### 1.2 Configure Sign in with Apple in Supabase

This is the fiddly one. Allow ~30 minutes the first time.

1. **Apple Developer → Identifiers**:
   - Find the App ID for `com.investigatorevents.app` (or create one). Enable the **Sign In with Apple** capability.
2. **Apple Developer → Identifiers → Services IDs**:
   - Click + to create a new Service ID.
   - Description: `Investigator Events Web Auth`
   - Identifier: `com.investigatorevents.app.web` (must differ from the bundle ID).
   - Enable **Sign In with Apple**, click **Configure**:
     - Primary App ID: `com.investigatorevents.app`
     - Domains and Subdomains: `<your-supabase-project>.supabase.co`
     - Return URLs: `https://<your-supabase-project>.supabase.co/auth/v1/callback`
3. **Apple Developer → Keys** → + → check **Sign In with Apple**, configure with the App ID, register the key, **download the `.p8` file** (you can only download it once — keep it safe).
4. **Supabase Dashboard → Authentication → Providers → Apple**:
   - Toggle on.
   - Services ID: `com.investigatorevents.app.web`
   - Team ID: your Apple Team ID (from 1.1)
   - Key ID: from the key page in Apple Dev portal (10 chars)
   - Secret Key (paste contents of the `.p8`)
   - Save.
5. Test in dev: open `/signin` in a browser, click "Continue with Apple". Should redirect to Apple, then back to your callback. If you see "Invalid client", the Service ID isn't matched correctly.

### 1.3 Attach App.entitlements in Xcode

The file exists at `ios/App/App/App.entitlements` but Xcode doesn't know to use it yet.

1. Open `ios/App/App.xcworkspace` in Xcode.
2. Select the App target → **Signing & Capabilities** tab.
3. Click **+ Capability** and add: **Push Notifications**, **Associated Domains**, **Sign in with Apple**.
4. Under Associated Domains, add: `applinks:investigatorevents.com`, `applinks:www.investigatorevents.com`, `webcredentials:investigatorevents.com` (these match the entitlements file).
5. Build → Settings → search "code signing entitlements" → set to `App/App.entitlements` for both Debug and Release.

### 1.4 App icon

Drop a single 1024×1024 PNG (no transparency, no rounded corners — Apple rounds them automatically) into Xcode → `App/Assets.xcassets/AppIcon.appiconset`. Xcode 14+ accepts a single 1024×1024 and generates the rest. Otherwise use a tool like https://appicon.co.

### 1.5 Version + build number

Default is `1.0` / `1`. Bump in Xcode → App target → General → Identity:
- **Version (CFBundleShortVersionString)**: `1.0.0` for first release.
- **Build (CFBundleVersion)**: `1`. Increment for every TestFlight upload.

### 1.6 Archive + TestFlight

1. In Xcode: **Product → Archive** (target must be Any iOS Device, not a simulator).
2. When the Organizer opens, click **Distribute App → App Store Connect → Upload**.
3. Wait for the build to process in App Store Connect (5–30 min).
4. Test on your device via TestFlight before submitting to review.

### 1.7 App Store Connect listing

Go to https://appstoreconnect.apple.com → My Apps → + → New App.

- **Bundle ID**: `com.investigatorevents.app`
- **SKU**: `investigator-events-1`
- **Primary language**: English (UK)
- **Category**: Primary = Business, Secondary = Social Networking

Fill in the listing using the copy in section 5 below.

### 1.8 Privacy nutrition labels

App Store Connect → App Privacy → answers in section 6 below.

---

## 2. Android

### 2.1 Generate a release keystore

Once-only. Do this on your machine. **Back the resulting `.jks` file up off-machine** — losing it means you can never publish updates to this app.

```bash
keytool -genkey -v \
  -keystore ~/investigator-events-release.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias investigator-events
```

You'll be prompted for a keystore password and a key password. Use something strong, save them in a password manager.

Now create `android/keystore.properties` (gitignored):

```properties
storeFile=/Users/jamesdrinkwater/investigator-events-release.jks
storePassword=<your-keystore-password>
keyAlias=investigator-events
keyPassword=<your-key-password>
```

### 2.2 Get the SHA-256 fingerprint and put it in Vercel

```bash
keytool -list -v -keystore ~/investigator-events-release.jks -alias investigator-events
```

Look for `SHA256: AB:CD:EF:...` (32 hex pairs). Copy that.

In Vercel → Project Settings → Environment Variables, add:
- Name: `ANDROID_CERT_SHA256`
- Value: the colon-separated SHA-256 fingerprint
- Environments: Production, Preview, Development

Redeploy. Verify `https://investigatorevents.com/.well-known/assetlinks.json` returns the real fingerprint.

> **If you use Play App Signing** (recommended — Play re-signs your app with their own key), you'll get a *second* fingerprint to add. Comma-separate both in `ANDROID_CERT_SHA256`. The route handler splits on commas.

### 2.3 Push notifications: google-services.json

Push won't work without Firebase Cloud Messaging.

1. Go to https://console.firebase.google.com → Add Project → name "Investigator Events".
2. Add Android app → package `com.investigatorevents.app` → download `google-services.json`.
3. Drop the file at `android/app/google-services.json` (gitignored).
4. The build.gradle already conditionally applies the google-services plugin when this file exists.
5. In Supabase → Edge Functions or your push code path, configure the FCM server key — but only if you wired up server-side push elsewhere (the current `lib/capacitor.ts` only registers tokens client-side).

### 2.4 App icon

Open `android/` in Android Studio → File → New → Image Asset. Pick foreground (your 1024×1024 logo, ~70% padded) and background colour (white). Click Next → Finish. Generates all `mipmap-*` resolutions automatically.

### 2.5 Version + build number

In `android/app/build.gradle`:
```groovy
versionCode 1
versionName "1.0"
```
Bump `versionCode` (integer) for every Play upload, `versionName` (display string) per release.

### 2.6 Build the AAB

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`. This is what you upload to Play.

### 2.7 Google Play Developer Account

If you don't have one yet: https://play.google.com/console → $25 one-time, identity verification takes 24–48 hours.

### 2.8 Play Console listing

Play Console → Create app → fill in metadata using the copy in section 5.

**Important new-account constraint**: as of late 2023, brand-new Play accounts must run a "closed testing" track with at least 12 testers for 14 days before going public. Plan for this. Personal accounts can sometimes skip it; organisation accounts must do it.

### 2.9 Data Safety form

Play Console → App content → Data Safety. Use the answers in section 6 below.

---

## 3. Privacy policy

Already live at https://investigatorevents.com/privacy. It's UK GDPR compliant. Both stores need this URL — paste it into:
- App Store Connect → App Privacy → Privacy Policy URL
- Play Console → App content → Privacy Policy

---

## 4. Pre-submission checklist

Tick all of these before hitting Submit:

- [ ] Apple Team ID set in Vercel as `APPLE_TEAM_ID`
- [ ] Android cert SHA-256 set in Vercel as `ANDROID_CERT_SHA256`
- [ ] Both well-known files return your real values (curl them)
- [ ] Supabase Apple provider configured + tested with a real Apple ID
- [ ] Sign in with Apple, Google, LinkedIn all complete a full login on a TestFlight build
- [ ] Push notifications fire on iOS TestFlight (real device, not simulator)
- [ ] Push notifications fire on Android via Firebase test message
- [ ] Avatar / banner upload works on both platforms (camera + photo library prompt at least once each)
- [ ] Universal links: tap an investigatorevents.com link from Mail / Messages on iOS, app opens. Same on Android.
- [ ] App icon shows correctly on home screen (no white squircle, no Capacitor placeholder)
- [ ] Splash screen branded (1.5s, white bg per `capacitor.config.ts`)
- [ ] Version + build number bumped from 1.0/1
- [ ] Sample of every flow tested on a real device, not just simulator

---

## 5. Listing copy

### App name
**iOS App Store name (max 30 chars)**: `Investigator Events`
**iOS subtitle (max 30 chars)**: `Global PI conference calendar`

**Android Play title (max 30 chars)**: `Investigator Events`
**Android short description (max 80 chars)**: `The global calendar of private investigator events, conferences and AGMs.`

### Promotional text (iOS, max 170 chars — editable any time without review)

> The live calendar of every private investigation conference, AGM, training day and association meeting worldwide. Connect with peers, RSVP, and never miss an event.

### Description (both stores, ~3000 chars)

> **Investigator Events is the global event calendar for private investigators.**
>
> Stop hunting for conference dates across dozens of association websites. Investigator Events brings every PI event in the world into one searchable, filterable calendar — refreshed continuously by the community.
>
> **What's inside**
>
> 📅 **Live calendar of every PI event** — conferences, AGMs, training days, association meetings, networking mixers. Filter by country, region, association, month, or keyword.
>
> 👥 **The PI directory** — find verified private investigators, see their associations, message them directly, follow updates on their work.
>
> 🤝 **Associations** — every major investigator association in one place. See upcoming events, member counts, contact details, and what each association stands for.
>
> ⭐ **Reviews** — read first-hand reviews from peers who actually attended. Decide whether a conference is worth your time before you book.
>
> 💬 **Forum + activity feed** — share insights, post job referrals, discuss cases (within ethics), and stay close to the global PI community.
>
> ✅ **LinkedIn-verified profiles** — the green check on a profile means we matched it to a real LinkedIn account. No bots, no impersonators.
>
> 🔔 **Smart notifications** — get notified the moment events are added in your country, when peers connect, or when reviews land for events you attended.
>
> Free to use. Free to list events. Built for the profession by the profession.
>
> **Who it's for**
>
> - Private investigators looking for CPD, networking, and peer connection
> - Investigation firm partners deciding which conferences to send staff to
> - Professional investigation associations promoting their events to a global audience
> - Anyone in the broader investigations sector — fraud examiners, expert witnesses, security consultants, background screeners
>
> **Privacy first**
>
> Built on UK / EU GDPR principles. We don't sell your data. We don't run third-party ad SDKs. You control what's public on your profile.
>
> Questions? Email partners@investigatorevents.com or visit investigatorevents.com.

### Keywords (iOS — max 100 chars total, comma-separated)

> private investigator,investigations,PI conference,investigator events,investigation,AGM,detective,fraud

### Categories
- **iOS Primary**: Business
- **iOS Secondary**: Social Networking
- **Android category**: Business
- **Android tags**: networking, productivity, professional

### What's New (release notes, first release)

> Initial release. Browse the global calendar of private investigator events, find peers in the directory, RSVP, leave reviews, and stay connected to the profession.

### Support URL: `https://investigatorevents.com/support` (or your contact page — confirm this exists)
### Marketing URL: `https://investigatorevents.com`
### Privacy Policy URL: `https://investigatorevents.com/privacy`
### Copyright: `© 2026 Investigator Events`

---

## 6. Privacy declarations

### App Store nutrition labels

App Store Connect → App Privacy → Get Started.

**Data Used to Track You** (third-party tracking): `None`.

**Data Linked to You** (linked to user identity):
- **Contact Info**: Email Address (account creation, communication)
- **User Content**: Photos or Videos (avatar, banner, post images), Other User Content (posts, comments, reviews)
- **Identifiers**: User ID
- **Usage Data**: Product Interaction (analytics — only if you have analytics, otherwise omit)
- **Diagnostics**: Crash Data, Performance Data (Sentry — confirm if used)

**Data Not Linked to You**: `None`.

For each, the purposes are: **App Functionality** and **Analytics** (only if you collect analytics).

### Play Data Safety form

Play Console → App content → Data Safety.

**Does your app collect or share any of the required user data types?** Yes.

**Data types collected**:

| Type | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| Email address | Yes | No | No (required for account) | Account management |
| Name | Yes | No | Yes (profile) | Account management |
| User photos | Yes | No | Yes | App functionality |
| Messages (other in-app messages) | Yes | No | Yes | App functionality |
| User-generated content (posts, reviews) | Yes | No | Yes | App functionality |
| App interactions | Yes | No | No | Analytics |
| Crash logs | Yes | No | No | App functionality |
| Device or other IDs | Yes | No | No | Account management |

**Security practices**:
- Data is encrypted in transit ✓
- You provide a way for users to request data deletion ✓ (via email — confirm /privacy mentions this)

**Data deletion**: link to `https://investigatorevents.com/privacy#deletion` or similar.

---

## 7. What I (Claude) cannot do for you

Just so the boundary is clear:

1. Sign builds (you must run Xcode + the `keytool` / `gradlew` commands locally — your private keys never leave your machine).
2. Capture screenshots of the actual app on a real device.
3. Click around the Apple Developer / Supabase / Vercel / Play Console UIs.
4. Fill in App Store Connect / Play Console forms (you have the answers above — paste them in).
5. Write the `.p8` private key (Apple generates it).

Everything else — code, configs, well-known files, listing copy, privacy nutrition declarations, gitignore, build gradle wiring — is in this repo as of this commit.

Realistic remaining time, executing this guide:

| Task | Hours |
|---|---|
| Apple: Sign in with Apple Service ID + Supabase config | 1 |
| Apple: Xcode entitlements wiring + icons + version bump | 0.5 |
| Apple: TestFlight build + on-device test | 1 |
| Apple: App Store listing (paste copy + nutrition labels + screenshots) | 2 |
| Android: keystore + keystore.properties + cert SHA-256 to Vercel | 0.5 |
| Android: Firebase project + google-services.json | 0.5 |
| Android: icons + version bump + AAB build | 0.5 |
| Android: Play listing (paste copy + Data Safety + screenshots) | 1.5 |
| Buffer for first-submission rejections | 1 |
| **Total** | **~8 hours** |

Plus 1–7 days of review wait time per store.
