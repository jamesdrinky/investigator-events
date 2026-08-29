/**
 * One-off: send Gautam Kumar (Globe Detective / CII) the "how to submit your video"
 * email, as James, branded with the IE chrome + James signature. Mirrors
 * scripts/send-tali-bob.ts. Replies to Gautam's "please share the next steps".
 *
 * Dry run (prints, sends nothing):  RESEND_API_KEY=... npx tsx scripts/send-cii-gautam.ts
 * Preview to yourselves only:        RESEND_API_KEY=... npx tsx scripts/send-cii-gautam.ts --preview
 * Send for real (to Gautam):         RESEND_API_KEY=... npx tsx scripts/send-cii-gautam.ts --send
 */
import { Resend } from 'resend';

const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;
const SUBMIT_URL = `${SITE}/events/cii-agm-2026/submit-video`;

const GAUTAM = 'gautamkumar@globedetective.com';
const TEAM = ['james@drinky.com', 'm.lacorte@conflictinternational.com'];
const FROM = 'James Drinkwater <info@investigatorevents.com>';
const SUBJECT = 'Your CII 2026 AGM video — how to submit';

const C = { blue: '#2563eb', purple: '#7c3aed', cyan: '#06b6d4', dark: '#0f172a', body: '#334155', muted: '#64748b', faint: '#94a3b8', white: '#ffffff' };

const p = (html: string) => `<p style="margin:16px 0 0;font-size:15px;color:${C.body};line-height:1.7;">${html}</p>`;

const jamesSignature = `
  <table cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;color:${C.dark};line-height:1.4;">
    <tr><td colspan="2" style="padding-bottom:16px;">
      <table cellpadding="0" cellspacing="0" border="0" width="320"><tr>
        <td width="107" style="height:2px;background-color:${C.blue};font-size:0;line-height:0;">&nbsp;</td>
        <td width="106" style="height:2px;background-color:${C.purple};font-size:0;line-height:0;">&nbsp;</td>
        <td width="107" style="height:2px;background-color:${C.cyan};font-size:0;line-height:0;">&nbsp;</td>
      </tr></table>
    </td></tr>
    <tr>
      <td width="56" valign="top" style="padding-right:14px;">
        <a href="${SITE}" style="text-decoration:none;"><img src="${LOGO}" alt="IE" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:50%;border:0;" /></a>
      </td>
      <td valign="top">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="font-size:14px;font-weight:700;color:${C.dark};padding-bottom:1px;">James Drinkwater</td></tr>
          <tr><td style="font-size:12px;color:${C.muted};padding-bottom:8px;">Technical Lead, Investigator Events</td></tr>
          <tr><td style="font-size:12px;color:${C.body};">
            <a href="mailto:info@investigatorevents.com" style="color:${C.blue};text-decoration:none;">info@investigatorevents.com</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE}" style="color:${C.blue};text-decoration:none;">investigatorevents.com</a>
          </td></tr>
          <tr><td style="font-size:12px;color:${C.body};padding-top:2px;">
            <a href="https://www.linkedin.com/company/investigator-events" style="color:${C.blue};text-decoration:none;">LinkedIn</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE}/newsletter" style="color:${C.blue};text-decoration:none;">Newsletter</a>
          </td></tr>
          <tr><td style="padding-top:10px;font-size:11px;color:${C.faint};font-style:italic;">The global PI conference calendar.</td></tr>
        </table>
      </td>
    </tr>
  </table>`;

const html = `<!DOCTYPE html>
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
          ${p('Hi Gautam,')}
          ${p("I'm James from Investigator Events — Mike asked me to send over how to get your CII 2026 AGM video onto the platform. You can do it yourself in a couple of minutes:")}

          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:14px 0 0;"><tr><td style="padding:0 0 0 4px;">
            <p style="margin:0;font-size:15px;color:${C.body};line-height:1.9;">
              <strong>1.</strong>&nbsp; Open the submission page (button below)<br />
              <strong>2.</strong>&nbsp; Sign in, or create a free account if you haven't got one<br />
              <strong>3.</strong>&nbsp; Upload your video and hit submit
            </p>
          </td></tr></table>

          <table cellpadding="0" cellspacing="0" role="presentation" style="margin:22px 0;"><tr><td>
            <a href="${SUBMIT_URL}" target="_blank" style="display:inline-block;background-color:${C.blue};color:${C.white};font-size:15px;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:10px;">Submit your CII AGM video &rarr;</a>
          </td></tr></table>

          ${p("That's it — our team gives it a quick review, then it's live on the CII 2026 AGM page in Prague, and we push it out across our newsletter and LinkedIn to promote the event. It's completely free.")}
          ${p('The video itself: a short promo — up to 3 minutes, landscape, MP4 if possible (up to 500 MB). A welcome-and-invite or a highlights reel both work well. Works straight from a phone too.')}
          ${p("Happy to add a colleague to this — just send me their email. And if you hit any snag at all, give me a shout and I'll walk you through it.")}

          <p style="margin:24px 0 0;font-size:15px;color:${C.body};line-height:1.7;">Best,</p>
          <table cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;"><tr><td>${jamesSignature}</td></tr></table>
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

async function main() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');

  // sanity checks
  const errs: string[] = [];
  if (!html.includes(SUBMIT_URL)) errs.push('submit link missing');
  if (/\{[a-z]+\}/.test(html)) errs.push('unresolved token');
  if (errs.length) { console.error('Aborting:', errs.join('; ')); process.exit(1); }

  const isSend = process.argv.includes('--send');
  const isPreview = process.argv.includes('--preview');

  // --send → Gautam (bcc the team for a record). --preview → team only. default → dry run.
  const to = isSend ? [GAUTAM] : TEAM;
  const bcc = isSend ? TEAM : undefined;
  const subject = isSend ? SUBJECT : `[${isPreview ? 'Preview' : 'Copy'}] To Gautam (CII) — ${SUBJECT}`;

  console.log(`To: ${to}\n${bcc ? `Bcc: ${bcc}\n` : ''}From: ${FROM}\nSubject: ${subject}\nSubmit URL: ${SUBMIT_URL}`);

  if (!isSend && !isPreview) { console.log('\nDRY RUN — pass --preview to send yourselves a copy, or --send to deliver to Gautam.'); return; }

  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: FROM, to, bcc, subject, html,
    tags: [{ name: 'type', value: 'video-submit-howto' }, { name: 'association', value: 'CII' }],
  });
  if (error) { console.error('❌ send failed:', error.message); process.exit(1); }
  console.log(`✅ sent (${data?.id})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
