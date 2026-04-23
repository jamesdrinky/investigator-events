const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;

const C = {
  blue: '#2563eb',
  purple: '#7c3aed',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
};

export interface DigestNotification {
  type: string;
  actorName: string;
  actorAvatar: string | null;
  actorUsername: string | null;
  createdAt: string;
}

function avatarCell(avatar: string | null, name: string): string {
  if (avatar) {
    return `<img src="${avatar}" alt="" width="44" height="44" style="display:block;width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid ${C.border};" />`;
  }
  return `<div style="width:44px;height:44px;border-radius:50%;background-color:#dbeafe;text-align:center;line-height:44px;font-size:17px;font-weight:700;color:${C.blue};border:2px solid ${C.border};">${name.charAt(0)}</div>`;
}

function actionText(type: string): string {
  switch (type) {
    case 'follow': return 'started following you';
    case 'connection_request': return 'wants to connect with you';
    case 'connection_accepted': return 'accepted your connection request';
    case 'post_like': return 'liked your post';
    case 'post_comment': return 'commented on your post';
    default: return 'interacted with you';
  }
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London' });
}

export function buildDailyDigestEmail(name: string, notifications: DigestNotification[]): string {
  // Group by type for the summary line
  const counts: Record<string, number> = {};
  for (const n of notifications) {
    counts[n.type] = (counts[n.type] ?? 0) + 1;
  }

  const summaryParts: string[] = [];
  if (counts['follow']) summaryParts.push(`${counts['follow']} new follower${counts['follow'] !== 1 ? 's' : ''}`);
  if (counts['connection_request']) summaryParts.push(`${counts['connection_request']} connection request${counts['connection_request'] !== 1 ? 's' : ''}`);
  if (counts['connection_accepted']) summaryParts.push(`${counts['connection_accepted']} accepted`);
  if (counts['post_like']) summaryParts.push(`${counts['post_like']} like${counts['post_like'] !== 1 ? 's' : ''}`);
  if (counts['post_comment']) summaryParts.push(`${counts['post_comment']} comment${counts['post_comment'] !== 1 ? 's' : ''}`);
  const summaryLine = summaryParts.join(', ');

  // Build notification rows (max 10, most recent first)
  const rows = notifications.slice(0, 10).map((n) => {
    const profileLink = n.actorUsername ? `${SITE}/profile/${n.actorUsername}` : `${SITE}/people?tab=discover`;
    return `
    <tr><td style="padding:12px 0;border-bottom:1px solid ${C.border};">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
        <td width="56" valign="top" style="padding-right:12px;">
          <a href="${profileLink}" style="text-decoration:none;">
            ${avatarCell(n.actorAvatar, n.actorName)}
          </a>
        </td>
        <td valign="top">
          <p style="margin:0;font-size:14px;color:${C.dark};line-height:1.4;">
            <a href="${profileLink}" style="font-weight:700;color:${C.dark};text-decoration:none;">${n.actorName}</a>
            <span style="color:${C.body};"> ${actionText(n.type)}</span>
          </p>
          <p style="margin:3px 0 0;font-size:11px;color:${C.faint};">${formatTime(n.createdAt)}</p>
        </td>
      </tr></table>
    </td></tr>`;
  }).join('\n');

  const remaining = notifications.length - 10;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f4f8;padding:24px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;width:100%;">

        <tr><td style="padding:0 0 20px;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>

        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${C.white};border-radius:16px;border:1px solid ${C.border};">
            <tr><td style="padding:28px 24px;">

              <p style="margin:0;font-size:20px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;">
                Hi ${name}, here's what you missed
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:${C.muted};">
                ${summaryLine}
              </p>

              <!-- Notification rows -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
                ${rows}
              </table>

              ${remaining > 0 ? `
              <p style="margin:12px 0 0;font-size:12px;color:${C.faint};text-align:center;">
                and ${remaining} more notification${remaining !== 1 ? 's' : ''}
              </p>
              ` : ''}

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px auto 0;">
                <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${SITE}/people?tab=feed" style="height:46px;v-text-anchor:middle;width:200px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
                    <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">View all activity</center></v:textbox>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${SITE}/people?tab=feed" style="display:inline-block;padding:13px 32px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">
                    View all activity
                  </a>
                  <!--<![endif]-->
                </td></tr>
              </table>

            </td></tr>
          </table>
        </td></tr>

        <!-- Brand divider -->
        <tr><td style="padding-top:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="33%" style="height:2px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:2px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" style="height:2px;background-color:#06b6d4;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:16px 8px 8px;text-align:center;">
          <p style="margin:0;font-size:11px;color:${C.faint};">
            Investigator Events &middot;
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
