// Sends the six association-outreach templates to one reviewer, each preceded
// by a plain-English note explaining who it goes to and what it asks for.
//
//   npx tsx scripts/send-campaign-templates.ts                    # dry run
//   npx tsx scripts/send-campaign-templates.ts --send --to a@b.com
//
// Recipient must be given explicitly with --to for a live send. There is no
// default address and no query for recipients, so this cannot reach a list.
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { CAMPAIGN_TEMPLATES, buildAssociationCampaignEmail, fillTokens } from '../lib/email/association-campaign';
import { innerBody, shell } from '../lib/email/dev-annotate';

const LIVE = process.argv.includes('--send');
const toArg = process.argv.indexOf('--to');
const TO = toArg !== -1 ? process.argv[toArg + 1] : null;
const FROM = 'Investigator Events <info@investigatorevents.com>';

const NOTE_BG = '#0f172a';
const ACCENT = '#38bdf8';

function note(index: number, total: number, title: string, rows: Array<[string, string]>): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${NOTE_BG};">
    <tr><td align="center" style="padding:20px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:12px;">
          <span style="display:inline-block;background-color:${ACCENT};color:${NOTE_BG};font-size:11px;font-weight:800;padding:3px 8px;border-radius:4px;letter-spacing:0.06em;">TEMPLATE ${index} OF ${total}</span>
          <span style="font-size:16px;font-weight:700;color:#ffffff;padding-left:8px;">${title}</span>
        </td></tr>
        ${rows.map(([k, v]) => `<tr>
          <td style="padding:4px 14px 4px 0;font-size:11px;font-weight:700;color:${ACCENT};text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;vertical-align:top;">${k}</td>
        </tr><tr><td style="padding:0 0 8px;font-size:14px;color:#e2e8f0;line-height:1.6;">${v}</td></tr>`).join('')}
      </table>
    </td></tr>
  </table>`;
}

async function segments() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const [{ data: rel }, { data: events }] = await Promise.all([
    sb.from('association_relationships').select('*'),
    sb.from('events').select('association, start_date, title, approved'),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const withUpcoming = new Map<string, string>();
  for (const e of (events ?? []) as any[]) {
    if (!e.approved || !e.association || e.start_date < today) continue;
    const k = String(e.association).toUpperCase();
    if (!withUpcoming.has(k)) withUpcoming.set(k, e.title);
  }
  // Dedupe on code; prefer the row that carries an email.
  const byCode = new Map<string, any>();
  for (const r of (rel ?? []) as any[]) {
    const k = String(r.association_code).toUpperCase();
    const prev = byCode.get(k);
    if (!prev || (!prev.contact_email && r.contact_email)) byCode.set(k, r);
  }
  const counts: Record<string, { n: number; names: string[] }> = {};
  for (const r of byCode.values()) {
    const hasEmail = !!(r.contact_email && r.contact_email.trim());
    if (!hasEmail) continue;
    const ev = withUpcoming.get(String(r.association_code).toUpperCase())
      ?? withUpcoming.get(String(r.association_name).toUpperCase());
    const key = `${r.level}/${ev ? 'video' : 'events'}`;
    (counts[key] ??= { n: 0, names: [] }).n += 1;
    if (counts[key].names.length < 6) counts[key].names.push(r.association_code);
  }
  return counts;
}

const AUDIENCE: Record<string, string> = {
  close: 'Associations you know well — you would pick up the phone to them.',
  known: 'Associations you have dealt with, but not closely.',
  cold: 'Associations we have never spoken to.',
};

async function main() {
  const counts = await segments();

  const entries = CAMPAIGN_TEMPLATES.map((t, i) => {
    const key = `${t.closeness}/${t.ask}`;
    const seg = counts[key] ?? { n: 0, names: [] };
    const sample = t.ask === 'video'
      ? { association: 'NALI', conference: 'the NALI Annual Meeting' }
      : { association: 'TALI', conference: null };
    const html = buildAssociationCampaignEmail({ template: t, association: sample.association, conference: sample.conference });
    return {
      index: i + 1,
      title: `${t.closeness.toUpperCase()} — ${t.ask === 'video' ? 'invite a video' : 'ask for their events'}`,
      subject: fillTokens(t.subject, sample),
      seg,
      rows: ([
        ['Who gets this', AUDIENCE[t.closeness]],
        ['Their situation', t.ask === 'video'
          ? 'They already have events on the calendar, so there is something to promote.'
          : 'They have a page but no upcoming events, so there is nothing to promote yet — we ask for their dates first.'],
        ['What we are asking for', t.ask === 'video'
          ? 'A short video, up to 45 seconds, filmed on a phone.'
          : 'Their event dates for the year ahead.'],
        ['How many associations', seg.n === 0
          ? 'None currently — kept for when one lands in this group.'
          : `${seg.n}${seg.names.length ? ` — ${seg.names.join(', ')}${seg.n > seg.names.length ? '…' : ''}` : ''}`],
        ['Example shown', `Written as if to ${sample.association}. The association name and conference change per recipient.`],
      ] as Array<[string, string]>),
      html,
    };
  });

  console.log(`templates: ${entries.length}  |  to: ${TO ?? '(none — dry run)'}  |  mode: ${LIVE ? '🚨 SENDING' : 'DRY RUN'}`);
  for (const e of entries) console.log(`  ${e.index}. ${e.title}  → ${e.seg.n} associations`);

  if (!LIVE) { console.log('\nDRY RUN — pass --send --to <email> to deliver.'); return; }
  if (!TO) { console.error('\nRefusing to send: --send requires an explicit --to address.'); process.exit(1); }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  let sent = 0;
  for (const e of entries) {
    await resend.emails.send({
      from: FROM, to: TO,
      subject: `[${e.index}/${entries.length}] ${e.title} — "${e.subject}"`,
      html: shell(note(e.index, entries.length, e.title, e.rows) + innerBody(e.html)),
    });
    sent++;
    console.log(`  sent ${e.index}/${entries.length}`);
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log(JSON.stringify({ sent, to: TO }));
}

main().catch((e) => { console.error(e); process.exit(1); });
