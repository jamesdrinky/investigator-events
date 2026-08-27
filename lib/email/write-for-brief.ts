/**
 * The "write for The Brief" invitation — Mike's ask from the 25 Aug call.
 *
 * Audience: everyone. Members, association contacts, organisers.
 *
 * The persuasion here is deliberately about *them*, not about us: people write
 * when the writing is visibly theirs, so the email leads with the byline, the
 * profile credit, and the association page — not with our need for content.
 * Every claim it makes is one the site actually delivers on: submissions get a
 * byline, land on the author's profile, and appear on their association's page.
 */
import { escapeHtml } from '@/lib/security/server';

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;

const C = {
  blue: '#2563eb',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
  tint: '#f8fafc',
};

/** Prompts, because "write us an article" gets nothing and "what changed in
 *  your region this year" gets a reply. */
const PROMPTS = [
  'What changed in your association this year — new leadership, new standards, a milestone',
  'A conference write-up: who came, what was actually said, what you took away',
  'A regulatory or licensing change other investigators in your country should know about',
  'How you handled a difficult case — anonymised, with the method rather than the client',
  'An opinion piece on where the profession is heading, and what it is getting wrong',
];

export interface WriteForBriefOptions {
  recipientName?: string | null;
  /** Deep-links the form to their association when we know it. */
  associationSlug?: string | null;
  /** Per-recipient unsubscribe, required on a bulk send. */
  unsubscribeUrl?: string | null;
}

export function buildWriteForBriefEmail(opts: WriteForBriefOptions = {}): string {
  const greeting = opts.recipientName ? `Hi ${escapeHtml(opts.recipientName)},` : 'Hi,';
  const submitUrl = opts.associationSlug
    ? `${SITE}/news/submit?association=${encodeURIComponent(opts.associationSlug)}`
    : `${SITE}/news/submit`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f4f8;padding:24px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

        <tr><td>
          <img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;" />
        </td></tr>

        <tr><td style="background-color:${C.white};padding:20px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>

        <!-- Lead -->
        <tr><td style="background-color:${C.white};padding:24px 32px 0;">
          <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;text-align:center;">
            Tell the industry what you know
          </p>
          <p style="margin:18px 0 0;font-size:15px;color:${C.body};line-height:1.7;">${greeting}</p>
          <p style="margin:14px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            The Brief is the news section on Investigator Events — the one place the whole profession looks for what is happening across the associations, not just their own. It is written by the people in it, and we would like you to be one of them.
          </p>
          <p style="margin:14px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            You do not need to be a writer. You need to know something the rest of the industry does not.
          </p>
        </td></tr>

        <!-- Prompts -->
        <tr><td style="background-color:${C.white};padding:22px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${C.tint};border:1px solid ${C.border};border-radius:12px;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${C.muted};">
                Things worth writing about
              </p>
              ${PROMPTS.map(
                (p) => `<p style="margin:12px 0 0;font-size:14px;color:${C.body};line-height:1.6;">&bull;&nbsp; ${escapeHtml(p)}</p>`
              ).join('')}
            </td></tr>
          </table>
        </td></tr>

        <!-- What you get -->
        <tr><td style="background-color:${C.white};padding:22px 32px 0;">
          <p style="margin:0;font-size:15px;font-weight:700;color:${C.dark};">What happens when you publish</p>
          <p style="margin:10px 0 0;font-size:14px;color:${C.body};line-height:1.7;">
            <strong>Your byline</strong> — published under your name and title, with a link you can share.<br />
            <strong>On your profile</strong> — every piece you write appears on your Investigator Events profile.<br />
            <strong>On your association's page</strong> — attribute it and it is listed there too, alongside their events.<br />
            <strong>In the weekly newsletter</strong> — The Brief feeds the newsletter that goes out every Monday.
          </p>
        </td></tr>

        <!-- CTA -->
        <tr><td style="background-color:${C.white};padding:26px 32px 0;text-align:center;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${submitUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:600;">Write something</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-- -->
          <a href="${submitUrl}" style="display:inline-block;padding:15px 40px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:15px;font-weight:600;border-radius:99px;">
            Write something
          </a>
          <!--<![endif]-->
          <p style="margin:14px 0 0;font-size:13px;color:${C.muted};line-height:1.6;">
            A few hundred words is plenty. We edit lightly and publish within 48 hours.<br />
            Rather talk it through first? Just reply to this email.
          </p>
        </td></tr>

        <tr><td style="background-color:${C.white};padding:22px 32px 32px;text-align:center;">
          <a href="${SITE}/news" style="font-size:13px;color:${C.blue};text-decoration:none;font-weight:600;">
            Read what is already in The Brief &rarr;
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px 0;text-align:center;">
          ${
            opts.unsubscribeUrl
              ? `<p style="margin:0;font-size:12px;color:${C.faint};line-height:1.6;">
                   <a href="${opts.unsubscribeUrl}" style="color:${C.faint};text-decoration:underline;">Unsubscribe</a>
                 </p>`
              : ''
          }
          <p style="margin:8px 0 0;font-size:12px;color:${C.faint};">
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
