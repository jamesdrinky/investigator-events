const SITE = 'https://investigatorevents.com';
const LOGO = `${SITE}/logo/ielogo1.PNG`;
const WAVE = `${SITE}/email/wave-banner.png`;

const C = {
  blue: '#2563eb',
  blueDark: '#1d4ed8',
  blueSoft: '#dbeafe',
  green: '#059669',
  greenSoft: '#d1fae5',
  amber: '#d97706',
  amberSoft: '#fef3c7',
  purple: '#7c3aed',
  dark: '#0f172a',
  body: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  border: '#e2e8f0',
  white: '#ffffff',
  bg: '#f0f4f8',
};

export interface ReengagementInput {
  fullName: string | null;
  username: string | null;
  completionScore: number;
  missingItems: { label: string; href: string }[];
  isLinkedInVerified: boolean;
  isManuallyVerified: boolean;
  daysSinceLastSeen: number | null;
  // Events: either "new since last visit" or fallback to "upcoming on the calendar"
  eventsMode: 'new_since_visit' | 'upcoming';
  eventsTotalCount: number;
  events: { title: string; slug: string; city: string | null; country: string | null; startDate: string; imagePath: string | null }[];
  // Associations: either "new since last visit" or fallback to "featured/all"
  associationsMode: 'new_since_visit' | 'featured';
  associationsTotalCount: number;
  associations: { name: string; slug: string; logoUrl: string | null }[];
  unsubscribeToken: string | null;
}

export type ReengagementVariant = 'tier_a_unverified' | 'tier_a_verified'
  | 'tier_b_unverified' | 'tier_b_verified'
  | 'tier_c_unverified' | 'tier_c_verified';

export function pickVariant(input: ReengagementInput): ReengagementVariant {
  const tier = input.completionScore < 40 ? 'a' : input.completionScore < 80 ? 'b' : 'c';
  const verified = input.isLinkedInVerified ? 'verified' : 'unverified';
  return `tier_${tier}_${verified}` as ReengagementVariant;
}

