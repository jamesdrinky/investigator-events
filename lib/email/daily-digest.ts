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

interface DigestCounts {
  followers: number;
  connectionRequests: number;
  connectionsAccepted: number;
  likes: number;
  comments: number;
}

export function buildDailyDigestEmail(name: string, counts: DigestCounts): string {
  const items: string[] = [];

  if (counts.followers > 0) {
    items.push(`<tr><td style="padding:10px 0;border-bottom:1px solid ${C.border};">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="36" valign="top" style="padding-right:12px;font-size:20px;">👤</td>
        <td><p style="margin:0;font-size:14px;color:${C.dark};font-weight:600;">${counts.followers} new follower${counts.followers !== 1 ? 's' : ''}</p>
        <p style="margin:2px 0 0;font-size:12px;color:${C.muted};">People are finding your profile.</p></td>
      </tr></table>
    </td></tr>`);
  }

  if (counts.connectionRequests > 0) {
    items.push(`<tr><td style="padding:10px 0;border-bottom:1px solid ${C.border};">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="36" valign="top" style="padding-right:12px;font-size:20px;">🤝</td>
        <td><p style="margin:0;font-size:14px;color:${C.dark};font-weight:600;">${counts.connectionRequests} connection request${counts.connectionRequests !== 1 ? 's' : ''}</p>
        <p style="margin:2px 0 0;font-size:12px;color:${C.muted};">Investigators want to connect with you.</p></td>
      </tr></table>
    </td></tr>`);
  }

  if (counts.connectionsAccepted > 0) {
    items.push(`<tr><td style="padding:10px 0;border-bottom:1px solid ${C.border};">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="36" valign="top" style="padding-right:12px;font-size:20px;">✅</td>
        <td><p style="margin:0;font-size:14px;color:${C.dark};font-weight:600;">${counts.connectionsAccepted} connection${counts.connectionsAccepted !== 1 ? 's' : ''} accepted</p>
        <p style="margin:2px 0 0;font-size:12px;color:${C.muted};">You're growing your network.</p></td>
      </tr></table>
    </td></tr>`);
  }

  if (counts.likes > 0) {
    items.push(`<tr><td style="padding:10px 0;border-bottom:1px solid ${C.border};">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="36" valign="top" style="padding-right:12px;font-size:20px;">❤️</td>
        <td><p style="margin:0;font-size:14px;color:${C.dark};font-weight:600;">${counts.likes} like${counts.likes !== 1 ? 's' : ''} on your posts</p>
        <p style="margin:2px 0 0;font-size:12px;color:${C.muted};">Your content is resonating.</p></td>
      </tr></table>
    </td></tr>`);
  }

  if (counts.comments > 0) {
    items.push(`<tr><td style="padding:10px 0;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="36" valign="top" style="padding-right:12px;font-size:20px;">💬</td>
        <td><p style="margin:0;font-size:14px;color:${C.dark};font-weight:600;">${counts.comments} new comment${counts.comments !== 1 ? 's' : ''}</p>
        <p style="margin:2px 0 0;font-size:12px;color:${C.muted};">People are engaging with your posts.</p></td>
      </tr></table>
    </td></tr>`);
  }

  const totalActivity = counts.followers + counts.connectionRequests + counts.connectionsAccepted + counts.likes + counts.comments;

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
            <tr><td style="padding:32px 28px;">

              <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;">
                Your daily update
              </p>
              <p style="margin:8px 0 0;font-size:14px;color:${C.muted};">
                Hi ${name}, here's what happened today.
              </p>

              <!-- Activity summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
                ${items.join('\n')}
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px auto 0;">
                <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${SITE}/people?tab=discover" style="height:46px;v-text-anchor:middle;width:200px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
                    <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">View your activity</center></v:textbox>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${SITE}/people?tab=feed" style="display:inline-block;padding:13px 32px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">
                    View your activity
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
