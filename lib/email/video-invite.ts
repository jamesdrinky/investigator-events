// Video-invite outreach email — personalised invitation to associations/conference
// organisers to feature a promotional video on Investigator Events. Modelled on the
// same chrome/brand conventions as association-outreach.ts, but with an editable body
// (merge tokens) + an embedded, clickable video card and a selectable sender footer.

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;

const C = {
  blue: '#2563eb',
  purple: '#7c3aed',
  cyan: '#06b6d4',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
};

// ---- Senders (footer + From line) -----------------------------------------

export type SenderKey = 'james' | 'mike' | 'team';

interface SenderConfig {
  key: SenderKey;
  name: string;
  title: string;
  fromName: string; // display name in the Resend `from` field
  email: string;
}

export const SENDERS: Record<SenderKey, SenderConfig> = {
  james: {
    key: 'james',
    name: 'James Drinkwater',
    title: 'Technical Lead, Investigator Events',
    fromName: 'James Drinkwater',
    email: 'info@investigatorevents.com',
  },
  mike: {
    key: 'mike',
    name: 'Mike LaCorte',
    title: 'Founder, Investigator Events',
    fromName: 'Mike LaCorte',
    email: 'info@investigatorevents.com',
  },
  team: {
    key: 'team',
    name: 'The Investigator Events Team',
    title: 'Investigator Events',
    fromName: 'Investigator Events',
    email: 'info@investigatorevents.com',
  },
};

export function resolveSender(sender?: string): SenderConfig {
  if (sender && sender in SENDERS) return SENDERS[sender as SenderKey];
  return SENDERS.mike;
}

/** `from` value for Resend, e.g. `James Drinkwater <info@investigatorevents.com>`. */
export function senderFrom(sender?: string): string {
  const s = resolveSender(sender);
  return `${s.fromName} <${s.email}>`;
}

function signatureBlock(sender?: string): string {
  const s = resolveSender(sender);
  return `
  <table cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;color:${C.dark};line-height:1.4;">
    <tr>
      <td colspan="2" style="padding-bottom:14px;">
        <table cellpadding="0" cellspacing="0" border="0" width="320"><tr>
          <td width="107" style="height:2px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
          <td width="106" style="height:2px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
          <td width="107" style="height:2px;background-color:${C.cyan};font-size:0;line-height:0;">&nbsp;</td>
        </tr></table>
      </td>
    </tr>
    <tr>
      <td width="56" valign="top" style="padding-right:14px;">
        <img src="${LOGO}" alt="IE" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:50%;border:0;" />
      </td>
      <td valign="top">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="font-size:14px;font-weight:700;color:${C.dark};padding-bottom:1px;">${s.name}</td></tr>
          <tr><td style="font-size:12px;color:${C.muted};padding-bottom:6px;">${s.title}</td></tr>
          <tr><td style="font-size:12px;color:${C.body};">
            <a href="mailto:${s.email}" style="color:${C.blue};text-decoration:none;">${s.email}</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE}" style="color:${C.blue};text-decoration:none;">investigatorevents.com</a>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>`;
}

// ---- Video card -----------------------------------------------------------

export interface VideoEmailMeta {
  id: string;
  title: string;
  watchUrl: string; // absolute URL to the event/association page hosting the video
}

/**
 * An embedded, clickable video "card": the approved poster image (served publicly
 * via /api/video/[id]/poster) with a prominent Watch button beneath it. We do NOT
 * attach the raw video — that would bounce on size and trip spam filters. The poster
 * links through to the hosted video on the platform.
 */
