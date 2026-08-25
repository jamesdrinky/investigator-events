/**
 * Dry run of /api/cron/weekly-newsletter — same data, same subject logic,
 * same builder args. Renders to a file. Sends nothing.
 */
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();

async function loadLocalEnv() {
  for (const envFile of ['.env.local', '.env']) {
    try {
      const contents = await readFile(path.join(ROOT, envFile), 'utf8');
      for (const rawLine of contents.split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const sep = line.indexOf('=');
        if (sep === -1) continue;
        const key = line.slice(0, sep).trim();
        let value = line.slice(sep + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {}
  }
}

/**
 * Freeze the clock so the dry run can be executed at any hour and still show
 * exactly what the 08:00 UTC Monday cron will produce. fetchCurrentEditorial
 * and getWeeklyCollections both read the wall clock internally, so the only
 * faithful way to test them is to move the clock rather than reimplement them.
 */
function freezeClock(iso: string) {
  const fixed = new Date(iso).getTime();
  const RealDate = Date;
  function FrozenDate(this: unknown, ...args: unknown[]) {
    return args.length === 0
      ? new RealDate(fixed)
      : new (RealDate as any)(...args);
  }
  FrozenDate.now = () => fixed;
  FrozenDate.parse = RealDate.parse;
  FrozenDate.UTC = RealDate.UTC;
  FrozenDate.prototype = RealDate.prototype;
  (globalThis as any).Date = FrozenDate;
  return () => { (globalThis as any).Date = RealDate; };
}

async function main() {
  await loadLocalEnv();

  const nowArg = process.argv.find((a) => a.startsWith('--now='))?.slice(6);
  if (nowArg) {
    freezeClock(nowArg);
    console.log(`⏰ clock frozen at ${nowArg} (simulating the Monday 08:00 UTC cron)\n`);
  }

  const { mapEventRowToItem } = await import('@/lib/data/events');
  const { getWeeklyCollections } = await import('@/lib/data/weekly');
  const { buildWeeklyNewsletterHtml } = await import('@/lib/email/weekly-newsletter');
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const { fetchCurrentEditorial } = await import('@/lib/email/weekly-editorial');
  const { buildRotatingWeeklySubject, getWeeklyNewsletterAppPush, getWeeklyNewsletterEdition, getWeeklyNewsletterSubject } = await import('@/lib/email/newsletter-editions');

  const supabase = createSupabaseAdminServerClient();

  const { data: rawRows, error: eventsErr } = await (supabase
    .from('events' as never).select('*').order('start_date', { ascending: true }) as any);
  if (eventsErr) throw eventsErr;
  const events = ((rawRows ?? []) as any[])
    .filter((row) => row.approved !== false)
    .map(mapEventRowToItem)
    .filter((e: any): e is NonNullable<typeof e> => e !== null) as any[];

  const { upcoming, newlyAdded, featured, recentlyPast, hasFreshActivity } = getWeeklyCollections(events);
  const heroEvent = featured[0] ?? upcoming[0];
  const countries = new Set([...upcoming, ...newlyAdded].map((e: any) => e.country)).size;

  console.log('=== GATES ===');
  console.log('hasFreshActivity:', hasFreshActivity, hasFreshActivity ? '' : '  <-- WOULD SKIP SEND');

  const { data: recentSend } = await (supabase
    .from('newsletter_sends' as never)
    .select('id, sent_at')
    .gte('sent_at', new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString())
    .order('sent_at', { ascending: false }).limit(1).maybeSingle() as any);
  console.log('recent send within 6d:', recentSend ? `${recentSend.sent_at}  <-- WOULD SKIP SEND` : 'none');

  const edition = getWeeklyNewsletterEdition(null);
  const editorial = await fetchCurrentEditorial(supabase as any);
  const heroDaysAway = heroEvent
    ? Math.ceil((new Date(`${heroEvent.date}T00:00:00Z`).getTime() - Date.now()) / 86400000)
    : undefined;
  const fallbackSubject = buildRotatingWeeklySubject({
    heroTitle: heroEvent?.title,
    heroDaysAway,
    otherCount: Math.max(0, upcoming.length + newlyAdded.length - 1),
    cities: [...new Set(upcoming.map((e: any) => e.city).filter(Boolean))] as string[],
    countries,
    upcomingCount: upcoming.length,
  }, editorial?.subjectOverride);
  const subject = getWeeklyNewsletterSubject(edition, fallbackSubject);
  const appPush = getWeeklyNewsletterAppPush(edition);

  const { data: flagRow } = await (supabase.from('feature_flags' as never)
    .select('*').eq('key', 'newsletter_referral').maybeSingle() as any);
  const referralBlock = flagRow?.enabled === true;

  const { data: subs } = await (supabase.from('newsletter_subscribers' as never)
    .select('email').eq('status', 'active') as any);

  console.log('\n=== CONTENT ===');
  console.log('edition:', edition, '| appPush:', JSON.stringify(appPush), '| referralBlock:', referralBlock);
  console.log('SUBJECT:', subject);
  console.log(`counts — upcoming ${upcoming.length}, newlyAdded ${newlyAdded.length}, featured ${featured.length}, recentlyPast ${recentlyPast.length}, countries ${countries}`);
  console.log('hero:', heroEvent ? `${heroEvent.title} (${heroEvent.date}, ${heroEvent.city}, ${heroDaysAway}d away)` : 'NONE');
  console.log('active subscribers:', subs?.length ?? 0);

  console.log('\n=== EDITORIAL ===');
  if (!editorial) console.log('NONE for this week -> falls back to fully generated layout');
  else console.log(JSON.stringify(editorial, null, 2));

  console.log('\n=== UPCOMING LIST ===');
  upcoming.forEach((e: any, i: number) => console.log(`${i + 1}. ${e.date}  ${e.title} — ${e.city}, ${e.country}${e.featured ? '  [featured]' : ''}`));
  console.log('\n=== NEWLY ADDED ===');
  newlyAdded.forEach((e: any, i: number) => console.log(`${i + 1}. ${e.date}  ${e.title} — ${e.city}, ${e.country}  (added ${e.createdAt})`));
  console.log('\n=== RECENTLY PAST (review prompts) ===');
  recentlyPast.forEach((e: any, i: number) => console.log(`${i + 1}. ${e.endDate ?? e.date}  ${e.title} — ${e.city}`));

  const { data: briefRows } = await (supabase.from('articles' as never)
    .select('slug, title, dek, category, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3) as any);
  const briefArticles = (briefRows ?? []) as any[];

  const html = buildWeeklyNewsletterHtml({
    upcoming, newlyAdded, featured, recentlyPast,
    unsubscribeToken: 'dry-run-token',
    articles: briefArticles,
    appPush, editorial, referralBlock,
  });
  const out = path.join(ROOT, 'newsletter-dryrun.html');
  await writeFile(out, html, 'utf8');
  console.log(`\n📄 Rendered ${html.length} bytes -> ${out}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
