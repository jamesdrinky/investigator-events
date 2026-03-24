import { Reveal } from '@/components/motion/reveal';
import { submitEventAction } from '@/app/submit-event/actions';
import { eventCountries, eventRegions } from '@/lib/forms/event-form-options';

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

  return (
    <section className="section-pad relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.08),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(20,184,255,0.08),transparent_20%)]" />
      <div className="container-shell relative space-y-8">
        <Reveal>
          <header className="overflow-hidden rounded-[2.4rem] border border-white/80 bg-[linear-gradient(135deg,#ffffff_0%,#eff6ff_54%,#f4fbff_100%)] p-6 shadow-[0_34px_84px_-52px_rgba(15,23,42,0.16)] sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
              <div>
                <p className="eyebrow">Submit Event</p>
                <h1 className="section-title">List an investigator event for free.</h1>
                <p className="section-copy max-w-3xl">
                  Submissions are reviewed before publishing. Most are checked within 48 hours, and promoted visibility is available later for major placements.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-700">Free listing</p>
                  <p className="mt-2 text-sm text-slate-700">No charge to submit or browse.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-700">Reviewed</p>
                  <p className="mt-2 text-sm text-slate-700">Every submission is checked before it goes live.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/90 bg-white/88 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-violet-700">Fast turnaround</p>
                  <p className="mt-2 text-sm text-slate-700">Most submissions reviewed within 48 hours.</p>
                </div>
              </div>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-700">Submission form</p>
              <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">Event details</h2>

              {isSuccess ? (
                <p className="mt-4 rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Submission received. It has been added to the review queue.
                </p>
              ) : null}

              {isError ? (
                <p className="mt-4 rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  Submission failed. Confirm the review table is available, then try again.
                </p>
              ) : null}

              <form action={submitEventAction} className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm text-slate-700">
                  Event name
                  <input name="eventName" required className="field-input" />
                </label>
                <label className="text-sm text-slate-700">
                  Organiser
                  <input name="organiser" required className="field-input" />
                </label>
                <label className="text-sm text-slate-700">
                  City
                  <input name="city" required className="field-input" />
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
                </label>
                <label className="text-sm text-slate-700">
                  Contact email
                  <input type="email" name="contactEmail" required className="field-input" />
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
                  <textarea name="notes" rows={4} className="field-input" />
                </label>
                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="max-w-xl text-xs uppercase tracking-[0.14em] text-slate-500">
                    Submitted listings stay private until review is complete.
                  </p>
                  <button type="submit" className="btn-primary px-5 py-2.5">
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

            <article className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_24px_54px_-36px_rgba(15,23,42,0.16)] sm:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-700">FAQ</p>
              <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">Before you submit</h2>
              <div className="mt-6 space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.question} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
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
