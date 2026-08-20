import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import PressCopyBlock from '@/components/PressCopyBlock';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Press & Media',
  description:
    'Press kit for Investigator Events — boilerplate, fact sheet, brand assets, product images, quotes, and media contact for journalists and partners.',
};

const KIT_UPDATED = 'August 2026';

const BOILERPLATE_SHORT =
  'Investigator Events is the global events calendar for the professional investigations industry — bringing conferences, training, and association gatherings from more than 50 associations into one free platform. Investigators browse 75+ events across 20+ countries, connect with peers, and plan the season with a weekly briefing and a companion iOS app.';

const BOILERPLATE_ONE_LINER =
  'Investigator Events is the global calendar for the professional investigations industry.';

const AT_A_GLANCE = [
  { label: 'What', value: 'Global events calendar for professional investigators' },
  { label: 'Founder', value: 'Mike LaCorte (CEO, Conflict International)' },
  { label: 'Platform', value: 'Web + iOS app' },
  { label: 'Cost', value: 'Free for investigators and associations' },
  { label: 'Media contact', value: 'info@investigatorevents.com' },
];

const FACTS = [
  { value: '160+', label: 'Investigator profiles', accent: 'from-blue-600 to-cyan-500' },
  { value: '25', label: 'Countries represented', accent: 'from-violet-600 to-purple-400' },
  { value: '75+', label: 'Events listed', accent: 'from-cyan-600 to-teal-400' },
  { value: '55', label: 'Association pages', accent: 'from-blue-700 to-indigo-500' },
  { value: '30+', label: 'Upcoming events', accent: 'from-fuchsia-600 to-pink-400' },
  { value: '~200', label: 'Weekly briefing readers', accent: 'from-indigo-600 to-blue-400' },
];

const QUOTES = [
  {
    text: 'It is a community before it is an industry.',
    context: 'On the investigations profession',
  },
  {
    text: 'The problem was never a shortage of conferences, training, or association gatherings. The problem was that nobody could see the full picture.',
    context: 'On why Investigator Events exists',
  },
  {
    text: 'Conferences are where investigators meet the person they will trust with a referral three years later.',
    context: 'On why events matter',
  },
];

const INTERVIEW_TOPICS = [
  'The global investigations events circuit',
  'Why associations matter to investigators',
  'Cross-border investigations',
  'Conference culture in the PI profession',
  'Building community in a discreet industry',
];

const ASSETS = [
  {
    file: '/press/ie-logo-full.png',
    name: 'Primary mark',
    desc: 'Full resolution, on white. Default for articles and light backgrounds.',
    dark: false,
  },
  {
    file: '/press/ie-mark-transparent-512.png',
    name: 'Transparent mark',
    desc: 'Transparent PNG for photography or dark surfaces.',
    dark: true,
  },
  {
    file: '/press/ie-app-icon-1024.png',
    name: 'App icon — 1024px',
    desc: 'For app-store coverage, thumbnails, and social avatars.',
    dark: false,
  },
];

const PRODUCT_IMAGES = [
  {
    file: '/press/product-calendar-hero.png',
    name: 'The live calendar',
    desc: 'The global events calendar — the heart of the platform.',
  },
  {
    file: '/press/product-event-cards.png',
    name: 'Event listings',
    desc: 'Conference listings with dates, locations, and organisers.',
  },
];

const NAV = [
  { href: '#boilerplate', label: 'Boilerplate' },
  { href: '#facts', label: 'Fact sheet' },
  { href: '#assets', label: 'Logos' },
  { href: '#screens', label: 'Screenshots' },
  { href: '#quotes', label: 'Quotes' },
  { href: '#spokesperson', label: 'Spokesperson' },
  { href: '#contact', label: 'Contact' },
];

function DownloadIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v7.6l2.3-2.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L9 11.6V4a1 1 0 011-1zM4 16a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
    </svg>
  );
}

