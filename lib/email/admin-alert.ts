import { escapeHtml } from '@/lib/security/server';

export const ADMIN_ALERT_INBOX = 'info@investigatorevents.com';

interface AdminAlertOptions {
  heading: string;
  intro: string;
  rows: Array<{ label: string; value: string | null | undefined }>;
  // Optional link button (e.g. straight to the admin queue).
  cta?: { label: string; url: string };
}

/**
 * A plain, internal notification email sent to the team inbox whenever something
 * lands that needs review (a new event or video submission). Deliberately
 * lightweight — this isn't a marketing template, it's an ops ping. All
 * user-supplied values are HTML-escaped.
 */
export function buildAdminAlertEmail({ heading, intro, rows, cta }: AdminAlertOptions): string {
  const rowsHtml = rows
    .filter((r) => r.value != null && String(r.value).trim() !== '')
    .map(
      (r) => `<tr>
        <td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;vertical-align:top">${escapeHtml(r.label)}</td>
        <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:600">${escapeHtml(String(r.value))}</td>
      </tr>`,
    )
    .join('');

  const ctaHtml = cta
    ? `<a href="${escapeHtml(cta.url)}" style="display:inline-block;margin-top:20px;padding:11px 24px;background:#0f172a;color:#fff;text-decoration:none;font-size:14px;font-weight:600;border-radius:99px">${escapeHtml(cta.label)}</a>`
    : '';

  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
    <h2 style="margin:0 0 6px;font-size:19px">${escapeHtml(heading)}</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#334155">${escapeHtml(intro)}</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;margin-top:4px">${rowsHtml}</table>
    ${ctaHtml}
    <p style="margin:22px 0 0;font-size:12px;color:#94a3b8">Investigator Events · internal notification</p>
  </div>`;
}
