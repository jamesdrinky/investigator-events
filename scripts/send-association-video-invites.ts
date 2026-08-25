/**
 * Video-invite outreach to associations with an upcoming event on the platform.
 *
 * Replaces the hardcoded four-recipient one-off (send-video-invites.ts) with a
 * list driven by real data, and — unlike that script — logs every send to
 * outreach_sends so the admin dashboard reflects who has actually been
 * contacted. The old script sent to CII/NCISS/TALI/SFPP without logging, which
 * is why the outreach history looks emptier than it is.
 *
 *   npx tsx scripts/send-association-video-invites.ts            # dry run + HTML previews
 *   npx tsx scripts/send-association-video-invites.ts --send     # actually deliver
 *   ... --only=NALI,ALDONYS                                      # restrict to some
 */
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const SENDER = 'mike';
const PREVIEW_DIR = 'outreach-previews';

/** Approved videos usable as the proof point. */
const VIDEOS = {
  tali: {
    id: 'e6fa8dcf-8e91-4040-ba25-14f81de73b2b',
    title: '2026 TALI Conference — San Antonio',
    watchUrl: 'https://investigatorevents.com/events/2026-tali-conference',
  },
  wad: {
    id: '924f1f3e-ab8d-4e63-b974-a79e6d002f93',
    title: 'WAD Conference 2026 — Cannes',
    watchUrl: 'https://investigatorevents.com/events/wad-conference-2026',
  },
} as const;

/**
 * TALI is the default proof point: approved 8 Aug, its conference is still
 * ahead (24–26 Sep), and most targets here are US associations. The WAD video
 * stops being a good example the moment Cannes finishes on 6 September.
 */
const DEFAULT_VIDEO = VIDEOS.tali;

type Target = {
  association: string;
  to: string;
  /** First name where we know a real person; null falls back to a neutral greeting. */
  recipientName: string | null;
  conference: string;
  region: string;
};

/**
 * Contacts come from association_pages.contact_email; names come from the
 * organiser on their own upcoming event, or from a senior role a member
 * claimed on the platform. Addressing a named person still helps on a shared
 * inbox — it tells whoever opens it who the mail is for.
 *
 * CII is deliberately absent: Gautam Kumar was sent a video invite in July.
 */
const TARGETS: Target[] = [
  { association: 'NALI',    to: 'info@nalionline.org',   recipientName: 'Val',     conference: 'the NALI Region II Conference in Detroit',              region: 'North America' },
  { association: 'ALDONYS', to: 'president@aldonys.org', recipientName: 'Matthew', conference: 'the ALDONYS 2026 Person of the Year Gala',             region: 'North America' },
  { association: 'WAPI',    to: 'generalsecretary@wapi.org', recipientName: 'Chris', conference: 'the WAPI Conference and Evening Banquet in London',  region: 'Europe' },
  { association: 'FALI',    to: 'admin@fali.org',        recipientName: 'Amy',     conference: 'the FALI Conference 2027 in Orlando',                  region: 'North America' },
  { association: 'NCAPI',   to: 'president@ncapi.com',   recipientName: 'Dionne',  conference: 'the NCAPI 2027 Annual Conference',                     region: 'North America' },
  { association: 'ANDR',    to: 'romania@i-k-d.com',     recipientName: 'Maria',   conference: 'the P.I. International Summer School in Bucharest',    region: 'Europe' },
  { association: 'ODV',     to: 'office@oedv.at',        recipientName: 'Andreas', conference: 'your general conference at Seehotel Rust',             region: 'Europe' },
  { association: 'SNARP',   to: 'france@i-k-d.com',      recipientName: null,      conference: 'the SNARP AGM in Cannes',                              region: 'Europe' },
  { association: 'ASIS',    to: 'asis@asisonline.org',   recipientName: null,      conference: 'Secure Horizons 2026 in Atlanta',                      region: 'North America' },
  { association: 'ACFE',    to: 'Events@ACFE.com',       recipientName: null,      conference: 'the ACFE Anti-Fraud Conference Africa 2026',           region: 'Africa' },
  { association: 'CODEGA',  to: 'info@codega.es',        recipientName: null,      conference: 'the II Congreso CODEGA in La Coruña',                  region: 'Europe' },
  { association: 'MAPI',    to: 'mapiboard@gmail.com',   recipientName: null,      conference: 'the MAPI Fall Conference 2026',                        region: 'North America' },
  { association: 'SCFIA',   to: 'dwilliams@dcwpi.com',   recipientName: null,      conference: 'the 48th SCFIA Annual Anti-Fraud Conference',          region: 'North America' },
  { association: 'PBSA',    to: 'info@thepbsa.org',      recipientName: null,      conference: 'the PBSA 2026 Canada Conference',                      region: 'North America' },
];

const BODY = `Dear {name},

I'm Mike LaCorte, founder of Investigator Events — the free global calendar for the investigations profession. {conference} is already listed with us, and I wanted to offer {association} something alongside it, at no cost.

We've started featuring short video invitations from associations on their event pages. The Texas Association of Licensed Investigators did one recently — their president and president-elect simply invited investigators to San Antonio, straight to camera.

{video}

We then share these across the platform, the Monday newsletter and LinkedIn, so the event reaches investigators who would otherwise never have heard about it.

We'd be glad to do exactly the same for {conference}. There's no cost and nothing to produce on your side beyond the video itself — a couple of minutes filmed on a phone is genuinely all it takes, and we handle everything after that.

If that's of interest, just reply and I'll send over the details.`;

