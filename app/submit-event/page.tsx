import { Reveal } from '@/components/motion/reveal';
import { SubmitEventForm } from '@/components/submit/submit-event-form';
import { submitEventAction } from '@/app/submit-event/actions';
import { eventCountries, eventRegions } from '@/lib/forms/event-form-options';
import { createSignedFormState } from '@/lib/security/server';
import { associationRecords } from '@/lib/data/associations';

export const dynamic = 'force-dynamic';

const categories = ['Conference', 'Training', 'Association Meeting', 'Seminar', 'Expo', 'Summit'];
const associationShortNames = associationRecords.map((r) => r.shortName).sort();
const scopes = [
  { value: 'main', label: 'Major Event' },
  { value: 'secondary', label: 'Additional Listing' }
];

const faqs = [
  { question: 'Is listing free?', answer: 'Yes. Event listings are free to submit and free to browse.' },
  { question: 'How long does review take?', answer: 'Most submissions are reviewed within 48 hours.' },
  { question: 'How do I update or remove a listing?', answer: 'Use the contact email included in your submission and the team can update or remove the listing after review.' },
  { question: 'What qualifies?', answer: 'Investigator conferences, training, association meetings, seminars, and related professional events with confirmed dates and a public website.' },
];

export default function SubmitEventPage({
  searchParams
}: {
  searchParams?: { status?: string };
}) {
  const isSuccess = searchParams?.status === 'success';
  const isError = searchParams?.status === 'error';
  const formState = createSignedFormState('submit-event');

  return (
    <section className="relative overflow-hidden bg-slate-50/80">
      {/* ── Compact hero — keeps the SEO H1, no longer eats the screen ── */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f0f4ff_0%,#eef2ff_45%,#f8fbff_100%)] pb-5 pt-7 sm:pb-7 sm:pt-12">
        <div aria-hidden className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),transparent_65%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -top-8 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_65%)] blur-3xl" />
        <div className="container-shell relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600 backdrop-blur-sm">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.2)] animate-pulse" />
                Submit event
              </span>
              <h1 className="mt-3 text-[1.7rem] font-bold leading-[1] tracking-[-0.04em] text-slate-950 sm:text-[2.4rem]">
                List an investigator event for{' '}
                <span
                  className="bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                  style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
                >
                  free
                </span>
                .
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                Create a page for your event in under a minute — reviewed before it goes live.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Wizard — centered, focused ── */}
      <div className="container-shell relative pb-28 pt-5 sm:pb-16 sm:pt-6">
        <Reveal delay={0.05}>
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/60 bg-white p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] sm:rounded-[2rem] sm:p-8 lg:p-10">
            <SubmitEventForm
              action={submitEventAction}
              issuedAt={formState.issuedAt}
              formToken={formState.token}
              categories={categories}
              scopes={scopes}
              regions={eventRegions}
              countries={eventCountries}
              associations={associationShortNames}
              isSuccess={isSuccess}
              isError={isError}
            />
          </div>
        </Reveal>

        {/* FAQ — below the form */}
        <Reveal delay={0.08}>
          <div className="mx-auto mt-6 max-w-2xl sm:mt-8">
            <h2 className="text-lg font-bold text-slate-950 sm:text-xl">Before you submit</h2>
            <div className="mt-4 space-y-2">
              {faqs.map((faq) => (
                <details key={faq.question} className="group rounded-xl border border-slate-200/60 bg-white">
                  <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-950 transition hover:text-blue-600">
                    {faq.question}
                  </summary>
                  <p className="px-4 pb-3 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
