import { readFile } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

// One-off seed script: creates the demo account App Store reviewers
// will use to test the app. Run once with:
//   npx tsx scripts/create-apple-demo-account.ts
//
// Idempotent — if the user already exists, it just updates the profile.

const ROOT = process.cwd();
const ENV_FILES = ['.env.local', '.env'];

const DEMO_EMAIL = 'apple-reviewer@investigatorevents.com';
const DEMO_FULL_NAME = 'Apple Reviewer';
const DEMO_USERNAME = 'apple-reviewer';
const DEMO_HEADLINE = 'Reviewer account for Investigator Events App Store submission';
const DEMO_COUNTRY = 'United States';
const DEMO_SPECIALISATION = 'Private Investigation';

function parseEnvFile(contents: string) {
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sep = line.indexOf('=');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function loadLocalEnv() {
  for (const envFile of ENV_FILES) {
    try {
      const contents = await readFile(path.join(ROOT, envFile), 'utf8');
      parseEnvFile(contents);
    } catch {}
  }
}

async function main() {
  await loadLocalEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const demoPassword = process.env.APPLE_REVIEW_DEMO_PASSWORD;
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
    process.exit(1);
  }
  if (!demoPassword) {
    console.error('Missing APPLE_REVIEW_DEMO_PASSWORD env var');
    process.exit(1);
  }
  const admin = createClient<Database>(url, key);

  // Look up existing
  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existingUser = existing?.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL.toLowerCase());

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`Demo user already exists: ${userId}`);
    // Make sure the password matches the private App Store Connect value.
    await admin.auth.admin.updateUserById(userId, {
      password: demoPassword,
      email_confirm: true,
    });
    console.log('Password reset to APPLE_REVIEW_DEMO_PASSWORD.');
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: demoPassword,
      email_confirm: true,
      user_metadata: { full_name: DEMO_FULL_NAME },
    });
    if (error || !data.user) {
      console.error('Failed to create demo user:', error?.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`Created demo user: ${userId}`);
  }

  // Upsert the profile so the demo account isn't blank when reviewers log in
  const { error: profileErr } = await admin.from('profiles').upsert({
    id: userId,
    full_name: DEMO_FULL_NAME,
    username: DEMO_USERNAME,
    headline: DEMO_HEADLINE,
    country: DEMO_COUNTRY,
    specialisation: DEMO_SPECIALISATION,
    bio: 'This account is provided to the Apple App Review team to evaluate Investigator Events. It is not a real investigator profile.',
    is_public: true,
    is_verified: false,
    auth_provider: 'email',
    tos_accepted_at: new Date().toISOString(),
  } as any, { onConflict: 'id' });

  if (profileErr) {
    console.error('Profile upsert failed:', profileErr.message);
    process.exit(1);
  }

  console.log('\n✓ Demo account ready');
  console.log('--------------------------------------');
  console.log(`Email:    ${DEMO_EMAIL}`);
  console.log('Password: APPLE_REVIEW_DEMO_PASSWORD from .env.local');
  console.log('--------------------------------------');
  console.log('Paste the private .env.local value into App Store Connect → App Review Information.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
