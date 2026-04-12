import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Globe, Award, Users, ArrowRight, Handshake } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { associationRecords } from '@/lib/data/associations';
import { AssociationFinder } from '@/components/associations/AssociationFinder';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';

export const metadata: Metadata = {
  title: 'Why Join a Professional Association?',
  description: 'Association membership is how investigators prove they belong. Find the right association for your region and career.',
};

export const dynamic = 'force-dynamic';

export default async function WhyJoinPage() {
  const supabase = await createSupabaseSSRServerClient();
  const { data: pages } = await supabase.from('association_pages' as any).select('slug');
  const pageSlugs = new Set((pages ?? []).map((p: any) => p.slug));

  const finderAssociations = associationRecords.map((a) => ({
    slug: a.slug,
    shortName: a.shortName,
    name: a.name,
    country: a.country,
    region: a.region,
    website: a.website,
    logoSrc: a.logoFileName ? `/associations/${a.logoFileName}` : undefined,
    hasPage: pageSlugs.has(a.slug),
  }));

  return (
    <section className="relative overflow-hidden">
      {/* ═══ HERO — dark, immersive, conference photo ═══ */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#06091a_0%,#0a1228_35%,#0d1840_60%,#0a1228_100%)] pb-16 pt-24 sm:pb-24 sm:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-5%] top-[-10%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(ellipse,rgba(22,104,255,0.18),transparent_55%)]" />
          <div className="absolute right-[-5%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.12),transparent_55%)]" />
        </div>

        <div className="container-shell relative">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-blue-400/60">For Investigators</p>
              <h1 className="mt-4 text-[2.2rem] font-bold leading-[0.9] tracking-[-0.06em] text-white sm:text-[3.5rem] lg:text-[4.5rem]">
                Why join a professional association?
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/50 sm:mt-6 sm:text-lg">
                Investigator Events connects the profession. But connection alone is not enough. The profession needs standards, accountability, and trust. That is what associations provide — and no open platform, including this one, can replace it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#find" className="btn-glow !px-6 !py-3 !text-sm">
                  Find your association <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </a>
                <Link href="/associations" className="btn-outline-light !px-5 !py-2.5 !text-sm">
                  Browse all associations
                </Link>
              </div>
            </div>

            {/* Conference photo grid */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl">
                    <Image src="/conference/hugeconference.avif" alt="International conference" width={300} height={200} className="h-40 w-full object-cover" />
                  </div>
                  <div className="overflow-hidden rounded-2xl">
                    <Image src="/conference/conference2.jpg" alt="Conference networking" width={300} height={200} className="h-48 w-full object-cover" />
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="overflow-hidden rounded-2xl">
                    <Image src="/conference/seated.avif" alt="Conference audience" width={300} height={200} className="h-48 w-full object-cover" />
                  </div>
                  <div className="overflow-hidden rounded-2xl">
                    <Image src="/conference/conference3.jpg" alt="Conference" width={300} height={200} className="h-40 w-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { value: `${associationRecords.length}+`, label: 'Associations listed', color: 'from-blue-500/20 to-blue-600/10 border-blue-400/15 text-blue-300' },
              { value: '30+', label: 'Countries covered', color: 'from-violet-500/20 to-violet-600/10 border-violet-400/15 text-violet-300' },
              { value: '6', label: 'Regions worldwide', color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-400/15 text-cyan-300' },
              { value: '100+', label: 'Events per year', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/15 text-emerald-300' },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl border bg-gradient-to-br p-4 sm:p-5 ${s.color}`}>
                <p className="text-2xl font-bold sm:text-3xl">{s.value}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider opacity-60">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ THREE-TIER APPROACH — with conference photo ═══ */}
      <div className="relative overflow-hidden bg-white">
        <div className="container-shell py-16 sm:py-24">
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
              <div>
                <p className="eyebrow">The approach</p>
                <h2 className="section-title !mt-3">The three-tier approach</h2>
                <p className="section-copy">The most effective investigators maintain membership at three levels:</p>

                <div className="mt-8 space-y-4">
                  {[
                    { level: 'Local or state', desc: 'Immediate collaboration, local expertise, and referral relationships built through regular personal contact.', color: '#10b981', emoji: '📍' },
                    { level: 'National', desc: 'Credibility, advanced training, certification, and advocacy on legislation that affects every investigator.', color: '#3b82f6', emoji: '🏛️' },
                    { level: 'International', desc: 'Cross-border networks that make international investigations possible.', color: '#8b5cf6', emoji: '🌍' },
                  ].map((tier) => (
                    <div key={tier.level} className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                      <span className="mt-0.5 text-2xl">{tier.emoji}</span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 sm:text-base">{tier.level}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{tier.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photo */}
              <div className="hidden overflow-hidden rounded-[2rem] lg:block">
                <Image src="/conference/hugeconference.avif" alt="International investigators conference" width={600} height={500} className="h-[28rem] w-full object-cover" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══ KEY REASONS — alternating with photos ═══ */}
      <div className="border-t border-slate-200/40 bg-[linear-gradient(180deg,#f8fbff,#ffffff)]">
        <div className="container-shell py-16 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">The case for membership</p>
              <h2 className="section-title !mt-3">Why it matters</h2>
            </div>
          </Reveal>

          <div className="mx-auto mt-12 max-w-5xl space-y-16">
            {/* Credibility */}
            <Reveal>
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
                <div className="overflow-hidden rounded-[1.5rem]">
                  <Image src="/conference/handshake.avif" alt="Professional credibility" width={500} height={350} className="h-64 w-full object-cover lg:h-72" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl">Credibility</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-relaxed">
                    Anyone can call themselves an investigator. Association membership is the primary way clients distinguish qualified professionals from unqualified operators. Recognised bodies require verified credentials, professional insurance, adherence to a code of ethics, and peer references.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Referral networks */}
            <Reveal>
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
                <div className="order-2 lg:order-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-violet-600" />
                    <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl">Trusted referral networks</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-relaxed">
                    No investigator can be an expert in every jurisdiction. Associations like WAD, CII, and IKD maintain networks of vetted professionals across dozens of countries. When you need a reliable partner in an unfamiliar jurisdiction, your association network is the difference between success and failure.
                  </p>
                </div>
                <div className="order-1 overflow-hidden rounded-[1.5rem] lg:order-2">
                  <Image src="/conference/darkglobe.avif" alt="Global network" width={500} height={350} className="h-64 w-full object-cover lg:h-72" />
                </div>
              </div>
            </Reveal>

            {/* Conferences */}
            <Reveal>
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
                <div className="overflow-hidden rounded-[1.5rem]">
                  <Image src="/conference/seated.avif" alt="Conference audience" width={500} height={350} className="h-64 w-full object-cover lg:h-72" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-emerald-600" />
                    <h3 className="text-xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl">Conferences still matter</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-relaxed">
                    Trust is the currency of this profession. Face-to-face interaction enables assessment of character and professionalism in ways digital communication cannot. Conferences produce serendipity — the casual conversation that leads to exactly the contact you need.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ═══ INVESTMENT, NOT COST ═══ */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#06091a_0%,#0a1228_35%,#0d1840_60%,#0a1228_100%)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-5%] bottom-[-10%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(ellipse,rgba(16,185,129,0.12),transparent_55%)]" />
        </div>
        <div className="container-shell relative py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-emerald-400/60">The bottom line</p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">Investment, not cost</h2>
            <p className="mt-5 text-base leading-relaxed text-white/50 sm:text-lg">
              A single significant case referred by an association contact can pay for years of membership. The credibility of recognised membership helps win clients. And when you can vet local partners through association contacts rather than taking a chance on an unknown operator, you avoid the kind of failure that can cost a case or a career.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ HOW IE SUPPORTS ASSOCIATIONS ═══ */}
      <div className="bg-white">
        <div className="container-shell py-16 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl">
              <div className="rounded-[1.5rem] border border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 via-white to-blue-50/30 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                    <Handshake className="h-6 w-6 text-emerald-700" />
                  </div>
                  <h2 className="text-lg font-bold tracking-[-0.03em] text-slate-950 sm:text-xl">How Investigator Events supports associations</h2>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base sm:leading-relaxed">
                  Investigator Events is not an association. We do not vet members, set standards, or offer accreditation. We are the industry's open platform. We believe every serious investigator should belong to at least one recognised association — which is why verified association members display a badge on their profile here, and why every partner association has a dedicated page with events and a direct link to join.
                </p>
                <p className="mt-3 text-sm font-semibold text-emerald-700">
                  We connect the profession. Associations elevate it.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ═══ FIND YOUR ASSOCIATION ═══ */}
      <div id="find" className="relative overflow-hidden border-t border-slate-200/40 bg-[linear-gradient(165deg,#f0f4ff_0%,#f8fbff_50%,#ffffff_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(22,104,255,0.06),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(139,92,246,0.04),transparent_20%)]" />
        <div className="container-shell relative py-16 sm:py-24">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">Find yours</p>
              <h2 className="section-title !mt-3">Find an association near you</h2>
              <p className="section-copy mx-auto max-w-xl">Search by country or region. International associations are open to investigators worldwide.</p>
            </div>
          </Reveal>
          <div className="mt-10">
            <AssociationFinder associations={finderAssociations} />
          </div>
        </div>
      </div>

      {/* ═══ CTAs ═══ */}
      <div className="border-t border-slate-200/80 bg-white">
        <div className="container-shell py-16 sm:py-20">
          <Reveal>
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-4">
              <Link href="/associations" className="btn-primary !px-6 !py-3.5 !text-sm">
                Browse Associations <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
              <Link href="/profile/edit" className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
                <ShieldCheck className="h-4 w-4" /> Claim Your Badge
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
