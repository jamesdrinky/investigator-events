import Image from 'next/image';
import Link from 'next/link';
import type { AssociationSummary } from '@/lib/utils/associations';
import { getCountryFlag } from '@/lib/utils/location';

interface HomeAssociationNetworkProps {
  associations: AssociationSummary[];
}

export function HomeAssociationNetwork({ associations }: HomeAssociationNetworkProps) {
  return (
    <section className="section-pad relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f6fbff_58%,#eefbf8_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(37,99,235,0.1),transparent_18%),radial-gradient(circle_at_86%_18%,rgba(6,182,212,0.08),transparent_18%),radial-gradient(circle_at_74%_84%,rgba(16,185,129,0.08),transparent_18%)]" />
      <div className="container-shell">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700">Associations</p>
            <h2 className="mt-3 font-[var(--font-serif)] text-3xl leading-tight text-slate-950 sm:text-4xl">
              Browse events by association
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              A practical index of active associations, their regions, and the events they currently have live.
            </p>
          </div>
          <Link href="/associations" className="btn-secondary px-5 py-2.5">
            View all associations
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {associations.map((association) => (
            <article
              key={association.name}
              className="group rounded-[1.6rem] border border-sky-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-5 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.14)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_34px_68px_-36px_rgba(37,99,235,0.2)]"
            >
              <div className="flex min-h-[5.25rem] items-center justify-center rounded-[1.1rem] border border-slate-200 bg-white px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                {association.logoSrc ? (
                  <Image
                    src={association.logoSrc}
                    alt={`${association.canonicalName} logo`}
                    width={160}
                    height={80}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">{association.shortName}</span>
                )}
              </div>
              <h3 className="mt-4 text-base font-semibold leading-tight text-slate-950">{association.canonicalName}</h3>
              <p className="mt-2 text-sm text-slate-600">{association.region}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {association.countries.slice(0, 2).map((country) => (
                  <span key={country} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-700">
                    <span>{getCountryFlag(country)}</span>
                    <span>{country}</span>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Live events</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{association.eventCount}</p>
                </div>
                <Link
                  href={`/calendar?association=${encodeURIComponent(association.calendarAssociation)}`}
                  className="inline-flex rounded-full bg-[linear-gradient(135deg,#2563eb,#06b6d4)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_-18px_rgba(37,99,235,0.48)] transition hover:-translate-y-0.5"
                >
                  View events
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
