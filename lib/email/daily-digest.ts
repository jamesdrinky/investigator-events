const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;

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
    return `<img src="${avatar}" alt="" width="40" height="40" style="display:block;width:40px;height:40px;border-radius:50%;border:0;" />`;
  }
  return `<div style="width:40px;height:40px;border-radius:50%;background-color:#dbeafe;text-align:center;line-height:40px;font-size:16px;font-weight:700;color:${C.blue};">${name.charAt(0)}</div>`;
}

function typeBadge(type: string): string {
  const badges: Record<string, { label: string; bg: string; color: string }> = {
    follow: { label: 'Followed you', bg: '#dbeafe', color: '#2563eb' },
    connection_request: { label: 'Wants to connect', bg: '#d1fae5', color: '#059669' },
    connection_accepted: { label: 'Accepted your request', bg: '#d1fae5', color: '#059669' },
    post_like: { label: 'Liked your post', bg: '#fce7f3', color: '#db2777' },
    post_comment: { label: 'Commented on your post', bg: '#ede9fe', color: '#6d28d9' },
  };
  const b = badges[type] ?? { label: 'Activity', bg: '#f1f5f9', color: '#64748b' };
  return `<span style="display:inline-block;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;background-color:${b.bg};color:${b.color};">${b.label}</span>`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/London' });
}

export function buildDailyDigestEmail(name: string, notifications: DigestNotification[]): string {
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
  const summaryLine = summaryParts.join(' · ');
  const total = notifications.length;

  const rows = notifications.slice(0, 8).map((n) => {
    const profileLink = n.actorUsername ? `${SITE}/profile/${n.actorUsername}` : `${SITE}/people?tab=discover`;
    return `
    <tr><td style="padding:10px 0;border-bottom:1px solid ${C.border};">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
        <td width="52" valign="middle" style="padding-right:12px;">
          <a href="${profileLink}" style="text-decoration:none;">
            ${avatarCell(n.actorAvatar, n.actorName)}
          </a>
        </td>
        <td valign="middle">
          <p style="margin:0 0 3px;">
            <a href="${profileLink}" style="font-size:14px;font-weight:700;color:${C.dark};text-decoration:none;">${n.actorName}</a>
            <span style="color:${C.faint};font-size:11px;font-weight:400;"> · ${formatTime(n.createdAt)}</span>
          </p>
          ${typeBadge(n.type)}
        </td>
      </tr></table>
    </td></tr>`;
  }).join('\n');

  const remaining = notifications.length - 8;

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
      <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;width:100%;">

        <!-- Wave banner -->
        <tr><td>
          <img src="${WAVE}" alt="" width="520" style="display:block;width:100%;height:auto;" />
        </td></tr>

        <!-- Logo -->
        <tr><td style="background-color:${C.white};padding:18px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="36" height="36" style="display:inline-block;width:36px;height:36px;border-radius:50%;" />
        </td></tr>

        <!-- Content card -->
        <tr><td style="background-color:${C.white};padding:16px 24px 28px;">

          <p style="margin:0;font-size:20px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;text-align:center;">
            ${name}, people are noticing you
          </p>
          <p style="margin:6px 0 0;font-size:12px;color:${C.muted};text-align:center;">
            ${summaryLine}
          </p>

          <!-- Notification rows -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;">
            ${rows}
          </table>

          ${remaining > 0 ? `
          <p style="margin:10px 0 0;font-size:12px;color:${C.faint};text-align:center;">
            + ${remaining} more notification${remaining !== 1 ? 's' : ''}
          </p>
          ` : ''}

          <!-- CTA buttons -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 0;">
            <tr><td align="center">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${SITE}/people?tab=feed" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="50%" fillcolor="${C.blue}" stroke="false">
                <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:13px;font-weight:600;">See who's been active</center></v:textbox>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${SITE}/people?tab=feed" style="display:inline-block;padding:12px 28px;background-color:${C.blue};color:${C.white};text-decoration:none;font-size:13px;font-weight:600;border-radius:99px;">
                See who's been active
              </a>
              <!--<![endif]-->
            </td></tr>
            <tr><td align="center" style="padding-top:10px;">
              <a href="${SITE}/people?tab=discover" style="font-size:12px;color:${C.blue};text-decoration:none;font-weight:600;">Discover more investigators &rarr;</a>
            </td></tr>
          </table>

        </td></tr>

        <!-- Brand divider -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="33%" style="height:3px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:3px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" style="height:3px;background-color:#06b6d4;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 8px 8px;text-align:center;">
          <p style="margin:0;font-size:12px;color:${C.muted};font-weight:500;">
            <a href="${SITE}/calendar" style="color:${C.muted};text-decoration:none;">Events</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE}/people?tab=discover" style="color:${C.muted};text-decoration:none;">Directory</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE}/associations" style="color:${C.muted};text-decoration:none;">Associations</a>
          </p>
          <p style="margin:8px 0 0;font-size:10px;color:${C.faint};">
            Investigator Events &middot; The global PI conference calendar.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
