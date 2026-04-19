const SITE = 'https://investigatorevents.com';

export function buildConfirmationEmail(token: string): string {
  const confirmUrl = `${SITE}/api/newsletter/confirm?token=${token}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <style>
    :root { color-scheme: light only !important; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #f0f4f8 !important; }
      .card { background-color: #ffffff !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f0f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;">

        <tr><td style="padding:0 0 20px;text-align:center;">
          <img src="${SITE}/logo/ielogo1.PNG" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>

        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="card" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.04),0 12px 32px -12px rgba(15,23,42,0.08);">
            <tr><td style="padding:36px 28px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">Confirm your subscription</p>
              <p style="margin:12px 0 0;font-size:14px;color:#64748b;line-height:1.6;">
                Click the button below to confirm your subscription to the Investigator Events weekly briefing.
              </p>
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin:28px auto 0;">
                <tr><td align="center">
                  <a href="${confirmUrl}" style="display:inline-block;padding:14px 36px;background-color:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">Confirm subscription</a>
                </td></tr>
              </table>
              <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
                If you didn't subscribe, you can ignore this email.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:16px 0 0;text-align:center;">
          <p style="margin:0;font-size:10px;color:#cbd5e1;">Investigator Events · info@investigatorevents.com</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
