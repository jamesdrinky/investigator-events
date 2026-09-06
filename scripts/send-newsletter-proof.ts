/**
 * Sends the exact email the Monday cron will send, to one address, for
 * approval. Renders through the cron's own code path with the clock frozen at
 * the send moment — nothing here reimplements the builder, so what lands in
 * the inbox is what 207 subscribers get.
 *
 *   npx tsx scripts/send-newsletter-proof.ts you@example.com [--now=<iso>]
 */
import { readFile } from 'fs/promises';
import path from 'path';
import { Resend } from 'resend';

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
    } catch { /* optional */ }
  }
}

function freezeClock(iso: string) {
  const fixed = new Date(iso).getTime();
  const RealDate = Date;
  function FrozenDate(this: unknown, ...args: unknown[]) {
    return args.length === 0 ? new RealDate(fixed) : new (RealDate as any)(...args);
  }
  FrozenDate.now = () => fixed;
  FrozenDate.parse = RealDate.parse;
  FrozenDate.UTC = RealDate.UTC;
  FrozenDate.prototype = RealDate.prototype;
  (globalThis as any).Date = FrozenDate;
}

async function main() {
  await loadLocalEnv();

  const to = process.argv.slice(2).find((a) => !a.startsWith('--'))?.trim().toLowerCase();
  if (!to) throw new Error('usage: send-newsletter-proof.ts <email> [--now=<iso>]');

  const nowArg = process.argv.find((a) => a.startsWith('--now='))?.slice('--now='.length);
  if (nowArg) freezeClock(nowArg);

  const { mapEventRowToItem } = await import('@/lib/data/events');
  const { getWeeklyCollections } = await import('@/lib/data/weekly');
  const { buildWeeklyNewsletterHtml } = await import('@/lib/email/weekly-newsletter');
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const { fetchCurrentEditorial } = await import('@/lib/email/weekly-editorial');
  const { buildRotatingWeeklySubject, getWeeklyNewsletterAppPush, getWeeklyNewsletterEdition, getWeeklyNewsletterSubject } =
    await import('@/lib/email/newsletter-editions');

  const supabase = createSupabaseAdminServerClient();
  const { data: rawRows } = await (supabase.from('events' as never).select('*').order('start_date', { ascending: true }) as any);
  const events = ((rawRows ?? []) as any[])
    .filter((row) => row.approved !== false)
    .map(mapEventRowToItem)
    .filter((e: any) => e !== null) as any[];

  const { upcoming, newlyAdded, featured, recentlyPast } = getWeeklyCollections(events);
  const heroEvent = featured[0] ?? upcoming[0];
  const countries = new Set([...upcoming, ...newlyAdded].map((e: any) => e.country)).size;

  const edition = getWeeklyNewsletterEdition(null);
  const editorial = await fetchCurrentEditorial(supabase as any);
  const heroDaysAway = heroEvent
    ? Math.ceil((new Date(`${heroEvent.date}T00:00:00Z`).getTime() - Date.now()) / 86400000)
    : undefined;
  const subject = getWeeklyNewsletterSubject(edition, buildRotatingWeeklySubject({
    heroTitle: heroEvent?.title,
    heroDaysAway,
    otherCount: Math.max(0, upcoming.length + newlyAdded.length - 1),
    cities: [...new Set(upcoming.map((e: any) => e.city).filter(Boolean))] as string[],
    countries,
    upcomingCount: upcoming.length,
  }, editorial?.subjectOverride));

  const { data: briefRows } = await (supabase.from('articles' as never)
    .select('slug, title, dek, category, published_at')
    .eq('status', 'published').order('published_at', { ascending: false }).limit(3) as any);

  const html = buildWeeklyNewsletterHtml({
    upcoming, newlyAdded, featured, recentlyPast,
    unsubscribeToken: 'proof-copy-not-a-real-token',
    articles: (briefRows ?? []) as any[],
    appPush: getWeeklyNewsletterAppPush(edition),
    editorial: editorial as any,
    referralBlock: false,
  });

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { data, error } = await resend.emails.send({
    from: 'Investigator Events <weekly@investigatorevents.com>',
    to,
    subject: `[PROOF] ${subject}`,
    html,
  });
  if (error) throw error;
  console.log(`✅ sent to ${to}  id=${data?.id}`);
  console.log(`   edition: ${edition}  subject: ${subject}`);
  console.log(`   ${html.length} bytes · upcoming ${upcoming.length} · review prompts ${recentlyPast.length}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