function videoCard(video: VideoEmailMeta): string {
  const posterUrl = `${SITE}/api/video/${video.id}/poster`;
  const title = escapeHtml(video.title);
  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:22px 0;">
    <tr><td>
      <a href="${video.watchUrl}" target="_blank" style="text-decoration:none;color:inherit;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-radius:14px;overflow:hidden;border:1px solid ${C.border};background-color:${C.dark};">
          <tr><td style="background-color:${C.dark};font-size:0;line-height:0;">
            <img src="${posterUrl}" alt="${title}" width="100%" style="display:block;width:100%;height:auto;border:0;" />
          </td></tr>
          <tr><td style="background-color:${C.white};padding:14px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>
              <td valign="middle" style="font-size:14px;font-weight:700;color:${C.dark};line-height:1.3;">${title}</td>
              <td valign="middle" align="right" style="white-space:nowrap;padding-left:12px;">
                <span style="display:inline-block;background-color:${C.blue};color:${C.white};font-size:13px;font-weight:700;padding:9px 16px;border-radius:8px;">&#9654;&nbsp; Watch the video</span>
              </td>
            </tr></table>
          </td></tr>
        </table>
      </a>
    </td></tr>
  </table>`;
}

// ---- Body rendering (merge tokens + {video} placeholder) ------------------

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface VideoInviteMerge {
  recipientName: string;
  association: string;
  conference: string;
}

function applyMergeTokens(text: string, merge: VideoInviteMerge): string {
  return text
    .replace(/\{name\}/g, escapeHtml(merge.recipientName || 'there'))
    .replace(/\{association\}/g, escapeHtml(merge.association || 'your association'))
    .replace(/\{conference\}/g, escapeHtml(merge.conference || 'your conference'));
}

/**
 * Turn the admin's plain-text body into HTML. Blocks are separated by blank lines →
 * <p>. A block that is exactly `{video}` is replaced with the embedded video card.
 * Single newlines inside a block become <br>. All other text is HTML-escaped, then
 * merge tokens are substituted with escaped values.
 */
function renderBody(bodyText: string, merge: VideoInviteMerge, video: VideoEmailMeta | null): string {
  const blocks = bodyText.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  return blocks
    .map((block) => {
      const trimmed = block.trim();
      if (trimmed === '{video}') {
        return video ? videoCard(video) : '';
      }
      // Escape first, then substitute tokens (tokens are plain ASCII, unaffected by escaping).
      const escaped = escapeHtml(block.trim());
      const withTokens = applyMergeTokens(escaped, merge);
      const withBreaks = withTokens.replace(/\n/g, '<br />');
      return `<p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">${withBreaks}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

// ---- Defaults (pre-fill the composer) -------------------------------------

export const DEFAULT_VIDEO_INVITE_SUBJECT = 'A free promotional spot for {conference} on Investigator Events';

export const DEFAULT_VIDEO_INVITE_BODY = `Dear {name},

I hope this finds you well. I'm reaching out from Investigator Events — the free global calendar and community platform for the private investigations profession.

We recently worked with Phillip Ryfell to feature a promotional video for the World Association of Detectives 2026 conference on our platform. It's had a fantastic response, and we share these videos across our channels — the website, weekly newsletter and LinkedIn — to help promote the event to investigators worldwide.

{video}

We'd love to do exactly the same for {conference}. There's no cost — it's simply a way for us to help {association} reach a wider audience and drive attendance.

The submission process is quick and we'll handle the rest, including posting it across our platforms to give {conference} an extra push. If you're interested, just reply to this email and I'll walk you through it.`;

// ---- Assemble the full email ----------------------------------------------

export interface VideoInviteParams extends VideoInviteMerge {
  subject?: string;
  bodyText: string;
  video: VideoEmailMeta | null;
  sender?: string;
}

export function buildVideoInviteEmail(params: VideoInviteParams): string {
  const merge: VideoInviteMerge = {
    recipientName: params.recipientName,
    association: params.association,
    conference: params.conference,
  };
  const bodyHtml = renderBody(params.bodyText, merge, params.video);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f4f8;padding:24px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
        <tr><td><img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;" /></td></tr>
        <tr><td style="background-color:${C.white};padding:20px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>
        <tr><td style="background-color:${C.white};padding:12px 32px 32px;">
          ${bodyHtml}

          <p style="margin:24px 0 0;font-size:15px;color:${C.body};line-height:1.7;">Warm regards,</p>
          <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;"><tr><td>${signatureBlock(params.sender)}</td></tr></table>
        </td></tr>
        <tr><td><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="33%" style="height:3px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
          <td width="34%" style="height:3px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
          <td width="33%" style="height:3px;background-color:${C.cyan};font-size:0;line-height:0;">&nbsp;</td>
        </tr></table></td></tr>
        <tr><td style="padding:20px 8px 8px;text-align:center;">
          <p style="margin:0;font-size:11px;color:${C.faint};">Investigator Events &middot; <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a></p>
          <p style="margin:4px 0 0;font-size:10px;color:${C.faint};">The global PI conference calendar.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Resolve the subject line's merge tokens (plain text, no HTML escaping). */
export function renderSubject(subject: string, merge: VideoInviteMerge): string {
  return subject
    .replace(/\{name\}/g, merge.recipientName || 'there')
    .replace(/\{association\}/g, merge.association || 'your association')
    .replace(/\{conference\}/g, merge.conference || 'your conference');
}
