# Google Play — Data Safety form answers
Derived from /privacy. Keep this in sync with the live privacy policy.

## Overview answers
- **Does your app collect or share any of the required user data types?** → YES
- **Is all of the user data collected encrypted in transit?** → YES (HTTPS/TLS everywhere)
- **Do you provide a way for users to request that their data be deleted?** → YES
  (in-app: Profile → Edit → Delete Account; or email info@investigatorevents.com)

## Data types — what to tick as COLLECTED
For every item below: Collected = YES, Shared = NO (Supabase/email/auth are
processors under DPA, which Google does NOT count as "sharing"). Processed
ephemerally = NO. Purposes noted per item.

| Category | Data type | Collected | Required/Optional | Purposes |
|---|---|---|---|---|
| Personal info | Name | Yes | Required (account) | Account management, App functionality |
| Personal info | Email address | Yes | Required | Account management, App functionality |
| Personal info | User IDs | Yes | Required | Account management, App functionality |
| Personal info | Address / City (profile "location") | Yes | **Optional** | App functionality (public profile) |
| Personal info | Other info (firm, specialisation, bio) | Yes | Optional | App functionality (public profile) |
| Photos & videos | Photos | Yes | Optional | App functionality (avatar + message attachments) |
| Messages | Other in-app messages | Yes | Optional | App functionality (user-to-user messaging) |
| App activity | Other user-generated content (forum posts, comments, reports) | Yes | Optional | App functionality |

## Data types — explicitly NOT collected (leave unticked)
- Financial info / payment (app is free, no payments)
- Precise or approximate **device** location (you never read GPS — the profile
  "location" is free text the user types; declared above as Address, not Location)
- Phone number, Contacts, Calendar, Audio, Health, Browsing history
- Web/analytics cookies, advertising ID (privacy policy: no analytics/ad cookies)

## Edge call — push notification token (FCM)
If asked about "Device or other IDs": you store an FCM token to deliver
notifications. Declare under **Device or other IDs → Collected: Yes,
Shared: No, Purpose: App functionality**. Token is not used for tracking/ads.

## Sharing = NO across the board
You do not sell data and do not transfer it to third parties for their own use.
Anonymised aggregate stats to partner associations are not personal data.
