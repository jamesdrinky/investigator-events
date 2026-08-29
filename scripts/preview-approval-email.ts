/**
 * Preview: send James a copy of the exact "your video is approved" email a submitter
 * receives when an admin approves their video (see app/admin/videos/actions.ts).
 *
 * Run:  RESEND_API_KEY=... npx tsx scripts/preview-approval-email.ts
 */
import { Resend } from 'resend';

const TO = 'james@drinky.com';

// Sample submission (stand-ins for the real row values).
const video = {
  title: 'CII 2026 AGM — Prague',
  submitter_name: 'Gautam',
  event_slug: 'cii-agm-2026',
  association_slug: null as string | null,
};

function escapeHtml(v: string) {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// --- Verbatim from approveVideoAction in app/admin/videos/actions.ts ---
const link = video.event_slug
  ? `https://investigatorevents.com/events/${video.event_slug}`
  : video.association_slug
    ? `https://investigatorevents.com/associations/${video.association_slug}`
    : 'https://investigatorevents.com';
const where = video.event_slug ? 'event page' : 'association page';
const safeName = escapeHtml(video.submitter_name || 'there');
const safeTitle = escapeHtml(video.title ?? '');

const subject = `Your video is live — ${video.title}`;
const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
        <h2 style="margin:0 0 12px;font-size:20px">Your video is live 🎉</h2>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155">Hi ${safeName} — your video <strong>"${safeTitle}"</strong> has been approved and is now showing on the ${where}.</p>
        <a href="${link}" style="display:inline-block;padding:12px 28px;background:#0f172a;color:#fff;text-decoration:none;font-size:14px;font-weight:600;border-radius:99px">View it</a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">Investigator Events · The global PI conference calendar.</p>
      </div>`;

async function main() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: 'Investigator Events <info@investigatorevents.com>',
    to: TO,
    subject: `[Preview] ${subject}`,
    html,
  });
  if (error) { console.error('❌ send failed:', error.message); process.exit(1); }
  console.log(`✅ sent to ${TO} (${data?.id})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
