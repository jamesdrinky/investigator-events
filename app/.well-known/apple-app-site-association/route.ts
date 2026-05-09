import { NextResponse } from 'next/server';

// Apple Universal Links manifest. Apple fetches this when the user installs
// the app and uses it to decide which https://investigatorevents.com URLs
// open natively in the app vs Safari.
//
// REPLACE <APPLE_TEAM_ID> with your 10-character Team ID from
// https://developer.apple.com/account → Membership → Team ID.
// Bundle ID is set in Xcode (PRODUCT_BUNDLE_IDENTIFIER) — we use
// com.investigatorevents.app per capacitor.config.ts.
//
// Apple requires this file be served at:
//   https://investigatorevents.com/.well-known/apple-app-site-association
// with Content-Type: application/json and no redirects.
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || 'REPLACE_WITH_TEAM_ID';
const BUNDLE_ID = 'com.investigatorevents.app';

export async function GET() {
  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: `${APPLE_TEAM_ID}.${BUNDLE_ID}`,
          paths: [
            '/events/*',
            '/profile/*',
            '/associations/*',
            '/people',
            '/calendar',
            '/messages*',
            '/reviews',
            '/forum*',
          ],
        },
      ],
    },
    webcredentials: {
      apps: [`${APPLE_TEAM_ID}.${BUNDLE_ID}`],
    },
  };

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
