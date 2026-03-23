import { NewsletterSignupForm } from '@/components/newsletter-signup-form';

export function HomeNewsletterSection() {
  return (
    <section className="section-pad relative overflow-hidden pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%,rgba(255,255,255,0.015))]" />
      <div className="container-shell">
        <div className="global-panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 geo-grid opacity-[0.08]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(54,168,255,0.1),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(29,214,202,0.08),transparent_22%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <p className="eyebrow">Stay Informed</p>
              <h2 className="section-title">Subscribe for new event announcements, notable conference dates, and weekly market visibility</h2>
              <p className="section-copy max-w-xl">
                Subscriber capture is part of the long-term platform model. Join the list to receive updates as new
                investigator events are added and the weekly brief expands.
              </p>
            </div>
            <NewsletterSignupForm />
          </div>
        </div>
      </div>
    </section>
  );
}
