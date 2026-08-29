/**
 * One-off: send the video-invite outreach to CII / NCISS / TALI / D.A.CH,
 * as Mike, using the same email builder as the admin Video Invite tool.
 * Builds + validates all four BEFORE sending anything.
 *
 * Run:  RESEND_API_KEY=... npx tsx scripts/send-video-invites.ts
 */
import { Resend } from 'resend';
import {
  buildVideoInviteEmail,
  renderSubject,
  senderFrom,
  DEFAULT_VIDEO_INVITE_BODY,
  DEFAULT_VIDEO_INVITE_SUBJECT,
} from '../lib/email/video-invite';

const SENDER = 'mike';

// Approved WAD promo video → links through to its event page.
const VIDEO = {
  id: '924f1f3e-ab8d-4e63-b974-a79e6d002f93',
  title: 'WAD Conference 2026 — Cannes',
  watchUrl: 'https://investigatorevents.com/events/wad-conference-2026',
};

interface Job {
  to: string;
  recipientName: string;
  association: string;
  conference: string;
  subject: string;
  bodyText: string;
}

const PHILIP_BODY = `Dear {name},

Thank you again for the promotional video for WAD 2026 — it's live on the platform and has had a great response. We're now sharing it across the site, the weekly newsletter and LinkedIn to push it out to investigators worldwide.

{video}

Given how well it's working, we'd love to do the same for {conference} — a dedicated video on the platform, promoted across all our channels, at no cost. As president of SFPP you're the natural person to feature it.

We're also beginning to roll this out to a few other associations, with your WAD video as the flagship example of how it works — so if there's anyone in your network you think would benefit, a word from you would mean a lot.`;

const JOBS: Job[] = [
  // Template pitch — Philip's WAD video used as the proof.
  { to: 'gautamkumar@globedetective.com', recipientName: 'Gautam', association: 'CII', conference: 'the CII 2026 AGM in Prague', subject: DEFAULT_VIDEO_INVITE_SUBJECT, bodyText: DEFAULT_VIDEO_INVITE_BODY },
  { to: 'aconroy@conroyassociates.com', recipientName: 'Adina', association: 'NCISS', conference: 'the NCISS 50th Anniversary Conference', subject: DEFAULT_VIDEO_INVITE_SUBJECT, bodyText: DEFAULT_VIDEO_INVITE_BODY },
  { to: 'washington@noteboom.com', recipientName: 'Bob', association: 'TALI', conference: 'the 2026 TALI Conference', subject: DEFAULT_VIDEO_INVITE_SUBJECT, bodyText: DEFAULT_VIDEO_INVITE_BODY },
  // Philip — warm, bespoke, his own video shown.
  { to: 'swissp@me.com', recipientName: 'Philip', association: 'SFPP', conference: 'the D.A.CH Forum', subject: "Your WAD video's doing well — one for the D.A.CH Forum?", bodyText: PHILIP_BODY },
];

const POSTER_URL = `https://investigatorevents.com/api/video/${VIDEO.id}/poster`;

function build(job: Job) {
  const merge = { recipientName: job.recipientName, association: job.association, conference: job.conference };
  const html = buildVideoInviteEmail({ ...merge, bodyText: job.bodyText, video: VIDEO, sender: SENDER });
  const subject = renderSubject(job.subject, merge);
  return { html, subject };
}

function validate(job: Job, html: string, subject: string): string[] {
  const errors: string[] = [];
  for (const token of ['{name}', '{association}', '{conference}', '{video}']) {
    if (html.includes(token)) errors.push(`unresolved ${token} in body`);
    if (subject.includes(token)) errors.push(`unresolved ${token} in subject`);
  }
  if (!html.includes(POSTER_URL)) errors.push('poster image missing');
  if (!html.includes(VIDEO.watchUrl)) errors.push('watch link missing');
  if (/Phillip/.test(html) || /Ryfell/.test(html)) errors.push('name misspelled (should be "Philip Ryffel")');
  return errors;
}

async function main() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  const send = process.argv.includes('--send');

  // Phase 1: build + validate ALL before sending ANY.
  const prepared = JOBS.map((job) => {
    const { html, subject } = build(job);
    const errors = validate(job, html, subject);
    return { job, html, subject, errors };
  });

  console.log(`\nPrepared ${prepared.length} emails (from: ${senderFrom(SENDER)})\n`);
  for (const p of prepared) {
    const status = p.errors.length ? `❌ ${p.errors.join('; ')}` : '✅ valid';
    console.log(`- ${p.job.to}  |  ${status}\n    subject: ${p.subject}`);
  }

  const anyErrors = prepared.some((p) => p.errors.length > 0);
  if (anyErrors) {
    console.error('\nAborting — fix the errors above before sending.\n');
    process.exit(1);
  }

  if (!send) {
    console.log('\nDRY RUN — pass --send to actually deliver.\n');
    return;
  }

  // Phase 2: send.
  const resend = new Resend(key);
  console.log('\nSending…\n');
  for (const p of prepared) {
    const { data, error } = await resend.emails.send({
      from: senderFrom(SENDER),
      to: [p.job.to],
      subject: p.subject,
      html: p.html,
      tags: [{ name: 'type', value: 'video-invite' }, { name: 'association', value: p.job.association }],
    });
    if (error) console.error(`  ❌ ${p.job.to}: ${error.message}`);
    else console.log(`  ✅ ${p.job.to}: sent (${data?.id})`);
  }
  console.log('\nDone.\n');
}

main().catch((e) => { console.error(e); process.exit(1); });
