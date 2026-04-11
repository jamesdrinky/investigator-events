import type { Metadata } from 'next';
import { Reveal } from '@/components/motion/reveal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Investigator Events. Please read before using the platform.'
};

const sections = [
  {
    heading: '1. About these terms',
    body: 'These Terms of Service ("Terms") govern your use of investigatorevents.com ("the Platform"), operated by Conflict International ("we", "us", "our"). By creating an account or using the Platform you agree to be bound by these Terms, our Privacy Policy, and our Community Guidelines. If you do not agree, do not use the Platform.'
  },
  {
    heading: '2. What the Platform is',
    body: 'Investigator Events is a global events calendar and professional directory for the private investigations industry. We provide a space for users to discover events, connect with other professionals, and engage in industry discussions. We are not a professional association, regulatory body, or licensing authority. We do not vet, credential, certify, or endorse any user of the Platform.'
  },
  {
    heading: '3. Eligibility',
    body: 'You must be at least 18 years old to create an account. By registering you represent that the information you provide is accurate and that you are authorised to use the email address and identity you register with.'
  },
  {
    heading: '4. User accounts and identity',
    body: null,
    subsections: [
      {
        title: 'Accuracy',
        text: 'You must use your real name and accurate professional information on your profile. You may not impersonate any other person or entity, or falsely claim a professional affiliation, qualification, or association membership you do not hold.'
      },
      {
        title: 'Account security',
        text: 'You are responsible for maintaining the security of your account credentials. You must notify us immediately at info@investigatorevents.com if you believe your account has been compromised.'
      },
      {
        title: 'One account per person',
        text: 'Each individual may maintain only one account. Creating multiple accounts to evade restrictions or misrepresent your identity is prohibited and grounds for permanent removal.'
      }
    ]
  },
  {
    heading: '5. Verified Association Badges',
    body: null,
    subsections: [
      {
        title: 'What badges mean',
        text: 'Verified Association Member badges indicate that a professional association has confirmed the user as a current member. Badges are granted exclusively through our association partnerships and are controlled by the relevant association. We do not sell badges to individuals.'
      },
      {
        title: 'What badges do not mean',
        text: 'A verified badge confirms association membership only. It is not an endorsement by Investigator Events of the user\'s competence, integrity, or suitability for any particular engagement. The absence of a badge does not indicate that a user is unqualified or untrustworthy.'
      },
      {
        title: 'Badge accuracy',
        text: 'We rely on information provided by partner associations to issue and revoke badges. While we make reasonable efforts to keep badge status current, we do not independently verify the standing of individual members and accept no liability for inaccurate or outdated badge status.'
      }
    ]
  },
  {
    heading: '6. User content and conduct',
    body: null,
    subsections: [
      {
        title: 'Your content',
        text: 'You retain ownership of content you post on the Platform. By posting, you grant us a non-exclusive, worldwide, royalty-free licence to display, distribute, and store that content in connection with operating the Platform. You are solely responsible for the content you post and must ensure it does not violate any law or third-party right.'
      },
      {
        title: 'Prohibited conduct',
        text: 'You must not: impersonate another person or entity; post false, misleading, or fraudulent information; harass, threaten, or abuse other users; post content that infringes intellectual property rights; use the Platform to conduct unlawful surveillance or investigation; solicit or facilitate any illegal activity; scrape, harvest, or collect user data without consent; attempt to circumvent any security or moderation measures.'
      },
      {
        title: 'Referrals and assistance requests',
        text: 'The Platform allows users to post public requests for professional assistance or referrals. These are open forum posts. We do not operate a private matching service, do not vet respondents, and accept no responsibility for the outcome of any engagement arising from connections made on the Platform. Users engage with one another at their own risk and should conduct their own due diligence.'
      }
    ]
  },
  {
    heading: '7. Disclaimer of liability',
    body: null,
    subsections: [
      {
        title: 'No vetting of users',
        text: 'We do not verify the identity, qualifications, licensing status, insurance coverage, or professional standing of any user. Profile information is self-reported. You should independently verify the credentials and suitability of any professional you engage through the Platform.'
      },
      {
        title: 'No liability for user conduct',
        text: 'We are not liable for any loss, damage, or harm arising from interactions between users, including but not limited to: fraud, misrepresentation, professional negligence, or any other conduct by a user of the Platform. We provide the Platform as a communication tool only and are not a party to any agreement or engagement between users.'
      },
      {
        title: 'No professional advice',
        text: 'Content on the Platform, including forum posts, articles, and event descriptions, is for general informational purposes only and does not constitute legal, professional, or business advice. You should seek independent professional advice before acting on any information found on the Platform.'
      },
      {
        title: 'Third-party content and links',
        text: 'The Platform may contain links to third-party websites, event pages, and external content. We do not control and accept no responsibility for the content, accuracy, or availability of external sites. Inclusion of a link does not imply endorsement.'
      },
      {
        title: 'Service availability',
        text: 'The Platform is provided on an "as is" and "as available" basis. We do not guarantee that the Platform will be uninterrupted, error-free, or secure. We reserve the right to modify, suspend, or discontinue the Platform at any time without notice.'
      }
    ]
  },
  {
    heading: '8. Indemnification',
    body: 'You agree to indemnify and hold harmless Conflict International, its directors, employees, and agents from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from your use of the Platform, your content, your violation of these Terms, or your violation of any third-party right.'
  },
  {
    heading: '9. Reporting and moderation',
    body: 'We provide tools for users to report content and profiles that violate these Terms or our Community Guidelines. We review reports and may take action including content removal, account suspension, or permanent ban at our sole discretion. We are under no obligation to monitor all content but reserve the right to do so. Reporting a user or content does not guarantee any specific outcome.'
  },
  {
    heading: '10. Account termination',
    body: 'We may suspend or permanently terminate your account at any time, with or without notice, for any reason, including but not limited to: violation of these Terms, violation of the Community Guidelines, impersonation, fraudulent activity, or conduct that we reasonably believe is harmful to other users or to the Platform. You may delete your account at any time by contacting info@investigatorevents.com.'
  },
  {
    heading: '11. Limitation of liability',
    body: 'To the maximum extent permitted by law, Conflict International shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or business opportunities arising from your use of the Platform. Our total liability for any claim arising under these Terms shall not exceed the amount you have paid us in the 12 months preceding the claim, or GBP 100, whichever is greater.'
  },
  {
    heading: '12. Intellectual property',
    body: 'The Platform, its design, branding, and original content are owned by Conflict International and protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from Platform content without our written permission. User-submitted content remains the property of the respective user, subject to the licence granted in section 6.'
  },
  {
    heading: '13. Governing law',
    body: 'These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the courts of England and Wales.'
  },
  {
    heading: '14. Changes to these terms',
    body: 'We may update these Terms from time to time. Material changes will be notified by email or prominent notice on the Platform. Continued use of the Platform after changes are posted constitutes acceptance of the updated Terms. If you do not agree with updated Terms, you should stop using the Platform and delete your account.'
  },
  {
    heading: '15. Contact',
    body: 'For questions about these Terms, contact us at info@investigatorevents.com.'
  }
];

export default function TermsPage() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="container-shell relative space-y-8">
        <Reveal>
          <header className="overflow-hidden rounded-[1.5rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-5 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:rounded-[2.4rem] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_28%,rgba(255,255,255,0.1)_56%,rgba(255,255,255,0)_100%)]" />
            <div>
              <p className="eyebrow">Legal</p>
              <h1 className="section-title">Terms of Service</h1>
              <p className="section-copy max-w-3xl">
                Last updated: April 2026. Please read these terms carefully before using Investigator Events.
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
