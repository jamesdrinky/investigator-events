/**
 * In-app notification inviting account holders who are not on the newsletter.
 *
 * In-app rather than email on purpose: creating an account is not consent to
 * marketing email, so these 91 people cannot legally be added to the list or
 * mailed about it. A notification in their own bell is the consent-clean way
 * to ask, and it waits there until they next visit.
 *
 *   npx tsx scripts/send-newsletter-invite-notification.ts --dry
 *   npx tsx scripts/send-newsletter-invite-notification.ts --user james-drinkwater
 *   npx tsx scripts/send-newsletter-invite-notification.ts --all
 */
import { readFile } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const TYPE = 'newsletter_invite';
const TITLE = 'The Monday briefing';
// Rendered after the sender name: "Investigator Events <body>".
const BODY = '— TALI, NALI Detroit and PBSA all open this week. Get the Monday briefing.';
const LINK = '/weekly';

async function loadEnv() {
  const c = await readFile(path.join(ROOT, '.env.local'), 'utf8');
  for (const l of c.split('\n')) {
    const t = l.trim(); if (!t || t.startsWith('#')) continue;
    const s = t.indexOf('='); if (s < 0) continue;
    const k = t.slice(0, s).trim(); let v = t.slice(s + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

async function main() {
  await loadEnv();
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const supabase = createSupabaseAdminServerClient();

  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const all = args.includes('--all');
  const oneUser = args.find((a) => a.startsWith('--user'))
    ? args[args.indexOf(args.find((a) => a.startsWith('--user'))!) + 1]
    : null;

  if (!dry && !all && !oneUser) {
    throw new Error('Pass --dry, --user <username>, or --all');
  }

  // Active subscribers, to exclude.
  const { data: subs } = await (supabase
    .from('newsletter_subscribers' as never)
    .select('email, status') as never) as any;
  const onList = new Set(
    (subs ?? [])
      .filter((r: any) => r.status === 'active' || r.status === 'pending')
      .map((r: any) => String(r.email).toLowerCase())
  );

  const { data: userList } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  let targets = userList.users
    .filter((u) => u.email && !onList.has(u.email.toLowerCase()))
    .map((u) => ({ id: u.id, email: u.email! }));

  if (oneUser) {
    const { data: p } = await (supabase
      .from('profiles' as never).select('id').eq('username', oneUser).maybeSingle() as any);
    if (!p) throw new Error(`No profile with username ${oneUser}`);
    // A test send ignores the subscribed filter — the point is to see it render.
    targets = [{ id: p.id, email: '(test)' }];
  }

  // Never notify the same person twice.
  const { data: already } = await (supabase
    .from('notifications' as never)
    .select('user_id')
    .eq('type', TYPE) as any);
  const seen = new Set((already ?? []).map((r: any) => r.user_id));
  const fresh = targets.filter((t) => !seen.has(t.id));

  console.log(`eligible: ${targets.length}   already notified: ${targets.length - fresh.length}   to send: ${fresh.length}`);
  console.log(`text: "Investigator Events ${BODY}"  ->  ${LINK}`);

  if (dry) { console.log('\n--dry, nothing written'); return; }

  const rows = fresh.map((t) => ({
    user_id: t.id, type: TYPE, title: TITLE, body: BODY, link: LINK, is_read: false,
  }));
  if (rows.length === 0) { console.log('nothing to do'); return; }

  const { error } = await ((supabase.from('notifications') as any).insert(rows) as any);
  if (error) throw error;
  console.log(`✅ wrote ${rows.length} notification(s)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