const SUBJECT = 'A free video spot for {conference}';

async function loadEnv() {
  const c = await readFile(path.join(process.cwd(), '.env.local'), 'utf8');
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
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');

  const send = process.argv.includes('--send');
  const onlyArg = process.argv.find((a) => a.startsWith('--only='))?.slice(7);
  const only = onlyArg ? onlyArg.split(',').map((s) => s.trim().toUpperCase()) : null;

  const { buildVideoInviteEmail, renderSubject, senderFrom } = await import('@/lib/email/video-invite');
  const { createSupabaseAdminServerClient } = await import('@/lib/supabase/admin');
  const sb = createSupabaseAdminServerClient();

  // Never contact an association twice about a video.
  const { data: prior } = await (sb.from('outreach_sends' as never)
    .select('association, subject, sent_at') as any);
  const alreadyInvited = new Set(
    (prior ?? [])
      .filter((r: any) => /video|promotional spot|free video/i.test(r.subject ?? ''))
      .map((r: any) => String(r.association ?? '').toUpperCase())
  );
  // The July one-off never logged; hardcode what it covered so we don't repeat it.
  ['WAD', 'CII', 'NCISS', 'TALI', 'SFPP'].forEach((a) => alreadyInvited.add(a));

  const queue = TARGETS
    .filter((t) => !only || only.includes(t.association.toUpperCase()))
    .filter((t) => {
      if (alreadyInvited.has(t.association.toUpperCase())) {
        console.log(`  ↷ skipping ${t.association} — already had a video invite`);
        return false;
      }
      return true;
    });

  const prepared = queue.map((t) => {
    const merge = {
      recipientName: t.recipientName ?? 'Sir or Madam',
      association: t.association,
      conference: t.conference,
    };
    const html = buildVideoInviteEmail({ ...merge, bodyText: BODY, video: DEFAULT_VIDEO, sender: SENDER });
    const subject = renderSubject(SUBJECT, merge);

    const errors: string[] = [];
    for (const token of ['{name}', '{association}', '{conference}', '{video}']) {
      if (html.includes(token)) errors.push(`unresolved ${token} in body`);
      if (subject.includes(token)) errors.push(`unresolved ${token} in subject`);
    }
    if (!html.includes(DEFAULT_VIDEO.watchUrl)) errors.push('watch link missing');
    if (!html.includes(`/api/video/${DEFAULT_VIDEO.id}/poster`)) errors.push('poster image missing');
    if (!t.to.includes('@')) errors.push('invalid address');
    return { t, html, subject, errors };
  });

  console.log(`\nFrom: ${senderFrom(SENDER)}`);
  console.log(`Proof video: ${DEFAULT_VIDEO.title}\n`);
  for (const p of prepared) {
    const who = p.t.recipientName ? `Dear ${p.t.recipientName}` : 'Dear Sir or Madam ⚠';
    console.log(`${p.errors.length ? '❌' : '✅'} ${p.t.association.padEnd(8)} ${p.t.to.padEnd(30)} ${who}`);
    console.log(`     ${p.subject}`);
    if (p.errors.length) console.log(`     ${p.errors.join('; ')}`);
  }

  if (prepared.some((p) => p.errors.length)) {
    console.error('\nAborting — fix the errors above.\n');
    process.exit(1);
  }

  await mkdir(PREVIEW_DIR, { recursive: true });
  for (const p of prepared) {
    await writeFile(path.join(PREVIEW_DIR, `${p.t.association.toLowerCase()}.html`), p.html, 'utf8');
  }
  console.log(`\n📄 ${prepared.length} previews written to ${PREVIEW_DIR}/`);

  if (!send) {
    console.log('\nDRY RUN — nothing sent. Pass --send to deliver.\n');
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(key);
  console.log('\nSending…\n');
  for (const p of prepared) {
    const { data, error } = await resend.emails.send({
      from: senderFrom(SENDER),
      to: [p.t.to],
      subject: p.subject,
      html: p.html,
      tags: [{ name: 'type', value: 'video-invite' }, { name: 'association', value: p.t.association }],
    });
    if (error) {
      console.error(`  ❌ ${p.t.association}: ${error.message}`);
      continue;
    }
    console.log(`  ✅ ${p.t.association}: sent (${data?.id})`);

    const { error: logErr } = await (sb.from('outreach_sends' as never).insert({
      resend_id: data?.id ?? null,
      recipient_email: p.t.to,
      recipient_name: p.t.recipientName,
      association: p.t.association,
      region: p.t.region,
      sender: SENDER,
      subject: p.subject,
      sent_at: new Date().toISOString(),
      status: 'sent',
      event_name: p.t.conference,
      html: p.html,
    } as never) as any);
    if (logErr) console.error(`     ⚠ not logged to outreach_sends: ${logErr.message}`);
  }
  console.log('\nDone.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
