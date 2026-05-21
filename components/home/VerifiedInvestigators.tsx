import Image from 'next/image';
import Link from 'next/link';

export interface VerifiedMember {
  id: string;
  fullName: string;
  username: string | null;
  avatarUrl: string | null;
  country: string | null;
  headline: string | null;
}

interface VerifiedInvestigatorsProps {
  members: VerifiedMember[];
  totalCount: number;
  countriesCount: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function VerifiedInvestigators({ members, totalCount, countriesCount }: VerifiedInvestigatorsProps) {
  if (members.length === 0) return null;

  return (
    <section className="relative bg-white py-12 sm:py-20">
      <div className="container-shell">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">LinkedIn-verified</span>
            </div>
            <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Real investigators. Verified profiles.
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600 sm:text-base">
              <strong className="text-slate-900">{totalCount}+ investigators</strong> from <strong className="text-slate-900">{countriesCount} countries</strong> already on Investigator Events — most verified through LinkedIn.
            </p>
          </div>
          <Link
            href="/directory"
            className="hidden whitespace-nowrap text-sm font-semibold text-blue-600 transition hover:text-blue-700 sm:inline-flex sm:items-center sm:gap-1"
          >
            Browse the directory <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4">
          {members.slice(0, 4).map((member) => (
            <Link
              key={member.id}
              href={member.username ? `/profile/${member.username}` : '/directory'}
              className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
            >
              <div className="relative inline-block">
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.fullName}
                    width={64}
                    height={64}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-white sm:h-16 sm:w-16"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-base font-bold text-white ring-2 ring-white sm:h-16 sm:w-16">
                    {initials(member.fullName)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#0a66c2] text-white ring-2 ring-white" aria-label="LinkedIn verified">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3v9zM6.5 8.25A1.75 1.75 0 118.3 6.5 1.78 1.78 0 016.5 8.25zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" /></svg>
                </span>
              </div>
              <p className="mt-3 line-clamp-1 text-sm font-bold text-slate-900 sm:text-base">{member.fullName}</p>
              {/* Country always shown — falls back to a neutral chip when missing so layout stays consistent. */}
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                {member.country ? <>📍 {member.country}</> : <>📍 International</>}
              </p>
              {member.headline && (
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-500 sm:text-xs">{member.headline}</p>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-7 sm:hidden">
          <Link
            href="/directory"
            className="block w-full rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
          >
            Browse the full directory →
          </Link>
        </div>
      </div>
    </section>
  );
}
