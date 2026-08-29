// One-off: create the WAD demo manager account + grant James's own account
// console access to WAD, so the console can be demoed "as WAD" on the call.
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('/Users/jamesdrinkwater/Desktop/investigatorevents/.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const WAD_PAGE_ID = '4bdff2a2-f973-462d-8af1-270e8ae39d4d';
const JAMES_USER_ID = '9d8dbdd4-c695-41cb-ad91-45807b0e2e11';
const DEMO_EMAIL = 'wad-demo@investigatorevents.com';

// Readable but strong password for the demo account.
const password = `WadConsole-${randomBytes(4).toString('hex')}`;

// 1. Demo account (idempotent-ish: reuse if it exists).
let demoUserId = null;
const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email: DEMO_EMAIL,
  password,
  email_confirm: true,
  user_metadata: { full_name: 'WAD Events Team' },
});
if (createError) {
  if (/already/i.test(createError.message)) {
    for (let page = 1; page <= 5 && !demoUserId; page++) {
      const { data } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
      const match = data?.users?.find((u) => u.email === DEMO_EMAIL);
      if (match) demoUserId = match.id;
      if (!data?.users?.length || data.users.length < 200) break;
    }
    if (demoUserId) {
      await supabase.auth.admin.updateUserById(demoUserId, { password });
      console.log('existing demo user, password reset');
    }
  } else {
    throw createError;
  }
} else {
  demoUserId = created.user.id;
  console.log('demo user created');
}
if (!demoUserId) throw new Error('could not resolve demo user');

// Profile row so the account renders properly if anything touches it.
await supabase
  .from('profiles')
  .upsert({ id: demoUserId, full_name: 'WAD Events Team', username: 'wad-events-team' }, { onConflict: 'id' })
  .then(({ error }) => error && console.log('profile note:', error.message));

// 2. Manager grants (skip duplicates).
for (const userId of [demoUserId, JAMES_USER_ID]) {
  const { data: existing } = await supabase
    .from('association_admins')
    .select('id')
    .eq('user_id', userId)
    .eq('association_page_id', WAD_PAGE_ID)
    .maybeSingle();
  if (existing) {
    console.log(`already manager: ${userId}`);
    continue;
  }
  const { error } = await supabase
    .from('association_admins')
    .insert({ user_id: userId, association_page_id: WAD_PAGE_ID, role: 'manager' });
  console.log(error ? `grant failed for ${userId}: ${error.message}` : `granted: ${userId}`);
}

console.log('\nDEMO LOGIN');
console.log('  email:   ', DEMO_EMAIL);
console.log('  password:', password);
console.log('  console:  https://www.investigatorevents.com/associations/wad/manage');
