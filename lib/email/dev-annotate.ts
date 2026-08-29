/**
 * Review-only helpers: wrap a rendered email in a developer note, and stack a
 * multi-step sequence into a single message.
 *
 * Used exclusively by scripts/send-every-email-to-me.ts. Nothing here is ever
 * part of a real send — the annotation banner would be visible to recipients.
 */

export interface DevNote {
  /** What this email is, in one line. */
  what: string;
  /** What causes it to be sent. */
  trigger: string;
  /** Who receives it. */
  audience: string;
  /** Live, disarmed, awaiting approval, etc. */
  status: string;
  /** Where the template lives. */
  file: string;
}

const NOTE_BG = '#0f172a';
const NOTE_ACCENT = '#38bdf8';

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:3px 12px 3px 0;font-size:11px;font-weight:700;color:${NOTE_ACCENT};text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:3px 0;font-size:13px;color:#e2e8f0;line-height:1.5;">${value}</td>
  </tr>`;
}

/** The dark banner that separates reviewer context from the email itself. */
export function devNoteBanner(index: number, total: number, title: string, note: DevNote): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${NOTE_BG};">
    <tr><td align="center" style="padding:18px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:10px;">
          <span style="display:inline-block;background-color:${NOTE_ACCENT};color:${NOTE_BG};font-size:11px;font-weight:800;padding:3px 8px;border-radius:4px;letter-spacing:0.06em;">DEV NOTE ${index}/${total}</span>
          <span style="font-size:15px;font-weight:700;color:#ffffff;padding-left:8px;">${title}</span>
        </td></tr>
        <tr><td>
          <table cellpadding="0" cellspacing="0" role="presentation">
            ${row('What', note.what)}
            ${row('Trigger', note.trigger)}
            ${row('Goes to', note.audience)}
            ${row('Status', note.status)}
            ${row('File', note.file)}
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

/** A lighter divider used between steps of a batched sequence. */
export function stepDivider(label: string, sub: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#1e293b;">
    <tr><td align="center" style="padding:14px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">
        <tr><td>
          <p style="margin:0;font-size:14px;font-weight:700;color:#ffffff;">${label}</p>
          <p style="margin:3px 0 0;font-size:12px;color:#94a3b8;">${sub}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>`;
}

/**
 * Pull the renderable content out of a complete HTML email so several can be
 * stacked in one message. Falls back to the whole string if there is no body
 * tag, which is safe — worst case the reviewer sees a nested document.
 */
export function innerBody(html: string): string {
  const open = html.search(/<body[^>]*>/i);
  if (open === -1) return html;
  const afterOpen = html.indexOf('>', open) + 1;
  const close = html.toLowerCase().lastIndexOf('</body>');
  return close === -1 ? html.slice(afterOpen) : html.slice(afterOpen, close);
}

/** Wrap annotated content in a minimal document shell. */
export function shell(content: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
${content}
</body></html>`;
}
