'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';

const dos = [
  { title: 'Research attendees before arriving', detail: 'Review the attendee list, speaker bios, and sponsor roster. Know who you want to meet and why before you walk through the door.' },
  { title: 'Introduce yourself with your specialism', detail: 'Not just your name and firm — say what you actually do. "I specialise in digital forensics for insurance disputes" is a conversation starter. "I\'m a PI" is not.' },
  { title: 'Go to the smaller breakout sessions', detail: "The main stage fills a room. The breakout holds thirty people and everyone actually talks. That's where the real connections happen." },
  { title: 'Follow up within 48 hours', detail: 'Send a short, specific message while the conversation is still fresh. Reference something you actually discussed, not a generic "great to meet you".' },
  { title: 'Attend the social events', detail: "Dinners, drinks, and evening sessions are where the guard comes down and the real conversations start. Don't retreat to your room." },
  { title: 'Arrive early on day one', detail: 'Registration queues are a rare moment where everyone is standing around with nothing to do. Walk in confident and ready to introduce yourself.' },
  { title: 'Bring something useful to share', detail: 'An insight, a case study, a tool recommendation. People remember those who gave them something valuable — not those who collected business cards.' },
  { title: 'Take proper notes', detail: "Write down names, context, and what you promised. Your memory will not serve you when you're back at your desk on Monday morning with forty new contacts." },
];

const donts = [
  { title: "Don't treat it like a sales pitch", detail: "Nobody came here to be sold to. Lead with curiosity, not capability. The work comes later — usually months later — if you built genuine trust." },
  { title: "Don't spend the whole time with people you already know", detail: "It's comfortable. It's also a waste of your conference fee. Push yourself into unfamiliar conversations. That's the point." },
  { title: "Don't hand cards to everyone you meet", detail: "A card given without context is a card binned. Exchange details with intention, after a real conversation, when there's a genuine reason to stay in touch." },
  { title: "Don't skip sessions to work in the lobby", detail: 'Your inbox will survive. The hallway track is not a substitute for actually attending — and people notice who disappears during the content.' },
  { title: "Don't dominate conversations", detail: 'Ask more questions than you answer. The most respected people in any room are the ones who make others feel heard, not the ones who talk the most.' },
  { title: "Don't drink like it's a free bar", detail: "It usually is a free bar. That's the trap. You're still at work. The people you're trying to impress are watching." },
  { title: "Don't complain about competitors publicly", detail: "It makes you look small. The industry is smaller than you think, and the person you're talking to may well have a relationship with the firm you're slagging off." },
  { title: "Don't leave without a written follow-up plan", detail: "Before you get on the train or plane home, write down who you're contacting, what you're saying, and when. Intentions made in airport lounges do not survive Monday morning." },
];

function Card({ title, detail, type, index }: { title: string; detail: string; type: 'do' | 'dont'; index: number }) {
  const isDo = type === 'do';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className={`group rounded-2xl border bg-white p-5 transition-all duration-300 ${
        isDo
          ? 'border-emerald-200/60 hover:border-emerald-300 hover:shadow-[0_12px_36px_-12px_rgba(16,185,129,0.15)]'
          : 'border-rose-200/60 hover:border-rose-300 hover:shadow-[0_12px_36px_-12px_rgba(244,63,94,0.15)]'
      }`}
    >
      <div className="flex gap-3">
        <div className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${isDo ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
          {isDo ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function AdviceContent() {
  return (
    <main className="relative overflow-hidden">
      {/* ── Hero ── */}
      <div className="relative bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-8 pt-24 sm:pb-14 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_35%)]" />
        <div className="container-shell relative">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="eyebrow">Conference Advice</p>
              <h1 className="mt-4 text-[2.2rem] font-bold leading-[0.92] tracking-[-0.05em] text-slate-950 sm:text-[3.5rem] lg:text-[4.5rem]">
                Do&apos;s and Don&apos;ts
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base">
                For investigators attending forensic, fraud, and intelligence conferences. Not theory — the things that actually make or break how you come across.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Cards grid ── */}
      <div className="container-shell relative py-10 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Do column */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Do</h2>
            </div>
            <div className="space-y-3">
              {dos.map((item, i) => (
                <Card key={item.title} title={item.title} detail={item.detail} type="do" index={i} />
              ))}
            </div>
          </div>

          {/* Don't column */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100">
                <XCircle className="h-4 w-4 text-rose-600" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">Don&apos;t</h2>
            </div>
            <div className="space-y-3">
              {donts.map((item, i) => (
                <Card key={item.title} title={item.title} detail={item.detail} type="dont" index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Reveal>
          <div className="mx-auto mt-12 max-w-lg text-center sm:mt-16">
            <div className="rounded-2xl border border-slate-200/60 bg-[linear-gradient(135deg,#f0f4ff,#f8fbff)] p-8">
              <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">Find your next conference</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Browse upcoming forensic, fraud, and investigative events. Filter by region, specialism, and date.
              </p>
              <Link href={'/calendar' as Route} className="btn-primary mt-5 inline-flex px-6 py-3">
                Browse Events
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
