'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Mail, CalendarDays, Star, Globe, Shield, Zap, ArrowRight } from 'lucide-react';
import { NewsletterSignupForm } from '@/components/newsletter-signup-form';

const EMAIL_PREVIEW_ITEMS = [
  { icon: '🏛️', title: '2026 Intellenet Conference', meta: 'Philadelphia, PA · 12–16 Apr', tag: 'Featured', tagColor: 'bg-amber-500/20 text-amber-300' },
  { icon: '🌍', title: 'CII European Regional Meeting', meta: 'Venice, Italy · 14–16 May', tag: 'New', tagColor: 'bg-emerald-500/20 text-emerald-300' },
  { icon: '⚖️', title: 'WAD Conference 2027', meta: 'San José, Costa Rica · Mar 2027', tag: 'Upcoming', tagColor: 'bg-blue-500/20 text-blue-300' },
];

const FEATURES = [
  { icon: CalendarDays, title: 'New events', description: 'Every event added to the calendar that week.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Star, title: 'Featured pick', description: 'One standout event the editor thinks you should know about.', gradient: 'from-amber-500 to-orange-500' },
  { icon: Globe, title: 'Industry pulse', description: 'Key dates approaching and regional calendar trends.', gradient: 'from-violet-500 to-purple-500' },
  { icon: Shield, title: 'Verified only', description: 'Every event is reviewed before it reaches your inbox.', gradient: 'from-emerald-500 to-teal-500' },
  { icon: Zap, title: 'Quick read', description: 'Scan in under 2 minutes. No fluff.', gradient: 'from-pink-500 to-rose-500' },
  { icon: Mail, title: 'Weekly on Monday', description: 'Lands at the start of every week so you can plan.', gradient: 'from-indigo-500 to-blue-500' },
];

function EmailPreviewCard() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,#0d1525,#111e38)] shadow-[0_30px_80px_-20px_rgba(0,0,50,0.6)]">
      <div className="border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
            <Mail className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Investigator Events Weekly</p>
            <p className="text-[10px] text-blue-200/40">Every Monday · Free</p>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 px-4 py-3">
        {EMAIL_PREVIEW_ITEMS.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.35 }}
            className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
          >
            <span className="text-base">{item.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-white/90 line-clamp-1">{item.title}</p>
              <p className="text-[9px] text-blue-200/35">{item.meta}</p>
            </div>
            <span className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${item.tagColor}`}>{item.tag}</span>
          </motion.div>
        ))}
      </div>
      <div className="h-6 bg-gradient-to-t from-[#0d1525] to-transparent" />
    </div>
  );
}

export function CinematicNewsletterPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const cardScale = useTransform(scrollYProgress, [0, 0.12, 0.3], [0.88, 1, 1]);
  const cardY = useTransform(scrollYProgress, [0, 0.12], [40, 0]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.08]);

  return (
    <div ref={containerRef} className="relative min-h-[200vh] sm:min-h-[280vh]">
      {/* ── Sticky viewport ── */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.06),transparent_50%)]" />

        {/* Hero text */}
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-indigo-500 sm:text-xs">Newsletter</p>
            <h1 className="mx-auto mt-4 max-w-[12ch] text-[2.8rem] font-bold leading-[0.88] tracking-[-0.06em] text-slate-950 sm:text-[4.5rem] lg:text-[6rem]">
              Stay ahead of the calendar.
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base text-slate-500 sm:text-lg">
              A short weekly email with new events, key dates, and one standout listing.
            </p>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 text-xs text-slate-400">
            Scroll ↓
          </motion.p>
        </motion.div>

        {/* Dark card */}
        <motion.div style={{ scale: cardScale, y: cardY }} className="absolute inset-0 z-20 flex items-center justify-center px-3 sm:px-4">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(145deg,#06091a,#0d1840)] p-4 shadow-[0_40px_120px_-40px_rgba(0,0,50,0.5)] sm:rounded-[2.5rem] sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute left-[5%] top-[10%] h-48 w-48 rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.18),transparent_60%)]" />
            <div className="pointer-events-none absolute bottom-[10%] right-[8%] h-40 w-40 rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.12),transparent_60%)]" />

            <div className="relative grid items-center gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400 sm:text-xs">Weekly Intelligence</p>
                <h2 className="mt-3 text-[1.4rem] font-bold leading-tight tracking-[-0.04em] text-white sm:text-3xl lg:text-[2.5rem]">
                  The PI industry, delivered to your inbox.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-blue-200/50">
                  New conferences, training dates, and one featured event picked by the team each week.
                </p>
                <div className="mt-5 sm:mt-7">
                  <NewsletterSignupForm />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Free forever', 'No spam', '2 min read'].map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40 sm:text-[10px]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="hidden lg:flex lg:justify-center">
                <EmailPreviewCard />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Below fold ── */}
      <div className="relative z-30 bg-white">
        {/* Features — 3D depth cards */}
        <div className="relative overflow-hidden py-16 sm:py-24">
          {/* Subtle animated gradient bg */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.06),transparent_50%)]" />

          <div className="container-shell">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-500 sm:text-xs">What you get</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">Everything you need, nothing you don&apos;t.</h2>
            </motion.div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6"
                  style={{ boxShadow: '0 4px 20px -8px rgba(15,23,42,0.06)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px -16px rgba(99,102,241,0.18)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px -8px rgba(15,23,42,0.06)'; }}
                >
                  {/* Gradient accent top line */}
                  <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${item.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                  {/* Icon with gradient bg */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA — FULL-WIDTH DARK, in-your-face */}
        <div className="relative overflow-hidden bg-[linear-gradient(165deg,#06091a_0%,#0a1228_40%,#0d1840_70%,#06091a_100%)] py-20 sm:py-32">
          {/* Glow orbs */}
          <div className="pointer-events-none absolute left-[10%] top-[15%] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.2),transparent_60%)]" />
          <div className="pointer-events-none absolute right-[8%] bottom-[10%] h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.15),transparent_60%)]" />
          <div className="pointer-events-none absolute left-[40%] bottom-[20%] h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(ellipse,rgba(236,72,153,0.1),transparent_60%)]" />

          <div className="container-shell relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mx-auto max-w-2xl text-center"
            >
              <motion.h2
                className="text-[2.2rem] font-bold leading-[0.92] tracking-[-0.05em] text-white sm:text-[3.5rem] lg:text-[4.5rem]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Don&apos;t miss what&apos;s next.
              </motion.h2>
              <motion.p
                className="mx-auto mt-4 max-w-md text-base leading-relaxed text-blue-200/50 sm:mt-6 sm:text-lg"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Every Monday. The events, dates, and one featured listing that matter — straight to your inbox.
              </motion.p>

              {/* Glowing form card */}
              <motion.div
                className="relative mx-auto mt-8 max-w-md sm:mt-10"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {/* Outer glow ring — animated */}
                <div
                  className="pointer-events-none absolute inset-[-16px] rounded-[2.5rem]"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.2), rgba(139,92,246,0.12), transparent 70%)',
                    animation: 'hero-pulse 3s ease-in-out infinite',
                  }}
                />
                {/* Inner glow ring */}
                <div
                  className="pointer-events-none absolute inset-[-6px] rounded-[2rem]"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.12), transparent 60%)',
                    animation: 'hero-pulse 3s ease-in-out infinite 1.5s',
                  }}
                />

                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-[0_20px_60px_-20px_rgba(59,130,246,0.3)] sm:p-8">
                  {/* Shimmer top line */}
                  <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(99,102,241,0.6),rgba(59,130,246,0.5),transparent)]" />

                  <NewsletterSignupForm />

                  <div className="mt-4 flex items-center justify-center gap-3 text-xs text-blue-200/40">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                    Free · No spam · Unsubscribe anytime
                  </div>
                </div>
              </motion.div>

              <p className="mt-6 text-xs text-blue-200/30">
                Trusted by investigators across 30+ countries
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
