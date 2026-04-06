'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

const dos = [
  { title: 'Research attendees before arriving', detail: 'Review the attendee list, speaker bios, and sponsor roster. Know who you want to meet and why before you walk through the door.' },
  { title: 'Introduce yourself with your specialism', detail: "Not just your name and firm — say what you actually do. \"I specialise in digital forensics for insurance disputes\" is a conversation starter." },
  { title: 'Go to the smaller breakout sessions', detail: "The main stage fills a room. The breakout holds thirty people and everyone actually talks. That's where the real connections happen." },
  { title: 'Follow up within 48 hours', detail: 'Send a short, specific message while the conversation is still fresh. Reference something you actually discussed.' },
  { title: 'Attend the social events', detail: "Dinners, drinks, and evening sessions are where the guard comes down and the real conversations start." },
  { title: 'Arrive early on day one', detail: 'Registration queues are a rare moment where everyone is standing around with nothing to do. Walk in confident and ready.' },
  { title: 'Bring something useful to share', detail: 'An insight, a case study, a tool recommendation. People remember those who gave them something valuable.' },
  { title: 'Take proper notes', detail: "Write down names, context, and what you promised. Your memory will not serve you on Monday morning with forty new contacts." },
];

const donts = [
  { title: "Don't treat it like a sales pitch", detail: "Nobody came here to be sold to. Lead with curiosity, not capability. The work comes later — usually months later." },
  { title: "Don't spend the whole time with people you already know", detail: "It's comfortable. It's also a waste of your conference fee. Push yourself into unfamiliar conversations." },
  { title: "Don't hand cards to everyone you meet", detail: "A card given without context is a card binned. Exchange details with intention, after a real conversation." },
  { title: "Don't skip sessions to work in the lobby", detail: 'Your inbox will survive. People notice who disappears during the content.' },
  { title: "Don't dominate conversations", detail: 'Ask more questions than you answer. The most respected people in any room are the ones who make others feel heard.' },
  { title: "Don't drink like it's a free bar", detail: "It usually is a free bar. That's the trap. You're still at work." },
  { title: "Don't complain about competitors publicly", detail: "It makes you look small. The industry is smaller than you think." },
  { title: "Don't leave without a follow-up plan", detail: "Before you get home, write down who you're contacting, what you're saying, and when." },
];

function Card({ title, detail, type, index }: { title: string; detail: string; type: 'do' | 'dont'; index: number }) {
  const isDo = type === 'do';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`group rounded-2xl border p-5 transition-all duration-300 sm:p-6 ${
        isDo
          ? 'border-emerald-500/20 bg-emerald-500/[0.04] hover:border-emerald-500/40 hover:bg-emerald-500/[0.08]'
          : 'border-rose-500/20 bg-rose-500/[0.04] hover:border-rose-500/40 hover:bg-rose-500/[0.08]'
      }`}
    >
      <div className="flex gap-3.5">
        <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${isDo ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
          {isDo ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        </div>
        <div>
          <h3 className="text-[0.95rem] font-semibold text-white sm:text-base">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/40">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function AdviceContent() {
  return (
    <main className="relative">
      {/* ── Dark hero that flows from the spiral ── */}
      <div className="relative overflow-hidden bg-[linear-gradient(165deg,#06091a_0%,#0a1228_35%,#0d1840_60%,#0a1228_100%)] pb-16 pt-28 sm:pb-24 sm:pt-36">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-[10%] top-[20%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(ellipse,rgba(59,130,246,0.08),transparent_55%)]" />
        <div className="pointer-events-none absolute right-[5%] top-[10%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(ellipse,rgba(139,92,246,0.06),transparent_55%)]" />

        <div className="container-shell relative">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-400 sm:text-xs">
                Conference Advice
              </p>
              <h1 className="mt-5 text-[2.6rem] font-bold leading-[0.92] tracking-[-0.05em] text-white sm:mt-6 sm:text-[4rem] lg:text-[5rem]">
                The{' '}
                <span
                  className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                  style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
                >
                  unwritten
                </span>{' '}
                rules.
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/40 sm:mt-6 sm:text-lg">
                For investigators attending forensic, fraud, and intelligence conferences. Not theory — the things that actually make or break how you come across.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Cards on dark background ── */}
      <div className="bg-[linear-gradient(180deg,#0a1228_0%,#0d1840_50%,#0a1228_100%)] px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Do column */}
            <div>
              <Reveal>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-emerald-400">Do</h2>
                </div>
              </Reveal>
              <div className="space-y-3">
                {dos.map((item, i) => (
                  <Card key={item.title} title={item.title} detail={item.detail} type="do" index={i} />
                ))}
              </div>
            </div>

            {/* Don't column */}
            <div>
              <Reveal>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/15">
                    <XCircle className="h-4 w-4 text-rose-400" />
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.22em] text-rose-400">Don&apos;t</h2>
                </div>
              </Reveal>
              <div className="space-y-3">
                {donts.map((item, i) => (
                  <Card key={item.title} title={item.title} detail={item.detail} type="dont" index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <Reveal>
            <div className="mx-auto mt-16 max-w-lg text-center sm:mt-20">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Find your next conference</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/40 sm:text-base">
                Browse upcoming forensic, fraud, and investigative events. Filter by region, specialism, and date.
              </p>
              <Link href={'/calendar' as Route} className="btn-glow mt-6 inline-flex items-center gap-2 px-8 py-4 text-base">
                Browse Events <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
