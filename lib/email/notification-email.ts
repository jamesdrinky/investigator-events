const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;

const C = {
  blue: '#2563eb',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
};

interface NotificationEmailParams {
  title: string;
  body: string;
  actorName: string;
  actorAvatar?: string | null;
  link?: string;
  ctaText?: string;
}

export function buildNotificationEmail(params: NotificationEmailParams): string {
  const { title, body, actorName, actorAvatar, link, ctaText = 'View' } = params;

  const avatarHtml = actorAvatar
    ? `<img src="${actorAvatar}" alt="" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:50%;border:2px solid ${C.border};" />`
    : `<div style="width:48px;height:48px;border-radius:50%;background-color:#dbeafe;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:${C.blue};">${actorName.charAt(0)}</div>`;

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

              <!-- Actor avatar + name -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 20px;">
                <tr>
                  <td align="center">
                    ${avatarHtml}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <p style="margin:0;font-size:16px;font-weight:700;color:${C.dark};">${actorName}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:15px;color:${C.body};line-height:1.6;text-align:center;">
                ${body || title}
              </p>

              ${link ? `
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px auto 0;">
                <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${link}" style="height:46px;v-text-anchor:middle;width:180px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
                    <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">${ctaText}</center></v:textbox>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${link}" style="display:inline-block;padding:13px 32px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">
                    ${ctaText}
                  </a>
                  <!--<![endif]-->
                </td></tr>
              </table>
              ` : ''}

            </td></tr>
          </table>
        </td></tr>

        <!-- Brand divider -->
        <tr><td style="padding-top:16px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="33%" style="height:2px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:2px;background-color:#7c3aed;font-size:0;line-height:0;">&nbsp;</td>
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