export default function PressPage() {
  return (
    <div className="relative">
      {/* ── Hero ── */}
      <section className="relative flex min-h-[48vh] items-end overflow-hidden bg-slate-950 sm:min-h-[56vh]">
        <Image
          src="/conference/conference4.avif"
          alt="Investigators gathered at an industry conference"
          fill
          className="object-cover opacity-50"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        <div aria-hidden className="pointer-events-none absolute -bottom-16 left-1/4 h-64 w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.30),transparent_70%)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 right-1/4 h-64 w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.20),transparent_70%)] blur-3xl" />

        <div className="container-shell relative z-10 pb-12 pt-28 sm:pb-14">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md sm:tracking-[0.28em]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_0_3px_rgba(59,130,246,0.25)] animate-pulse" />
              Press &amp; Media
            </span>
            <h1 className="mt-4 max-w-3xl text-[2.2rem] font-bold leading-[0.95] tracking-[-0.05em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:text-[3.2rem] lg:text-[4rem]">
              Covering the{' '}
              <span
                className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
              >
                investigations
              </span>{' '}
              industry? Everything&apos;s here.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Copy-ready boilerplate, verified numbers, logos, screenshots, quotes — and a direct line to the team.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="/press/ie-press-kit.zip"
                download
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-blue-50"
              >
                Download the full kit
                <DownloadIcon />
              </a>
              <a
                href="mailto:info@investigatorevents.com?subject=Media%20enquiry"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/[0.12]"
              >
                Contact the team
              </a>
              <span className="text-xs font-medium text-slate-400">.zip · logos, screenshots, headshot, fact sheet · updated {KIT_UPDATED}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Sticky section nav ── */}
      {/* Pinned just below the site header (fixed, ~76px + safe-area inset) */}
      <nav className="sticky z-30 border-b border-slate-200/60 bg-white/85 backdrop-blur-md" style={{ top: 'calc(76px + var(--safe-top, 0px))' }}>
        <div className="container-shell flex items-center gap-1 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {n.label}
            </a>
          ))}
          <a
            href="/press/ie-press-kit.zip"
            download
            className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full bg-slate-950 px-3.5 py-1.5 text-[12px] font-bold text-white transition hover:bg-slate-800 sm:inline-flex"
          >
            Full kit <DownloadIcon className="h-3 w-3" />
          </a>
        </div>
      </nav>

      {/* ── Boilerplate + at a glance ── */}
      <section id="boilerplate" className="scroll-mt-36 border-b border-slate-200/60 bg-slate-50">
        <div className="container-shell py-14 sm:py-20">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">01 · Boilerplate</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">Copy that&apos;s ready to lift.</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
              Use either version verbatim in articles, event programmes, and partner announcements — no approval needed.
            </p>
            <div className="mt-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-5">
                <PressCopyBlock label="About Investigator Events" text={BOILERPLATE_SHORT} />
                <PressCopyBlock label="One-liner" text={BOILERPLATE_ONE_LINER} />
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-500">At a glance</p>
                <dl className="mt-4 space-y-4">
                  {AT_A_GLANCE.map((row) => (
                    <div key={row.label} className="border-b border-slate-100 pb-3.5 last:border-0 last:pb-0">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{row.label}</dt>
                      <dd className="mt-1 text-[13.5px] font-medium leading-snug text-slate-800">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Fact sheet ── */}
      <section id="facts" className="scroll-mt-36 border-b border-slate-200/60 bg-white">
        <div className="container-shell py-14 sm:py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">02 · Fact sheet</p>
                <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">The numbers, verified.</h2>
              </div>
              <p className="text-xs font-medium text-slate-400">As of {KIT_UPDATED} · updated monthly</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {FACTS.map((f) => (
                <div
                  key={f.label}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div aria-hidden className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${f.accent}`} />
                  <p className="mt-1 bg-gradient-to-br from-slate-950 to-slate-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-[2rem]">
                    {f.value}
                  </p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{f.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-xs leading-relaxed text-slate-400">
                Figures are drawn directly from the live platform. For exact current numbers or historical growth figures, email{' '}
                <a href="mailto:info@investigatorevents.com" className="font-semibold text-blue-600 hover:underline">info@investigatorevents.com</a>.
              </p>
              <div className="flex gap-2">
                <a
                  href="/press/ie-fact-sheet.txt"
                  download
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-[11px] font-bold text-slate-600 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-200/70"
                >
                  Fact sheet (.txt) <DownloadIcon className="h-3 w-3" />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Brand assets ── */}
      <section id="assets" className="scroll-mt-36 border-b border-slate-200/60 bg-slate-50">
        <div className="container-shell py-14 sm:py-20">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">03 · Logos</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">The mark, ready to place.</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {ASSETS.map((a) => (
                <div key={a.file} className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className={`flex h-44 items-center justify-center ${a.dark ? 'bg-slate-950' : 'bg-white'} border-b border-slate-200/60`}>
                    <Image src={a.file} alt={a.name} width={112} height={112} className="h-28 w-28 object-contain transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900">{a.name}</p>
                      <a
                        href={a.file}
                        download
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 ring-1 ring-inset ring-blue-100 transition hover:bg-blue-100"
                      >
                        PNG <DownloadIcon className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200/60 bg-white p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Usage guidelines</p>
              <div className="mt-3 grid gap-2 text-[13px] leading-relaxed text-slate-600 sm:grid-cols-3">
                <p>· Keep clear space around the mark of at least half its width.</p>
                <p>· Don&apos;t recolour, stretch, rotate, or add effects to the mark.</p>
                <p>· Write the name in full as &ldquo;Investigator Events&rdquo; on first mention.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Product images ── */}
      <section id="screens" className="scroll-mt-36 border-b border-slate-200/60 bg-white">
        <div className="container-shell py-14 sm:py-20">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">04 · Screenshots</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl">Screens, ready to run.</h2>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {PRODUCT_IMAGES.map((p) => (
                <div key={p.file} className="group">
                  {/* Browser-chrome frame so the shots read as product, not decoration */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    <div className="flex items-center gap-1.5 border-b border-slate-200/70 bg-slate-100 px-4 py-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-[10px] font-medium text-slate-400">investigatorevents.com</span>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.file} alt={p.name} className="w-full" />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 px-1">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{p.desc}</p>
                    </div>
                    <a
                      href={p.file}
                      download
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 ring-1 ring-inset ring-blue-100 transition hover:bg-blue-100"
                    >
                      PNG <DownloadIcon className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Quotable ── */}
      <section id="quotes" className="scroll-mt-36 border-b border-slate-200/60 bg-slate-50">
        <div className="container-shell py-14 sm:py-20">
          <Reveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">05 · Quotes</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">Quotable, pre-approved.</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
              From founder Mike LaCorte. Attribute as <span className="font-semibold text-slate-800">&ldquo;Mike LaCorte, founder of Investigator Events&rdquo;</span> — use freely.
            </p>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {QUOTES.map((q) => (
                <div key={q.text} className="flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <div>
                    <span aria-hidden className="block bg-gradient-to-br from-blue-600 to-purple-500 bg-clip-text font-serif text-5xl leading-none text-transparent">&ldquo;</span>
                    <p className="mt-1 text-[15px] font-medium leading-relaxed text-slate-800">{q.text}</p>
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{q.context}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Founder / spokesperson ── */}
      <section id="spokesperson" className="relative scroll-mt-36 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-15">
          <Image src="/conference/conference7.avif" alt="" fill className="object-cover object-[center_45%]" sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/80" />
        <div className="container-shell relative z-10 py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_18rem] lg:gap-16">
            <div>
              <Reveal>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400 sm:text-xs">06 · Spokesperson</p>
                <h2 className="mt-3 text-[1.8rem] font-bold leading-tight tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl">
                  Available for comment.
                </h2>
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white">Mike LaCorte</h3>
                  <p className="mt-1 text-sm text-slate-400">CEO, Conflict International &middot; Founder, Investigator Events</p>
                </div>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-300">
                  Mike has spent 25+ years in international investigations, including senior roles as President of the Association of British
                  Investigators, Secretary General of the IKD, and President and Chairman roles within the World Association of Detectives.
                  He speaks regularly on the profession, its associations, and its events.
                </p>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Talks about</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INTERVIEW_TOPICS.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-slate-200 backdrop-blur-sm">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="/press/mike-lacorte-headshot.png"
                    download
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/[0.12]"
                  >
                    Download headshot <DownloadIcon className="h-3 w-3" />
                  </a>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-slate-300 transition hover:text-white"
                  >
                    Full story on the About page →
                  </Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <div className="mx-auto max-w-[16rem] lg:mx-0">
                <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_60px_-16px_rgba(0,0,0,0.5)]">
                  <Image src="/faces/mike2.png" alt="Mike LaCorte" width={300} height={360} className="h-auto w-full object-cover" />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Media contact ── */}
      <section id="contact" className="scroll-mt-36 bg-white">
        <div className="container-shell py-16 sm:py-20">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-center sm:px-12 sm:py-16">
              <div aria-hidden className="pointer-events-none absolute -top-16 left-1/3 h-56 w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.25),transparent_70%)] blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-16 right-1/4 h-56 w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_70%)] blur-3xl" />
              <div className="relative z-10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-400 sm:text-xs">07 · Media contact</p>
                <h2 className="mx-auto mt-3 max-w-xl text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
                  On deadline? We&apos;re quick.
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
                  Interviews, background, images, or comment on the investigations events industry — one email reaches the team.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="mailto:info@investigatorevents.com?subject=Media%20enquiry"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-blue-50"
                  >
                    info@investigatorevents.com
                  </a>
                  <a
                    href="/press/ie-press-kit.zip"
                    download
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/[0.12]"
                  >
                    Download the full kit <DownloadIcon />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
