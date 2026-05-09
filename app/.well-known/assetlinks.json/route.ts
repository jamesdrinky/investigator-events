import { NextResponse } from 'next/server';

// Android App Links / Digital Asset Links manifest. Google verifies this
// when the app is installed and uses it to map https://investigatorevents.com
// URLs to the native app instead of opening the browser.
//
// REPLACE <SHA256_FINGERPRINT> with the SHA-256 of your Android signing
// certificate. Get it with:
//   keytool -list -v -keystore <path-to-keystore> -alias <alias>
// Or, if you use Play App Signing (recommended), copy the SHA-256 from
// Play Console → App integrity → App signing key certificate.
// Format: 14:6D:E9:...:0A (colon-separated, 32 pairs of hex digits).
//
// Multiple fingerprints are allowed (e.g. one for upload key, one for
// Play App Signing key) — add them to the sha256_cert_fingerprints array.
const PACKAGE_NAME = 'com.investigatorevents.app';
const FINGERPRINTS = (process.env.ANDROID_CERT_SHA256 || 'REPLACE_WITH_SHA256_FINGERPRINT')
  .split(',')
  .map((f) => f.trim())
  .filter(Boolean);

export async function GET() {
  const body = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: PACKAGE_NAME,
        sha256_cert_fingerprints: FINGERPRINTS,
      },
    },
  ];

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
