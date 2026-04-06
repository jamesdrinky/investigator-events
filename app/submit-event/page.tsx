import { Reveal } from '@/components/motion/reveal';
import { SubmitFeatureCards } from '@/components/submit/submit-feature-cards';
import { SubmitEventForm } from '@/components/submit/submit-event-form';
import { submitEventAction } from '@/app/submit-event/actions';
import { eventCountries, eventRegions } from '@/lib/forms/event-form-options';
import { createSignedFormState } from '@/lib/security/server';

export const dynamic = 'force-dynamic';

const categories = ['Conference', 'Training', 'Association Meeting', 'Seminar', 'Expo', 'Summit'];
const scopes = [
  { value: 'main', label: 'Major Event' },
  { value: 'secondary', label: 'Additional Listing' }
];

const faqs = [
  {
    question: 'Is listing free?',
    answer: 'Yes. Event listings are free to submit and free to browse.'
  },
  {
    question: 'How long does review take?',
    answer: 'Most submissions are reviewed within 48 hours.'
  },
  {
    question: 'How do I update or remove a listing?',
    answer: 'Use the contact email included in your submission and the team can update or remove the listing after review.'
  },
  {
    question: 'What qualifies?',
    answer: 'Investigator conferences, training, association meetings, seminars, and related professional events with confirmed dates and a public website.'
  }
];

export default function SubmitEventPage({
  searchParams
}: {
  searchParams?: {
    status?: string;
  };
}) {
  const isSuccess = searchParams?.status === 'success';
  const isError = searchParams?.status === 'error';
  const formState = createSignedFormState('submit-event');

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.06),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.06),transparent_20%)]" />
      <div className="container-shell relative space-y-8">
        {/* Header */}
        <Reveal>
          <header className="overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-6 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
              <div>
                <p className="eyebrow">Submit Event</p>
                <h1 className="section-title">List an investigator event for free.</h1>
                <p className="section-copy max-w-3xl">
                  Create a page for your event in under a minute. Every submission is reviewed before it goes live.
                </p>
              </div>
              <SubmitFeatureCards />
            </div>
          </header>
        </Reveal>

        {/* Form section — lu.ma inspired layout */}
        <Reveal delay={0.05}>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.12)] sm:p-8 lg:p-10">
            <SubmitEventForm
              action={submitEventAction}
              issuedAt={formState.issuedAt}
              formToken={formState.token}
              categories={categories}
              scopes={scopes}
              regions={eventRegions}
              countries={eventCountries}
              isSuccess={isSuccess}
              isError={isError}
            />
          </div>
        </Reveal>

        {/* FAQ section */}
        <Reveal delay={0.08}>
          <div className="rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.12)] sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-700">FAQ</p>
            <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">Before you submit</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/90 p-4 transition duration-300 hover:-translate-y-0.5">
                  <p className="text-sm font-semibold text-slate-950">{faq.question}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
