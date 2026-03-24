import { Reveal } from '@/components/motion/reveal';
import { submitEventAction } from '@/app/submit-event/actions';
import { eventCountries, eventRegions } from '@/lib/forms/event-form-options';

export const dynamic = 'force-dynamic';

const submissionSteps = [
  {
    title: 'Structured intake',
    text: 'Organisers submit event details in a consistent format so the global calendar remains credible and easy to compare.'
  },
  {
    title: 'Admin review',
    text: 'Each submission is checked before publication to protect quality, avoid duplicates, and reduce schedule clashes.'
  },
  {
    title: 'Global publication',
    text: 'Approved listings enter the live platform and become discoverable across regional and category filters.'
  }
];

const categories = ['Conference', 'Training', 'Association Meeting', 'Seminar', 'Expo', 'Summit'];
const scopes = [
  { value: 'main', label: 'Main event' },
  { value: 'secondary', label: 'Secondary event' }
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
      <div className="container-shell space-y-8">
        <Reveal>
          <header className="relative overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(52,179,255,0.1),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(41,211,163,0.08),transparent_20%),radial-gradient(circle_at_66%_76%,rgba(255,180,93,0.05),transparent_22%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-end">
              <div>
                <p className="eyebrow">Submission Desk</p>
                <h1 className="section-title">Submit an investigator event for calendar review</h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                  Add conferences, training events, and association gatherings to the review queue. Submissions stay
                  private until they are checked and approved by admin.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="country-chip">Association conferences</span>
                  <span className="country-chip">Training and seminars</span>
                  <span className="country-chip">Reviewed before publication</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {submissionSteps.map((step, index) => (
                  <article key={step.title} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-700">Step {index + 1}</p>
                    <h2 className="mt-2 text-base font-semibold text-slate-950">{step.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </header>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
            <article className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Submission guidance</p>
              <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">What belongs on the platform</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Prioritise investigator conferences, association meetings, training programmes, and professional gatherings
                with a public website and confirmed dates.
              </p>
              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Why the review step matters</p>
                <p className="mt-2 text-sm text-slate-700">
                  Review helps protect quality, reduce duplicates, and keep the wider calendar useful for organisers trying
                  to avoid date clashes.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-sky-700">Required for review</p>
                  <p className="mt-2 text-sm text-slate-700">Event name, organiser, city, country, dates, category, and website.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Recommended context</p>
                  <p className="mt-2 text-sm text-slate-700">Association name and any useful context help reviewers verify submissions faster.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-violet-700">Publication control</p>
                  <p className="mt-2 text-sm text-slate-700">Nothing goes live automatically. Admin approval is required before publication.</p>
                </div>
              </div>
            </article>

            <article className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(139,169,255,0.08),transparent_28%),radial-gradient(circle_at_84%_26%,rgba(183,138,255,0.06),transparent_22%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.2em] text-sky-700">Organiser form</p>
                <h2 className="mt-3 font-[var(--font-serif)] text-3xl text-slate-950">Event submission</h2>

                {isSuccess && (
                  <p className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                    Submission received. It has been added to the admin review queue.
                  </p>
                )}

                {isError && (
                  <p className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                    Submission failed. Confirm the Supabase review table is available, then try again.
                  </p>
                )}

                <form action={submitEventAction} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-slate-700">
                    Event name
                    <input
                      name="eventName"
                      required
                      className="field-input"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Organiser
                    <input
                      name="organiser"
                      required
                      className="field-input"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    City
                    <input
                      name="city"
                      required
                      className="field-input"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Region
                    <select
                      name="region"
                      required
                      defaultValue=""
                      className="field-input"
                    >
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
                    <input
                      type="date"
                      name="startDate"
                      required
                      className="field-input"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    End date
                    <input
                      type="date"
                      name="endDate"
                      className="field-input"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Category
                    <select
                      name="category"
                      required
                      defaultValue=""
                      className="field-input"
                    >
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
                    <input
                      type="text"
                      name="website"
                      required
                      inputMode="url"
                      placeholder="example.com"
                      className="field-input"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Contact email
                    <input
                      type="email"
                      name="contactEmail"
                      required
                      className="field-input"
                    />
                  </label>
                  <label className="text-sm text-slate-700">
                    Event scope
                    <select
                      name="eventScope"
                      defaultValue="main"
                      className="field-input"
                    >
                      {scopes.map((scope) => (
                        <option key={scope.value} value={scope.value}>
                          {scope.label}
                        </option>
                      ))}
                    </select>
                    <span className="mt-1 block text-xs text-slate-500">
                      Main events are major conferences and flagship meetings. Secondary events are webinars, training
                      sessions, and smaller member gatherings.
                    </span>
                  </label>
                  <label className="text-sm text-slate-700 sm:col-span-2">
                    Notes for review
                    <textarea
                      name="notes"
                      rows={4}
                      className="field-input"
                    />
                  </label>
                  <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="max-w-xl text-xs uppercase tracking-[0.14em] text-slate-500">
                      Submitted listings remain private until review is complete.
                    </p>
                    <button type="submit" className="btn-primary px-5 py-2.5">
                      Submit for Review
                    </button>
                  </div>
                </form>
                <datalist id="submit-event-country-options">
                  {eventCountries.map((country) => (
                    <option key={country} value={country} />
                  ))}
                </datalist>
              </div>
            </article>
          </section>
        </Reveal>
      </div>
    </section>
  );
}
