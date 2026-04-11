import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'Standards of conduct for the Investigator Events community.'
};

const sections = [
  {
    heading: 'Purpose',
    body: 'Investigator Events is a professional platform for the private investigations industry. These guidelines exist to maintain a respectful, productive, and legally compliant environment for all users. By using the Platform you agree to follow these guidelines alongside our Terms of Service.'
  },
  {
    heading: 'Professional conduct',
    body: null,
    subsections: [
      {
        title: 'Be professional',
        text: 'Treat all users with respect and courtesy. This is an industry platform, not social media. Communicate as you would at a professional conference. Disagreements are welcome; personal attacks are not.'
      },
      {
        title: 'Use your real identity',
        text: 'You must use your real name and accurate professional details. Impersonating another investigator, firm, or association is strictly prohibited and will result in immediate account termination. If you believe someone is impersonating you, report them immediately.'
      },
      {
        title: 'Respect confidentiality',
        text: 'Do not share confidential case details, client information, or sensitive operational methods. The investigations profession depends on discretion. Breaching confidentiality on this platform is a violation of these guidelines and may have legal consequences independent of any action we take.'
      }
    ]
  },
  {
    heading: 'Content standards',
    body: null,
    subsections: [
      {
        title: 'Accurate information',
        text: 'Do not post false, misleading, or deliberately inaccurate information. Do not misrepresent your qualifications, licensing status, association memberships, or professional experience. If you hold a Verified Association Badge, do not imply it constitutes an endorsement by Investigator Events.'
      },
      {
        title: 'Legal content only',
        text: 'All content must comply with applicable laws. Do not post content that promotes, facilitates, or instructs unlawful surveillance, unauthorised data access, harassment, or any illegal investigative method. Do not share pirated training materials, copyrighted content, or proprietary tools without authorisation.'
      },
      {
        title: 'No spam or self-promotion abuse',
        text: 'Relevant professional contributions are encouraged. Repetitive advertising, unsolicited sales pitches, affiliate link spam, and bulk messaging are not. If you want to promote your services, use the designated advertising channels or contact us about sponsored listings.'
      },
      {
        title: 'External links',
        text: 'You may share relevant external links (articles, event pages, training resources). You are responsible for ensuring linked content is legal, relevant, and appropriate. We may remove links to content that violates these guidelines or that we reasonably believe poses a risk to users.'
      }
    ]
  },
  {
    heading: 'Prohibited behaviour',
    body: 'The following will result in content removal, account suspension, or permanent ban:',
    list: [
      'Impersonating another person, firm, or association',
      'Harassment, bullying, threats, or intimidation of any user',
      'Discrimination based on race, gender, religion, nationality, disability, sexual orientation, or any protected characteristic',
      'Posting fraudulent or scam content, including fake job listings or fictitious referral requests',
      'Attempting to recruit users for unlawful activity',
      'Sharing another user\'s personal information without consent (doxxing)',
      'Creating multiple accounts to evade bans or restrictions',
      'Scraping or harvesting user data for any purpose',
      'Interfering with the operation of the Platform or its security measures',
      'Defaming or making unsubstantiated accusations against other professionals, firms, or associations'
    ]
  },
  {
    heading: 'Reporting',
    body: 'If you encounter content or behaviour that violates these guidelines, use the report button on the relevant profile, post, or message. You can also email reports directly to info@investigatorevents.com. All reports are reviewed. We do not disclose the identity of reporters to the reported user. False or malicious reporting is itself a violation of these guidelines.'
  },
  {
    heading: 'Moderation and enforcement',
    body: null,
    subsections: [
      {
        title: 'Our approach',
        text: 'We review reported content and take action proportionate to the violation. Minor first offences may receive a warning. Serious or repeated violations will result in account suspension or permanent removal. We act at our sole discretion and are not required to provide detailed reasons for moderation decisions.'
      },
      {
        title: 'What we do not moderate',
        text: 'We do not arbitrate professional disputes, assess the quality of investigative work, or adjudicate complaints about services provided between users. Those matters should be directed to the relevant professional association, regulatory body, or legal authority.'
      },
      {
        title: 'Appeals',
        text: 'If you believe moderation action was taken in error, contact info@investigatorevents.com with your account details and the basis for your appeal. We will review but are not obligated to reverse any decision.'
      }
    ]
  },
  {
    heading: 'Associations and the platform',
    body: 'Investigator Events complements professional associations — it does not replace them. We encourage all users to join and support relevant professional bodies. Criticising or undermining associations in bad faith is not in keeping with the spirit of this platform. Constructive, respectful discussion about industry standards and practices is welcome.'
  },
  {
    heading: 'Changes to these guidelines',
    body: 'We may update these guidelines as the platform evolves. Material changes will be communicated via the Platform. Continued use constitutes acceptance.'
  },
  {
    heading: 'Contact',
    body: 'Questions or concerns about these guidelines: info@investigatorevents.com.'
  }
];

export default function GuidelinesPage() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="container-shell relative space-y-8">
        <Reveal>
          <header className="overflow-hidden rounded-[1.5rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-5 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:rounded-[2.4rem] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_28%,rgba(255,255,255,0.1)_56%,rgba(255,255,255,0)_100%)]" />
            <div>
              <p className="eyebrow">Legal</p>
              <h1 className="section-title">Community Guidelines</h1>
              <p className="section-copy max-w-3xl">
                Standards of conduct for every user of Investigator Events. Last updated: April 2026.
              </p>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.05}>
          <article className="relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-5 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:rounded-[2rem] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_56%,rgba(255,255,255,0)_100%)]" />
            <div className="relative max-w-3xl space-y-10">
              {sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">{section.heading}</h2>
                  {section.body ? (
                    <p className="mt-3 text-sm leading-relaxed text-slate-700">{section.body}</p>
                  ) : null}
                  {'list' in section && section.list ? (
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
                      {(section.list as string[]).map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
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
