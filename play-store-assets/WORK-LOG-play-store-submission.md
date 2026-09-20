# Investigator Events — Google Play Store Submission
## Statement of work / work log

**Project:** Investigator Events (Android)
**Platform:** Google Play Store
**Package:** com.investigatorevents.app
**Outcome:** App accepted and published to Google Play (production, worldwide — 176 countries + rest of world)
**Period:** 27 Jun 2026 – 2 Jul 2026

---

### 1. Release readiness assessment & verification
- Audited the existing Android build state: confirmed signed release bundle (AAB), signing keystore, version code/name, and Capacitor configuration.
- Verified the app architecture (Capacitor wrapper serving the live web app) and confirmed the existing signed AAB was current and did not require a rebuild.
- Confirmed upload key/keystore integrity and Play App Signing approach.

### 2. App creation in Google Play Console
- Created the app record: name, package name, default language, app/game type, and free/paid designation.
- Completed required legal declarations: Developer Program Policies, Play App Signing Terms of Service, and US export law compliance.

### 3. Store listing assets — produced from scratch
- **Feature graphic (1024×500):** designed and rendered a branded promotional banner (brand navy gradient, app logo, product name, tagline) — an asset with no App Store equivalent, produced specifically for Google Play. Composed to Google's edge-crop and content-policy rules.
- **Store copy:** wrote the short description (80-char) and full description (4000-char), optimised for App Store Optimisation (ASO) and screened against Google's metadata policy (no prohibited claims/testimonials/pricing).
- **Screenshots:** diagnosed an aspect-ratio compliance failure in the source device screenshots (2.03:1, exceeding Google's 2:1 maximum) and reprocessed all 5 to a compliant 1350×2688 canvas, preserving full content and meeting promotion-eligibility minimums.
- **App icon:** validated and supplied the 512×512 store icon.

### 4. Content rating (IARC) questionnaire
- Completed the IARC content-rating questionnaire (Social category), answering all content, interaction, moderation, and commerce questions accurately against the app's real feature set.
- Verified answers against the codebase (report vs. block functionality, moderation, messaging model) to ensure accurate declarations.
- Generated territory ratings (ESRB Teen / PEGI / USK 12+ etc.).

### 5. Data Safety declaration
- Completed Google's full Data Safety questionnaire — the most involved compliance form — mapped directly from the app's live privacy policy to guarantee consistency (a common rejection cause).
- Declared: encryption in transit, account-creation methods (email/password + OAuth), and the exact set of collected data types (name, email, user IDs, profile info, in-app messages, photos, videos, user-generated content, device/FCM identifiers) with per-item usage, purpose, sharing, and required/optional handling.
- Verified data-collection claims against the codebase, including confirming the user video-submission feature and correcting over-declared items (removed device location and postal address, which the app does not collect).
- Configured the account/data deletion request URL.

### 6. App content declarations
- Completed all remaining policy declarations: App access / sign-in instructions (reviewer test credentials), Ads, Target audience & content (18+), Government apps, Financial features, Health, and Advertising ID.
- **Photo & video permissions policy declaration:** completed the READ_MEDIA_IMAGES justification required for apps requesting broad media access, substantiated by the app's photo-attachment and video-submission features.

### 7. Store settings & distribution
- Set the app category (Events — selected for accuracy and discoverability), store tags, and public contact details.
- Configured country/region distribution (worldwide) and external marketing.

### 8. Production release & submission
- Created the production release, uploaded the signed AAB, and authored release notes.
- Troubleshot and resolved submission-blocking errors, including a duplicate-release version-code conflict and outstanding declaration/country requirements.
- Submitted the complete release (13 bundled changes) for Google review.

### 9. Outcome
- App passed Google review and is **published live on the Google Play Store**.
- Investigator Events is now live across all three surfaces: iOS App Store, Google Play Store, and web.

---

### Deliverables produced
- `feature-graphic.png` (1024×500 promotional banner)
- `screenshots/` (5 compliance-corrected store screenshots)
- `store-listing.md` (short + full store copy)
- `data-safety-form.md` (Data Safety mapping reference)
- Fully configured and submitted Google Play Console listing → **accepted & published**
