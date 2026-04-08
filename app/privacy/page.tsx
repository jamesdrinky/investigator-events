import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Investigator Events collects, uses, and stores personal data. UK GDPR compliant.'
};

const sections = [
  {
    heading: 'Who we are',
    body: 'Investigator Events is operated by Conflict International. Our contact address for data matters is partners@investigatorevents.com.'
  },
  {
    heading: 'What data we collect and why',
    body: null,
    subsections: [
      {
        title: 'Newsletter signup',
        text: 'When you subscribe to event alerts we collect your email address. We use this to send you a weekly digest of new and upcoming investigator events. The lawful basis for processing is consent. You can withdraw consent at any time by clicking the unsubscribe link in any email or by contacting us directly.'
      },
      {
        title: 'Event submission',
        text: 'When you submit an event for listing we collect your name, contact email address, and the event details you provide. We use this information to review and publish your listing and to contact you about that submission. The lawful basis is legitimate interests (operating the calendar) and, where applicable, performance of a contract.'
      },
      {
        title: 'Advertiser and partner enquiries',
        text: 'When you complete the advertiser or partner enquiry form we collect your name, email address, organisation, and any details you choose to include. We use this to respond to your enquiry and assess whether a commercial relationship is appropriate. The lawful basis is legitimate interests.'
      }
    ]
  },
  {
    heading: 'How long we keep your data',
    body: 'Newsletter subscribers: your email is retained until you unsubscribe. Event submissions: contact details are retained for as long as the listing remains live, and for up to 12 months after removal. Advertiser enquiries: retained for up to 12 months from receipt, unless an ongoing relationship is established.'
  },
  {
    heading: 'Who we share your data with',
    body: 'We do not sell or rent personal data. We may share data with service providers who support the operation of this site (for example, email delivery and database hosting). These providers are bound by data processing agreements and are not permitted to use your data for their own purposes. We do not transfer personal data outside the UK or EEA without appropriate safeguards in place.'
  },
  {
    heading: 'Cookies',
    body: 'We use a single cookie to store your cookie consent preference. This cookie does not track you across sites and contains no personal data. We do not currently use analytics or advertising cookies. If this changes we will update this policy and ask for your consent again.'
  },
  {
    heading: 'Your rights',
    body: 'Under UK GDPR you have the right to access the personal data we hold about you, to correct inaccurate data, to request deletion, to restrict or object to processing, and to data portability where applicable. To exercise any of these rights contact us at partners@investigatorevents.com. You also have the right to lodge a complaint with the Information Commissioner\'s Office (ICO) at ico.org.uk.'
  },
  {
    heading: 'Changes to this policy',
    body: 'We may update this policy from time to time. Material changes will be noted at the top of this page with a revised date. Continued use of the site after changes are posted constitutes acceptance of the updated policy.'
  },
  {
    heading: 'Contact',
    body: 'For any questions about this policy or how we handle your data, email partners@investigatorevents.com.'
  }
];

export default function PrivacyPage() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="container-shell relative space-y-8">
        <Reveal>
          <header className="overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-6 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_28%,rgba(255,255,255,0.1)_56%,rgba(255,255,255,0)_100%)]" />
            <div>
              <p className="eyebrow">Legal</p>
              <h1 className="section-title">Privacy Policy</h1>
              <p className="section-copy max-w-3xl">
                Last updated: April 2026. This policy applies to data collected through investigatorevents.com.
              </p>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.05}>
          <article className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_56%,rgba(255,255,255,0)_100%)]" />
            <div className="relative max-w-3xl space-y-10">
              {sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{section.heading}</h2>
                  {section.body ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{section.body}</p>
                  ) : null}
                  {section.subsections ? (
                    <div className="mt-4 space-y-4">
                      {section.subsections.map((sub) => (
                        <div key={sub.title} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/90 p-4">
                          <p className="text-sm font-semibold text-slate-950">{sub.title}</p>
                          <p className="mt-2 text-sm leading-relaxed text-slate-700">{sub.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
