const SITE = 'https://investigatorevents.com';

export function buildPublicEmailVerificationEmail(fullName: string | null, verifyUrl: string): string {
  const greeting = fullName ? `Hi ${fullName}` : 'Hi';

  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f0f4f8;padding:24px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;">
        <tr><td style="padding:28px 32px;text-align:center;">
          <img src="${SITE}/logo/ielogo1.PNG" alt="Investigator Events" width="44" height="44" style="border-radius:50%;" />
          <h1 style="margin:20px 0 0;font-size:22px;line-height:1.25;color:#0f172a;">Confirm your email</h1>
          <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#334155;">${greeting}, click below to make your Investigator Events profile visible to other members.</p>
          <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b;">You can use your account before confirming, but your profile will stay private until this step is complete.</p>
          <p style="margin:24px 0 0;">
            <a href="${verifyUrl}" style="display:inline-block;border-radius:999px;background:#0f172a;color:#ffffff;padding:14px 28px;text-decoration:none;font-weight:700;font-size:14px;">Confirm email</a>
          </p>
          <p style="margin:22px 0 0;font-size:12px;line-height:1.5;color:#94a3b8;">If you did not create this account, you can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