export function pickSubject(input: ReengagementInput): string {
  const v = pickVariant(input);
  if (v.startsWith('tier_a')) return `Finish setting up your Investigator Events profile`;
  if (v.startsWith('tier_b')) return `You're nearly there — add the finishing touches to your profile`;
  // tier_c
  if (input.eventsMode === 'new_since_visit' && input.eventsTotalCount > 0) {
    return `${input.eventsTotalCount} new event${input.eventsTotalCount === 1 ? '' : 's'} on Investigator Events since you were last here`;
  }
  return `What's coming up on Investigator Events`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function absoluteImage(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE}${path.startsWith('/') ? '' : '/'}${path}`;
}

function letterTile(name: string, size: number = 48): string {
  const ch = (name.trim()[0] ?? '?').toUpperCase();
  return `<div style="display:inline-block;width:${size}px;height:${size}px;line-height:${size}px;text-align:center;border-radius:${Math.round(size / 4)}px;background-image:linear-gradient(135deg, ${C.blue}, ${C.purple});color:#ffffff;font-size:${Math.round(size * 0.42)}px;font-weight:800;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">${ch}</div>`;
}

function ctaButton(href: string, label: string, color: string = C.dark): string {
  return `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
    <tr><td align="center" style="background-color:${color};border-radius:99px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${href}" style="height:46px;v-text-anchor:middle;width:240px;" arcsize="50%" fillcolor="${color}" stroke="false">
        <v:textbox inset="0,0,0,0"><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;">${label}</center></v:textbox>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${href}" style="display:inline-block;padding:14px 36px;background-color:${color};color:${C.white};text-decoration:none;font-size:14px;font-weight:600;border-radius:99px;">${label}</a>
      <!--<![endif]-->
    </td></tr>
  </table>`;
}

function progressBar(score: number): string {
  const pct = Math.max(0, Math.min(100, score));
  const fillColor = score >= 80 ? C.green : score >= 40 ? C.blue : C.amber;
  return `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="margin:8px 0 18px;">
    <tr><td>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="background-color:${C.border};border-radius:99px;height:8px;">
        <tr>
          <td width="${pct}%" style="background-color:${fillColor};border-radius:99px;height:8px;font-size:0;line-height:0;">&nbsp;</td>
          <td width="${100 - pct}%" style="font-size:0;line-height:0;">&nbsp;</td>
        </tr>
      </table>
      <p style="margin:8px 0 0;font-size:12px;color:${C.muted};font-weight:600;">${pct}% complete</p>
    </td></tr>
  </table>`;
}

function missingChecklist(items: ReengagementInput['missingItems'], max: number = 4): string {
  if (items.length === 0) return '';
  const top = items.slice(0, max);
  const rows = top.map((item) => `
    <tr>
      <td width="22" valign="top" style="padding:6px 0;">
        <span style="display:inline-block;width:14px;height:14px;border:2px solid ${C.border};border-radius:4px;"></span>
      </td>
      <td style="padding:6px 0;font-size:14px;color:${C.body};line-height:1.5;">${item.label}</td>
    </tr>`).join('');
  return `
  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:14px auto 6px;text-align:left;width:100%;max-width:380px;">
    ${rows}
  </table>`;
}

function verifiedBadge(label: string = 'Verified via LinkedIn'): string {
  return `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 10px;">
    <tr><td style="background-color:${C.greenSoft};border-radius:99px;padding:6px 14px;">
      <span style="font-size:12px;font-weight:700;color:${C.green};">✓ ${label}</span>
    </td></tr>
  </table>`;
}

function verifyCallout(): string {
  return `
  <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto 14px;">
    <tr><td style="background-color:${C.blueSoft};border-radius:10px;padding:12px 16px;">
      <p style="margin:0;font-size:13px;color:${C.blueDark};line-height:1.5;">
        <strong>Tip:</strong> verify with LinkedIn in 30 seconds — it gets you a green check on your profile and pushes you up the directory.
      </p>
    </td></tr>
  </table>`;
}

function eventNameRow(e: ReengagementInput['events'][number]): string {
  const loc = [e.city, e.country].filter(Boolean).join(', ');
  const imgUrl = absoluteImage(e.imagePath);
  const thumb = imgUrl
    ? `<img src="${imgUrl}" alt="" width="64" height="64" style="display:block;width:64px;height:64px;border-radius:10px;object-fit:cover;border:0;" />`
    : `<div style="width:64px;height:64px;border-radius:10px;background-image:linear-gradient(135deg, ${C.blue}, ${C.purple});"></div>`;
  return `
  <tr><td style="padding:8px 0;">
    <a href="${SITE}/events/${e.slug}" style="text-decoration:none;color:${C.dark};">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
        <tr>
          <td width="64" valign="top" style="width:64px;padding-right:14px;">
            ${thumb}
          </td>
          <td valign="middle">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${C.blue};">
              ${formatDate(e.startDate)}
            </p>
            <p style="margin:3px 0 0;font-size:14px;font-weight:700;color:${C.dark};line-height:1.35;">${e.title}</p>
            ${loc ? `<p style="margin:3px 0 0;font-size:12px;color:${C.muted};">${loc}</p>` : ''}
          </td>
        </tr>
      </table>
    </a>
  </td></tr>`;
}

function assocNameRow(a: ReengagementInput['associations'][number]): string {
  const logoUrl = absoluteImage(a.logoUrl);
  const logo = logoUrl
    ? `<img src="${logoUrl}" alt="" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:12px;object-fit:contain;background-color:#ffffff;border:1px solid ${C.border};padding:4px;box-sizing:border-box;" />`
    : letterTile(a.name, 48);
  return `
  <tr><td style="padding:8px 0;">
    <a href="${SITE}/associations/${a.slug}" style="text-decoration:none;color:${C.dark};">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
        <tr>
          <td width="48" valign="middle" style="width:48px;padding-right:14px;">
            ${logo}
          </td>
          <td valign="middle">
            <p style="margin:0;font-size:14px;font-weight:700;color:${C.dark};line-height:1.35;">${a.name}</p>
          </td>
        </tr>
      </table>
    </a>
  </td></tr>`;
}

