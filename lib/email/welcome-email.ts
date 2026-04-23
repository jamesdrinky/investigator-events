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

export function buildWelcomeEmail(fullName: string | null): string {
  const greeting = fullName ? `Hi ${fullName}` : 'Welcome';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
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
            <tr><td style="padding:36px 28px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;">
                ${greeting},
              </p>
              <p style="margin:16px 0 0;font-size:14px;color:${C.body};line-height:1.6;">
                Thanks for joining Investigator Events. You're one step away from being visible to the global PI community.
              </p>
              <p style="margin:12px 0 0;font-size:14px;color:${C.body};line-height:1.6;">
                Complete your profile to connect with fellow investigators, follow events and associations, and show up in the PI directory.
              </p>

              <!-- Step checklist -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px auto;text-align:left;">
                <tr><td style="padding:6px 0;font-size:14px;color:${C.body};line-height:1.5;">
                  1. Add your photo
                </td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:${C.body};line-height:1.5;">
                  2. Set your country and specialisation
                </td></tr>
                <tr><td style="padding:6px 0;font-size:14px;color:${C.body};line-height:1.5;">
                  3. Follow the associations you belong to
                </td></tr>
              </table>

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px auto 0;">
                <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
                  <!--[if mso]>
                  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${SITE}/profile/setup" style="height:46px;v-text-anchor:middle;width:220px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
                    <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">Complete your profile</center></v:textbox>
                  </v:roundrect>
                  <![endif]-->
                  <!--[if !mso]><!-->
                  <a href="${SITE}/profile/setup" style="display:inline-block;padding:14px 36px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">
                    Complete your profile
                  </a>
                  <!--<![endif]-->
                </td></tr>
              </table>

              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:12px auto 0;">
                <tr><td align="center">
                  <a href="${SITE}/calendar" style="display:inline-block;padding:12px 32px;color:${C.blue};text-decoration:none;font-size:13px;font-weight:600;">
                    Browse events in the meantime
                  </a>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:16px 0 0;text-align:center;">
          <p style="margin:0;font-size:11px;color:${C.faint};">
            Investigator Events &middot;
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
          <p style="margin:4px 0 0;font-size:10px;color:${C.faint};">
            The global PI conference calendar.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
