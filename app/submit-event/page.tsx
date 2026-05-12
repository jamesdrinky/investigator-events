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
      {/* ── Hero — compact on mobile ── */}
      <div className="relative bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_30%,#f0e8ff_60%,#f8fbff_100%)] pb-5 pt-8 sm:pb-10 sm:pt-20 lg:pt-32">
        <div className="container-shell relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center sm:text-left sm:mx-0 sm:max-w-none">
              <p className="eyebrow">Submit Event</p>
              <h1 className="mt-3 text-[1.8rem] font-bold leading-[0.95] tracking-[-0.05em] text-slate-950 sm:mt-4 sm:text-[3rem] lg:text-[4rem]">
                List an investigator event for free.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4 sm:max-w-xl sm:text-base">
                Create a page for your event in under a minute. Every submission is reviewed before it goes live.
              </p>
              {/* Feature pills — inline on mobile */}
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start sm:mt-6">
                {[
                  { label: 'Free listing', color: 'text-blue-600 bg-blue-50 border-blue-100' },
                  { label: 'Reviewed', color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
                  { label: '48hr turnaround', color: 'text-violet-600 bg-violet-50 border-violet-100' },
                ].map((p) => (
                  <span key={p.label} className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px] ${p.color}`}>
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Form — clean single column on mobile ── */}
      <div className="container-shell relative -mt-2 pb-28 sm:pb-16">
        <Reveal delay={0.05}>
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/60 bg-white p-4 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] sm:rounded-[2rem] sm:p-8 lg:p-10">
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
          <div className="mx-auto mt-6 max-w-3xl sm:mt-8">
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
