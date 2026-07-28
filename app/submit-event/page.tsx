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
    <section className="relative bg-slate-50">
      {/* ── Compact hero — flat (no blur/backdrop layers: they cause paint
             trails / ghosting in the Android WebView on scroll) ── */}
      <div className="bg-[linear-gradient(165deg,#eef2ff_0%,#f4f6ff_55%,#f8fafc_100%)] pb-5 pt-7 sm:pb-7 sm:pt-12">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
              Submit event
            </span>
            <h1 className="mt-3 text-[1.7rem] font-bold leading-[1] tracking-[-0.04em] text-slate-950 sm:text-[2.4rem]">
              List an investigator event for{' '}
              <span className="bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-clip-text text-transparent">free</span>.
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              Create a page for your event in under a minute — reviewed before it goes live.
            </p>
          </div>
        </div>
      </div>

      {/* ── Wizard — centered, focused (no Reveal transform layer) ── */}
      <div className="container-shell pb-28 pt-5 sm:pb-16 sm:pt-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-8 lg:p-10">
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

        {/* FAQ — below the form */}
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
      </div>
    </section>
  );
}