function statsBlock(input: ReengagementInput): string {
  const sinceWhen = input.daysSinceLastSeen !== null
    ? (input.daysSinceLastSeen < 1 ? 'today' : input.daysSinceLastSeen === 1 ? 'yesterday' : `${input.daysSinceLastSeen} days ago`)
    : null;

  const hasNewSinceVisit = input.eventsMode === 'new_since_visit' || input.associationsMode === 'new_since_visit';
  const lead = hasNewSinceVisit && sinceWhen
    ? `Since you were last here (${sinceWhen})`
    : `What's on Investigator Events right now`;

  const hasEvents = input.events.length > 0;
  const hasAssocs = input.associations.length > 0;
  if (!hasEvents && !hasAssocs) return '';

  const eventsHeading = input.eventsMode === 'new_since_visit'
    ? `<strong style="color:${C.blue};">${input.eventsTotalCount}</strong> new event${input.eventsTotalCount === 1 ? '' : 's'} on the calendar`
    : `Coming up on the calendar`;
  const eventsTrailer = input.eventsMode === 'new_since_visit' && input.eventsTotalCount > input.events.length
    ? `<p style="margin:8px 0 0;font-size:11px;color:${C.muted};">+ ${input.eventsTotalCount - input.events.length} more</p>`
    : '';

  const eventSection = hasEvents ? `
    <tr><td style="padding:14px 20px 4px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${C.dark};">
        ${eventsHeading}
      </p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
        ${input.events.slice(0, 5).map(eventNameRow).join('')}
      </table>
      ${eventsTrailer}
    </td></tr>` : '';

  const assocsHeading = input.associationsMode === 'new_since_visit'
    ? `<strong style="color:${C.purple};">${input.associationsTotalCount}</strong> new association${input.associationsTotalCount === 1 ? '' : 's'} listed`
    : `Featured associations`;
  const assocsTrailer = input.associationsMode === 'new_since_visit' && input.associationsTotalCount > input.associations.length
    ? `<p style="margin:8px 0 0;font-size:11px;color:${C.muted};">+ ${input.associationsTotalCount - input.associations.length} more</p>`
    : '';

  const assocSection = hasAssocs ? `
    <tr><td style="padding:14px 20px 16px;${hasEvents ? `border-top:1px solid ${C.border};` : ''}">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${C.dark};">
        ${assocsHeading}
      </p>
      <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
        ${input.associations.slice(0, 5).map(assocNameRow).join('')}
      </table>
      ${assocsTrailer}
    </td></tr>` : '';

  return `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="margin:16px 0;background-color:#f8fafc;border:1px solid ${C.border};border-radius:12px;">
    <tr><td style="padding:14px 20px 4px;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${C.muted};">
        ${lead}
      </p>
    </td></tr>
    ${eventSection}
    ${assocSection}
  </table>`;
}

function tierCopy(input: ReengagementInput): { headline: string; subline: string; primaryCta: { href: string; label: string } } {
  const variant = pickVariant(input);
  if (variant.startsWith('tier_a')) {
    return {
      headline: 'Finish setting up your profile',
      subline: 'You signed up but haven\'t filled in the basics yet — take 2 minutes and you\'ll show up in the PI directory and on event attendance lists.',
      primaryCta: { href: `${SITE}/profile/edit`, label: 'Complete my profile' },
    };
  }
  if (variant.startsWith('tier_b')) {
    return {
      headline: 'Add the finishing touches',
      subline: 'Your profile is in good shape — a couple more details and you\'ll rank higher in the directory and look the part to peers and event organisers.',
      primaryCta: { href: `${SITE}/profile/edit`, label: 'Polish my profile' },
    };
  }
  // tier_c
  return {
    headline: 'Your profile looks great — see what\'s new',
    subline: 'You\'re set up. Here\'s what\'s landed on Investigator Events since you were last here.',
    primaryCta: { href: `${SITE}/calendar`, label: 'Browse the calendar' },
  };
}

