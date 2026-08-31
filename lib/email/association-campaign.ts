/**
 * The association outreach matrix.
 *
 * Two things decide what we write to an association, and they are independent:
 *
 *   1. How well Mike knows them — close, known, or cold. This sets the tone
 *      and how much we have to explain about who we are.
 *   2. Whether they have already listed events with us. This sets the ASK.
 *      Inviting a promotional video from an association with nothing on the
 *      calendar is asking them to promote a page that does not exist; those
 *      associations need to send us their dates first.
 *
 * Three levels times two asks gives the six templates here. Merge tokens
 * {association} and {conference} are filled per recipient.
 */
import { escapeHtml } from '@/lib/security/server';

const SITE = 'https://www.investigatorevents.com';
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

export type Closeness = 'close' | 'known' | 'cold';
/** 'video' = they have events listed. 'events' = they do not. */
export type Ask = 'video' | 'events';

export interface CampaignTemplate {
  closeness: Closeness;
  ask: Ask;
  subject: string;
  /** Paragraphs. {association} and {conference} are substituted. */
  paragraphs: string[];
  ctaLabel: string;
  ctaPath: string;
  /** One line under the button. */
  ctaNote: string;
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  // ── They have events listed: invite a video ──────────────────────────────
  {
    closeness: 'close',
    ask: 'video',
    subject: 'A video for {conference}?',
    paragraphs: [
      'We are putting short videos on the event pages that get the most attention, and {conference} is one of them.',
      'It is nothing elaborate — up to 45 seconds, filmed on a phone, someone from {association} saying who the event is for and why people should come. We handle the rest, and there is no cost.',
      'If it is easier, send us what you already have and we will cut it down.',
    ],
    ctaLabel: 'Send us a video',
    ctaPath: '/list-your-event',
    ctaNote: 'Free while we build the library.',
  },
  {
    closeness: 'known',
    ask: 'video',
    subject: 'A free video spot for {conference}',
    paragraphs: [
      '{association}’s events are on Investigator Events, and {conference} is coming up. We would like to put a short video from you on its page, free of charge.',
      'Up to 45 seconds, filmed on a phone is fine — who the event is for, what people will get from it, and when it is. Listings with a video hold attention several times longer than text alone.',
      'We do the editing. You send the clip.',
    ],
    ctaLabel: 'Send us a video',
    ctaPath: '/list-your-event',
    ctaNote: 'Free while we build the library.',
  },
  {
    closeness: 'cold',
    ask: 'video',
    subject: 'A free promotional spot for {conference}',
    paragraphs: [
      'Investigator Events is a free global calendar for the investigations profession — every conference, training day and association meeting we can find, in one place. {conference} is already listed.',
      'We are offering associations a short promotional video on their event page, at no cost. Up to 45 seconds, filmed on a phone: who it is for, why they should come, when it is.',
      'No catch, and nothing to sign. We built the calendar because the profession did not have one, and events with a face attached fill rooms better than a line of text.',
    ],
    ctaLabel: 'See the event page',
    ctaPath: '/list-your-event',
    ctaNote: 'Free, and you can withdraw it at any time.',
  },

