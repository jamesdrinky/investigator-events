import { Reveal } from '@/components/motion/reveal';
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="pointer-events-none absolute right-[8%] top-[12%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(111,86,255,0.1),transparent_72%)] blur-3xl" />
      <div className="container-shell relative space-y-8">
        <Reveal>
          <header className="overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-6 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0)_28%,rgba(255,255,255,0.1)_56%,rgba(255,255,255,0)_100%)]" />
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
              <div>
                <p className="eyebrow">Submit Event</p>
                <h1 className="section-title">List an investigator event for free.</h1>
                <p className="section-copy max-w-3xl">
                  Every submission is reviewed before it goes live. Most are checked within 48 hours.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Free listing</p>
                  <p className="mt-2 text-sm text-slate-700">Free to submit and free to browse.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-700">Reviewed</p>
                  <p className="mt-2 text-sm text-slate-700">Every listing is checked before it goes live.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.12)] transition duration-500 hover:-translate-y-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">Fast turnaround</p>
                  <p className="mt-2 text-sm text-slate-700">Most listings are reviewed within 48 hours.</p>
                </div>
              </div>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0)_30%,rgba(255,255,255,0.08)_56%,rgba(255,255,255,0)_100%)]" />
              <p className="text-xs uppercase tracking-[0.2em] text-blue-700">Submission form</p>
              <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">Event details</h2>

              {isSuccess ? (
                <p className="mt-4 rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Submission received. It has been added to the review queue.
                </p>
              ) : null}

              {isError ? (
                <p className="mt-4 rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  Submission failed. Please check the required fields and try again shortly.
                </p>
              ) : null}

              <form action={submitEventAction} className="relative mt-6 grid gap-4 sm:grid-cols-2">
                <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <input type="hidden" name="issuedAt" value={formState.issuedAt} />
                <input type="hidden" name="formToken" value={formState.token} />
                <label className="text-sm text-slate-700">
                  Event name
                  <input name="eventName" required maxLength={140} className="field-input" />
                </label>
                <label className="text-sm text-slate-700">
                  Organiser
                  <input name="organiser" required maxLength={140} className="field-input" />
                </label>
                <label className="text-sm text-slate-700">
                  City
                  <input name="city" required maxLength={120} className="field-input" />
                </label>
                <label className="text-sm text-slate-700">
                  Region
                  <select name="region" required defaultValue="" className="field-input">
                    <option value="" disabled>
                      Select region
                    </option>
                    {eventRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-700">
                  Country
                  <input
                    name="country"
                    list="submit-event-country-options"
                    required
                    autoComplete="country-name"
                    maxLength={120}
                    placeholder="Select or enter country"
                    className="field-input"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  Start date
                  <input type="date" name="startDate" required className="field-input" />
                </label>
                <label className="text-sm text-slate-700">
                  End date
                  <input type="date" name="endDate" className="field-input" />
                </label>
                <label className="text-sm text-slate-700">
                  Category
                  <select name="category" required defaultValue="" className="field-input">
                    <option value="" disabled>
                      Select category
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-slate-700">
                  Website
                  <input type="text" name="website" required inputMode="url" placeholder="example.com" className="field-input" />
                  <span className="mt-1 block text-xs text-slate-500">Use the public event page, with or without `https://`.</span>
                </label>
                <label className="text-sm text-slate-700">
                  Contact email
                  <input type="email" name="contactEmail" required maxLength={160} className="field-input" />
                </label>
                <label className="text-sm text-slate-700 sm:col-span-2">
                  Listing type
                  <select name="eventScope" defaultValue="main" className="field-input">
                    {scopes.map((scope) => (
                      <option key={scope.value} value={scope.value}>
                        {scope.label}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-slate-500">
                    Major Event is for flagship conferences and anchor meetings. Additional Listing is for training, webinars, and smaller approved gatherings.
                  </span>
                </label>
                <label className="text-sm text-slate-700 sm:col-span-2">
                  Notes for review
                  <textarea name="notes" rows={4} maxLength={2000} className="field-input" />
                </label>
                <div className="sm:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-xs leading-relaxed text-slate-500">
                    Submitted listings stay private until review is complete.
                  </p>
                  <button type="submit" className="btn-primary w-full px-5 py-2.5 sm:w-auto">
                    Submit for review
                  </button>
                </div>
              </form>
              <datalist id="submit-event-country-options">
                {eventCountries.map((country) => (
                  <option key={country} value={country} />
                ))}
              </datalist>
            </article>

            <article className="rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-700">FAQ</p>
              <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">Before you submit</h2>
              <div className="mt-6 space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/90 p-4 transition duration-300 hover:-translate-y-0.5">
                    <p className="text-sm font-semibold text-slate-950">{faq.question}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
