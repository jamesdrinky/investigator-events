import { escapeHtml } from '@/lib/security/server';

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

export function buildSubmissionConfirmationEmail(eventName: string): string {
  const safeName = escapeHtml(eventName);
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
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

        <!-- Wave banner header -->
        <tr><td>
          <img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;" />
        </td></tr>

        <!-- Logo bar -->
        <tr><td style="background-color:${C.white};padding:20px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:${C.white};padding:24px 32px 36px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;">
            Event received
          </p>
          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            Thank you for submitting <strong>${safeName}</strong> to Investigator Events.
          </p>
          <p style="margin:12px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            We’ll review your submission and get back to you shortly. Most events are approved within 24 hours.
          </p>

          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px auto 0;">
            <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${SITE}/calendar" style="height:46px;v-text-anchor:middle;width:200px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
                <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">Browse the calendar</center></v:textbox>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${SITE}/calendar" style="display:inline-block;padding:14px 36px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">
                Browse the calendar
              </a>
              <!--<![endif]-->
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
        <tr><td style="padding:20px 8px 8px;text-align:center;">
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

/** Sent to the submitter when an admin approves & publishes their event. */
export function buildSubmissionApprovedEmail(eventName: string, eventUrl: string): string {
  const safeName = escapeHtml(eventName);
  const link = eventUrl || `${SITE}/calendar`;
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
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

        <!-- Wave banner header -->
        <tr><td>
          <img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;" />
        </td></tr>

        <!-- Logo bar -->
        <tr><td style="background-color:${C.white};padding:20px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>

        <!-- Body -->
        <tr><td style="background-color:${C.white};padding:24px 32px 36px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;">
            Your event is live 🎉
          </p>
          <p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            Good news — <strong>${safeName}</strong> has been approved and is now published on Investigator Events.
          </p>
          <p style="margin:12px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            It’s visible on the calendar and discoverable by the investigator community.
          </p>

          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px auto 0;">
            <tr><td align="center" style="background-color:${C.dark};border-radius:99px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${link}" style="height:46px;v-text-anchor:middle;width:200px;" arcsize="50%" fillcolor="${C.dark}" stroke="false">
                <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">View your event</center></v:textbox>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${link}" style="display:inline-block;padding:14px 36px;background-color:${C.dark};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">
                View your event
              </a>
              <!--<![endif]-->
            </td></tr>
          </table>
        </td></tr>

        <!-- Fill the room: share with your members -->
        <tr><td style="background-color:${C.white};padding:0 32px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid ${C.border};">
            <tr><td style="padding-top:24px;">
              <p style="margin:0;font-size:17px;font-weight:800;color:${C.dark};text-align:center;">
                Now fill the room 📣
              </p>
              <p style="margin:12px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
                The events that do best are the ones organisers actively share. Take 30 seconds to put <strong>${safeName}</strong> in front of your members and network — by email, newsletter, or your WhatsApp/LinkedIn group. Here’s ready-to-send copy you can paste straight in:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:16px 0 0;background-color:#f8fafc;border:1px solid ${C.border};border-radius:12px;">
                <tr><td style="padding:16px 18px;">
                  <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${C.muted};">
                    Suggested copy for your members
                  </p>
                  <p style="margin:10px 0 0;font-size:14px;color:${C.body};line-height:1.7;font-style:italic;">
                    We’re pleased to share that ${safeName} is now listed on Investigator Events (investigatorevents.com), the free global calendar and community for the private investigations profession. You can see the details and add it to your calendar here: ${link}. While you’re there, set up a free profile to connect with fellow investigators worldwide.
                  </p>
                </td></tr>
              </table>
              <p style="margin:14px 0 0;font-size:13px;color:${C.muted};line-height:1.6;text-align:center;">
                More of the right people see it → more of them in the room.
              </p>
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
        <tr><td style="padding:20px 8px 8px;text-align:center;">
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

export function buildSubmissionRejectedEmail(eventName: string, message: string): string {
  const safeName = escapeHtml(eventName);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');
  return `<!DOCTYPE html>
<html lang="en">
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
        <tr><td><img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;" /></td></tr>
        <tr><td style="background-color:${C.white};padding:20px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>
        <tr><td style="background-color:${C.white};padding:24px 32px 8px;">
          <p style="margin:0;font-size:20px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;">
            About your event submission
          </p>
          <p style="margin:14px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            Thank you for submitting <strong>${safeName}</strong> to Investigator Events.
          </p>
          <p style="margin:14px 0 0;font-size:15px;color:${C.body};line-height:1.7;">
            ${safeMessage}
          </p>
        </td></tr>
        <tr><td style="background-color:${C.white};padding:8px 32px 32px;">
          <p style="margin:0;font-size:14px;color:${C.body};line-height:1.7;">
            Warm regards,<br />The Investigator Events Team
          </p>
        </td></tr>
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="33%" style="height:3px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
            <td width="34%" style="height:3px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
            <td width="33%" style="height:3px;background-color:#06b6d4;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:20px 8px 8px;text-align:center;">
          <p style="margin:0;font-size:11px;color:${C.faint};">
            Investigator Events &middot;
            <a href="mailto:info@investigatorevents.com" style="color:${C.faint};text-decoration:none;">info@investigatorevents.com</a>
          </p>
          <p style="margin:4px 0 0;font-size:10px;color:${C.faint};">The global PI conference calendar.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