export function buildReengagementEmail(input: ReengagementInput): string {
  const variant = pickVariant(input);
  const tier = variant.startsWith('tier_a') ? 'a' : variant.startsWith('tier_b') ? 'b' : 'c';
  const greeting = input.fullName ? `Hi ${input.fullName.split(' ')[0]}` : 'Hi there';
  const { headline, subline, primaryCta } = tierCopy(input);
  const profileUrl = input.username ? `${SITE}/profile/${input.username}` : `${SITE}/profile`;

  const showVerifiedBadge = input.isLinkedInVerified || input.isManuallyVerified;
  const showVerifyCallout = !input.isLinkedInVerified && !input.isManuallyVerified;
  const showProgressBar = tier !== 'c';
  const showChecklist = tier !== 'c' && input.missingItems.length > 0;
  const showStats = (input.events.length + input.associations.length) > 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
</head>
<body style="margin:0;padding:0;background-color:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:${C.bg};padding:24px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

        <tr><td>
          <img src="${WAVE}" alt="" width="560" style="display:block;width:100%;height:auto;" />
        </td></tr>

        <tr><td style="background-color:${C.white};padding:20px 0 0;text-align:center;">
          <img src="${LOGO}" alt="Investigator Events" width="40" height="40" style="display:inline-block;width:40px;height:40px;border-radius:50%;" />
        </td></tr>

        <tr><td style="background-color:${C.white};padding:20px 32px 8px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${C.muted};">${greeting},</p>
          <p style="margin:0;font-size:24px;font-weight:800;color:${C.dark};letter-spacing:-0.02em;line-height:1.2;">
            ${headline}
          </p>
          <p style="margin:14px 0 0;font-size:15px;color:${C.body};line-height:1.6;">
            ${subline}
          </p>
        </td></tr>

        ${showVerifiedBadge ? `<tr><td style="background-color:${C.white};padding:14px 32px 0;text-align:center;">${verifiedBadge(input.isLinkedInVerified ? 'Verified via LinkedIn' : 'Verified by Investigator Events')}</td></tr>` : ''}

        ${showProgressBar ? `<tr><td style="background-color:${C.white};padding:14px 32px 0;">${progressBar(input.completionScore)}</td></tr>` : ''}

        ${showChecklist ? `<tr><td style="background-color:${C.white};padding:0 32px 6px;">
          <p style="margin:6px 0 0;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${C.muted};text-align:left;">What's still to do</p>
          ${missingChecklist(input.missingItems)}
        </td></tr>` : ''}

        ${showVerifyCallout ? `<tr><td style="background-color:${C.white};padding:6px 32px 0;">${verifyCallout()}</td></tr>` : ''}

        ${showStats ? `<tr><td style="background-color:${C.white};padding:0 32px;">${statsBlock(input)}</td></tr>` : ''}

        <tr><td style="background-color:${C.white};padding:18px 32px 32px;text-align:center;">
          ${ctaButton(primaryCta.href, primaryCta.label)}
          <p style="margin:14px 0 0;">
            <a href="${profileUrl}" style="font-size:13px;color:${C.blue};text-decoration:none;font-weight:600;">View my profile →</a>
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
          <p style="margin:4px 0 0;font-size:10px;color:${C.faint};">
            You received this because you opted into the Investigator Events newsletter.
            ${input.unsubscribeToken ? `<a href="${SITE}/api/newsletter/unsubscribe?token=${input.unsubscribeToken}" style="color:${C.faint};text-decoration:underline;">Unsubscribe</a> &middot; ` : ''}
            <a href="${SITE}/profile/edit" style="color:${C.faint};text-decoration:underline;">Manage your account</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