  // ── No events listed: ask for their calendar first ───────────────────────
  {
    closeness: 'close',
    ask: 'events',
    subject: 'Your {association} dates for the calendar',
    paragraphs: [
      '{association} has a page on Investigator Events, but no upcoming events on it — so anyone who lands there sees the association and nothing to attend.',
      'If you send over your dates for the next year, we will put them up. Titles, dates and cities are enough; we can fill in the rest.',
      'Once they are listed we can also put a short video on the pages, free, which is where we are seeing the most engagement.',
    ],
    ctaLabel: 'Send us your dates',
    ctaPath: '/list-your-event',
    ctaNote: 'Takes a couple of minutes, and it is free.',
  },
  {
    closeness: 'known',
    ask: 'events',
    subject: 'Add {association}’s events to the calendar',
    paragraphs: [
      '{association} is on Investigator Events, but there are no upcoming events on the page yet. Investigators searching for what is on in your region will not find you.',
      'Send us your dates and we will list them — free, and they will appear in the weekly newsletter that goes out across the profession.',
      'Titles, dates and cities are plenty to start with.',
    ],
    ctaLabel: 'List your events',
    ctaPath: '/list-your-event',
    ctaNote: 'Free, and always will be.',
  },
  {
    closeness: 'cold',
    ask: 'events',
    subject: 'Listing {association}’s events, free',
    paragraphs: [
      'Investigator Events is a free global calendar for the investigations profession. Every conference, training day and association meeting we can find, in one place — because until now nobody could see the full picture, and dates clashed without anyone realising.',
      'We have set up a page for {association} already. What it does not have is your events.',
      'If you send us your dates we will list them at no cost, and they will reach the profession through the page and the weekly newsletter. We are not selling anything — the more associations that list with us, the more useful the calendar becomes for everyone.',
    ],
    ctaLabel: 'List your events',
    ctaPath: '/list-your-event',
    ctaNote: 'Free, and always will be.',
  },
];

export function findTemplate(closeness: Closeness, ask: Ask): CampaignTemplate {
  const found = CAMPAIGN_TEMPLATES.find((t) => t.closeness === closeness && t.ask === ask);
  if (!found) throw new Error(`No template for ${closeness}/${ask}`);
  return found;
}

export function fillTokens(text: string, vars: { association: string; conference?: string | null }): string {
  return text
    .replace(/\{association\}/g, vars.association)
    .replace(/\{conference\}/g, vars.conference ?? 'your conference');
}

export interface RenderInput {
  template: CampaignTemplate;
  association: string;
  conference?: string | null;
  /** Omitted deliberately when we have no name — see the greeting note below. */
  recipientName?: string | null;
  ctaUrl?: string;
}

export function buildAssociationCampaignEmail(input: RenderInput): string {
  const vars = { association: input.association, conference: input.conference };
  // No invented names. "Dear Sir/Madam" reads worse than a plain hello, and a
  // wrong name is worse than both.
  const greeting = input.recipientName
    ? `Dear ${escapeHtml(input.recipientName)},`
    : 'Hello,';
  const ctaUrl = input.ctaUrl ?? `${SITE}${input.template.ctaPath}`;

  const paragraphs = input.template.paragraphs
    .map((p) => `<p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">${escapeHtml(fillTokens(p, vars))}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f4f8;padding:24px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
        <tr><td><img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;" /></td></tr>
        <tr><td style="background-color:${C.white};padding:20px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>

        <tr><td style="background-color:${C.white};padding:22px 32px 0;">
          <p style="margin:0;font-size:15px;color:${C.body};line-height:1.7;">${greeting}</p>
          ${paragraphs}
        </td></tr>

        <tr><td style="background-color:${C.white};padding:26px 32px 0;text-align:center;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${ctaUrl}" style="height:46px;v-text-anchor:middle;width:230px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
            <w:anchorlock/><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">${escapeHtml(input.template.ctaLabel)}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-- -->
          <a href="${ctaUrl}" style="display:inline-block;padding:14px 34px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">${escapeHtml(input.template.ctaLabel)}</a>
          <!--<![endif]-->
          <p style="margin:12px 0 0;font-size:13px;color:${C.muted};">${escapeHtml(input.template.ctaNote)}</p>
        </td></tr>

        <tr><td style="background-color:${C.white};padding:24px 32px 30px;">
          <p style="margin:0;font-size:15px;color:${C.body};line-height:1.7;">Just reply to this email if it is easier — it comes straight to us.</p>
          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">Best regards,<br />Mike LaCorte<br /><span style="color:${C.muted};font-size:14px;">Founder, Investigator Events</span></p>
        </td></tr>

        <tr><td style="padding:18px 32px 0;text-align:center;">
          <p style="margin:0;font-size:12px;color:${C.faint};">
            <a href="${SITE}" style="color:${C.faint};text-decoration:none;">investigatorevents.com</a> &middot;
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
