'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { useEffect, useRef, useState } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';

/* ── Data ── */

const sectionLinks = [
  { id: 'before', label: 'Before You Arrive' },
  { id: 'during', label: 'During the Event' },
  { id: 'networking', label: 'Networking' },
  { id: 'presenting', label: 'Speaking' },
  { id: 'after', label: 'After' },
  { id: 'checklist', label: 'Checklist' },
];

const beforeDos = [
  { title: 'Set clear objectives', detail: 'Decide what you want from the conference before you arrive. New contacts, CPD hours, specific sessions, supplier leads — know your purpose going in.' },
  { title: 'Study the programme in advance', detail: 'Read the agenda properly. Identify the two or three sessions most relevant to your work and block them in your diary. Workshops and breakouts often fill up — register early.' },
  { title: 'Bring more business cards than you think you need', detail: 'Physical cards still matter in this industry. Bring twice as many as you expect to use. Include your professional memberships and any specialist areas on the card.' },
  { title: 'Research the speakers and key attendees', detail: "Look up the presenters. If there's someone specific you want to meet, know who they are and what they do before you walk in. It makes introductions less awkward and conversations more substantive." },
  { title: 'Dress appropriately', detail: "Professional standards vary by country and event type. Business professional is always safe. Read the invitation or event page carefully — some international conferences are formal, others are not." },
];

const beforeDonts = [
  { title: "Don't try to attend everything", detail: "Attempting to cover the full programme leads to exhaustion and shallow engagement with everything. It's better to attend fewer sessions with full attention than sprint between rooms." },
  { title: "Don't go in blind", detail: "Showing up without any preparation wastes an expensive day. Know the venue layout, the rough timings, and who is in the room. This isn't surveillance work — but the mindset applies." },
  { title: "Don't plan to work from the hotel in the evenings", detail: "Some of the best conversations happen at the evening social. Block the time out of your diary properly before you travel, not after." },
  { title: "Don't leave registration documents until the last minute", detail: "If the conference offers CPD accreditation, understand how it's recorded before the day. Some require pre-registration; others issue certificates only if you sign in at each session." },
];

const duringDos = [
  { title: 'Take notes during sessions', detail: "Sessions move quickly. A speaker's case study, a regulatory update, a statistic — if it's useful, write it down. You'll find it difficult to reconstruct from memory the following week." },
  { title: 'Introduce yourself to speakers after their session', detail: "Speakers are there to engage. If a session resonated, say so briefly and specifically. Keep it short, exchange cards if appropriate, and don't monopolise their time when others are waiting." },
  { title: 'Visit the exhibitor stands', detail: "Technology providers, legal service firms, and specialist suppliers often exhibit. Even if you're not buying, knowing what's available keeps you current and gives you things to discuss with clients." },
  { title: 'Attend the AGM or association business sessions if relevant', detail: "If you're a member of the organising association, attend the formal business. These sessions shape the direction of the profession and are where influence is built over time." },
];

const duringDonts = [
  { title: "Don't be on your phone during sessions", detail: "It's visible, it's disrespectful to the speaker, and it signals to everyone around you that you're not fully there. Check messages during breaks." },
  { title: "Don't dismiss sessions outside your immediate specialism", detail: "Cross-discipline sessions — cyber, financial crime, employment, legal — can open referral networks and client conversations you didn't expect. Keep an open mind on the programme." },
  { title: "Don't leave early just to beat the traffic", detail: "Some of the best conversations happen on the last afternoon, when the room thins out and people relax. Stay to the end where possible." },
  { title: "Don't overdo the evening events", detail: "If there's a formal dinner or evening drinks, pace yourself. Morning sessions follow. A poor first impression at breakfast the next day can undo good work the day before." },
];

const networkingDos = [
  { title: 'Seek out people you don\'t know', detail: "Gravitating towards familiar faces is comfortable but unproductive. Introduce yourself to at least three or four people you've not met before. Start with the question: \"What area do you work in?\"" },
  { title: 'Ask questions and listen properly', detail: "People remember those who showed genuine interest in what they do. Ask about specific cases, jurisdictions they work in, or challenges they're facing. Let them talk." },
  { title: 'Engage with international delegates', detail: "Investigators from other countries are attending the same event with purpose. Cross-border referral relationships are built face to face. International conferences in particular are an opportunity not to waste." },
  { title: 'Exchange cards after a conversation, not instead of one', detail: "Hand your card at the end of a meaningful exchange. Handing cards to everyone in the room without context is forgettable. A short conversation makes you memorable." },
];

const networkingDonts = [
  { title: "Don't open with a sales pitch", detail: "Conferences are not the right environment for selling. Lead with curiosity about the other person, not with what your firm does. If there's mutual interest, that conversation will follow naturally." },
  { title: "Don't spend the day with people you already know", detail: "It's easy to fall into this. If you've come with colleagues, split up during breaks and lunch. You can debrief on the train home." },
  { title: "Don't talk disparagingly about competitors", detail: "The PI industry is a small world. Critical remarks about other firms or individuals travel quickly. Say nothing you wouldn't want repeated — because it probably will be." },
  { title: "Don't dominate conversations", detail: "Know when to move on. If a conversation has run its course, it's fine to say it was good to meet and move on. Overstaying a conversation is uncomfortable for both parties." },
];

const speakingTips = [
  { title: 'Know your material cold', detail: "If you're presenting on a case study, know every detail. You will be asked questions. Saying \"I'll have to check that\" once is acceptable; doing it repeatedly is not.", num: '01' },
  { title: 'Arrive before your session starts', detail: "Check the room, confirm the AV setup, and load your slides in advance. Technical delays at the start of a presentation create the wrong first impression.", num: '02' },
  { title: 'Keep slides clean and minimal', detail: "Dense slides with paragraphs of text lose the room. Use visuals, brief points, and leave room to speak. If you read from your own slides, the audience will too.", num: '03' },
  { title: 'Be careful with client data', detail: "Case studies are powerful but require care. Anonymise fully, obtain any necessary permissions, and never include information that could identify a client or expose live intelligence.", num: '04' },
  { title: 'Engage with the audience during Q&A', detail: "Don't rush off the stage the moment Q&A ends. Stay in the room. The conversations immediately after a session are often the most valuable of the day.", num: '05' },
  { title: 'Share your slides afterwards if appropriate', detail: "Offering to send slides to interested attendees gives you a legitimate, warm reason to follow up. Collect cards or LinkedIn details before you leave the room.", num: '06' },
];

const afterDos = [
  { title: 'Follow up within 48 hours', detail: "Send a short LinkedIn connection request or a brief email while the conference is still fresh. Reference something specific from your conversation — it shows you were paying attention." },
  { title: 'Organise your contacts while they\'re fresh', detail: "Go through the cards you collected the same evening or the next morning. Note where you met each person, what you discussed, and any agreed next steps." },
  { title: 'Write a short summary of what you learned', detail: "Capture key takeaways from sessions while they're still clear. Even a brief internal memo helps embed the learning and demonstrates value from the time invested." },
  { title: 'Note the next event in the series', detail: "Annual conferences build on the last. Check the next event date and book early. Consistent attendance over two or three years builds far stronger relationships than a one-off visit." },
];

const afterDonts = [
  { title: "Don't let connections go cold", detail: "Meeting someone once and never following up means you'll spend the next conference reintroducing yourself. That's not a network — that's an address book." },
  { title: "Don't send a generic follow-up message", detail: "A message that reads \"great to meet you at the conference\" and nothing more does almost nothing. Personalise it — even a single sentence of context is the difference between remembered and deleted." },
  { title: "Don't ignore the CPD documentation", detail: "Many industry conferences carry formal CPD points. If you've attended sessions that qualify, log them immediately. Certificates and attendance records become harder to locate a month later." },
  { title: "Don't oversell new connections immediately", detail: "Following up within 48 hours with a service offer is too soon. Reconnect, reference the conversation, and let the relationship develop at a natural pace." },
];

const checklist = [
  'Programme reviewed and key sessions highlighted',
  'Business cards packed (more than you think you\'ll need)',
  'Registration confirmed and badge collected or on-site plan noted',
  'Venue location and parking or transport confirmed',
  'Phone charged, notebook or note-taking app ready',
  'Three people you want to meet specifically identified',
  'Objectives for the day clear — know what success looks like',
  'Evening social or dinner confirmed if applicable',
  'LinkedIn app downloaded if using for follow-up',
  'Out-of-office or client response plan in place for the day',
  'Any workshop or breakout registrations confirmed in advance',
  'CPD logging method confirmed if certificate required',
];

/* ── Active section tracker ── */

function useActiveSection() {
  const [active, setActive] = useState('before');

  useEffect(() => {
    const ids = sectionLinks.map(s => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

/* ── Dark Card (for dark sections) ── */

function DarkCard({ title, detail, type, index }: { title: string; detail: string; type: 'do' | 'dont'; index: number }) {
  const isDo = type === 'do';
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-500 sm:p-6 ${
        isDo
          ? 'border-emerald-500/15 bg-emerald-500/[0.03] hover:border-emerald-500/40 hover:bg-emerald-500/[0.07]'
          : 'border-rose-500/15 bg-rose-500/[0.03] hover:border-rose-500/40 hover:bg-rose-500/[0.07]'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-px transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${
        isDo ? 'bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-400/50 to-transparent'
      }`} />
      <div className="flex gap-3.5">
        <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
          isDo
            ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            : 'bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 group-hover:shadow-[0_0_12px_rgba(244,63,94,0.2)]'
        }`}>
          {isDo ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        </div>
        <div>
          <h3 className="text-[0.95rem] font-semibold text-white/90 transition-colors duration-300 group-hover:text-white sm:text-base">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/35 transition-colors duration-300 group-hover:text-white/50">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Light Card (for light sections) ── */

function LightCard({ title, detail, type, index }: { title: string; detail: string; type: 'do' | 'dont'; index: number }) {
  const isDo = type === 'do';
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-500 sm:p-6 ${
        isDo
          ? 'border-emerald-200/60 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.15)]'
          : 'border-rose-200/60 bg-rose-50/50 hover:border-rose-300 hover:bg-rose-50 hover:shadow-[0_8px_30px_-12px_rgba(244,63,94,0.15)]'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-px transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${
        isDo ? 'bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-400/60 to-transparent'
      }`} />
      <div className="flex gap-3.5">
        <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
          isDo
            ? 'bg-emerald-100 text-emerald-600 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            : 'bg-rose-100 text-rose-600 group-hover:shadow-[0_0_12px_rgba(244,63,94,0.2)]'
        }`}>
          {isDo ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        </div>
        <div>
          <h3 className="text-[0.95rem] font-semibold text-slate-900 sm:text-base">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Column header ── */

function ColumnHeader({ type, variant }: { type: 'do' | 'dont'; variant: 'dark' | 'light' }) {
  const isDo = type === 'do';
  const dark = variant === 'dark';
  return (
    <Reveal>
      <div className="mb-6 flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
          isDo
            ? (dark ? 'bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'bg-emerald-100')
            : (dark ? 'bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]' : 'bg-rose-100')
        }`}>
          {isDo
            ? <CheckCircle2 className={`h-4 w-4 ${dark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            : <XCircle className={`h-4 w-4 ${dark ? 'text-rose-400' : 'text-rose-600'}`} />
          }
        </div>
        <h2 className={`text-sm font-bold uppercase tracking-[0.22em] ${
          isDo
            ? (dark ? 'text-emerald-400' : 'text-emerald-600')
            : (dark ? 'text-rose-400' : 'text-rose-600')
        }`}>
          {isDo ? 'Do' : "Don\u2019t"}
        </h2>
      </div>
    </Reveal>
  );
}

/* ── Section number badge ── */

function SectionBadge({ num, variant }: { num: string; variant: 'dark' | 'light' }) {
  const dark = variant === 'dark';
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold tabular-nums ring-1 ${
        dark
          ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-cyan-400 ring-cyan-500/20'
          : 'bg-gradient-to-br from-blue-100 to-cyan-50 text-blue-600 ring-blue-200/60'
      }`}>
        {num}
      </span>
      <div className={`h-px flex-1 ${dark ? 'bg-gradient-to-r from-cyan-500/20 to-transparent' : 'bg-gradient-to-r from-blue-200/60 to-transparent'}`} />
    </div>
  );
}

/* ── Dark Do/Don't Section ── */

function DarkDosDontsSection({
  id, label, title, description, num, dos, donts,
}: {
  id: string; label: string; title: string; description: string; num: string;
  dos: { title: string; detail: string }[];
  donts: { title: string; detail: string }[];
}) {
  return (
    <section id={id} className="scroll-mt-[7.5rem] px-4 py-16 sm:scroll-mt-[8.5rem] sm:px-6 sm:py-24 md:scroll-mt-[9.5rem]">
      <div className="mx-auto max-w-6xl">
        <SectionBadge num={num} variant="dark" />
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-400 sm:text-xs">{label}</p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.1] tracking-tight text-white sm:text-3xl lg:text-[2.5rem]">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/35 sm:text-base">{description}</p>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <ColumnHeader type="do" variant="dark" />
            <div className="space-y-3">
              {dos.map((item, i) => <DarkCard key={item.title} title={item.title} detail={item.detail} type="do" index={i} />)}
            </div>
          </div>
          <div>
            <ColumnHeader type="dont" variant="dark" />
            <div className="space-y-3">
              {donts.map((item, i) => <DarkCard key={item.title} title={item.title} detail={item.detail} type="dont" index={i} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Light Do/Don't Section ── */

function LightDosDontsSection({
  id, label, title, description, num, dos, donts,
}: {
  id: string; label: string; title: string; description: string; num: string;
  dos: { title: string; detail: string }[];
  donts: { title: string; detail: string }[];
}) {
  return (
    <section id={id} className="scroll-mt-[7.5rem] px-4 py-16 sm:scroll-mt-[8.5rem] sm:px-6 sm:py-24 md:scroll-mt-[9.5rem]">
      <div className="mx-auto max-w-6xl">
        <SectionBadge num={num} variant="light" />
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-600 sm:text-xs">{label}</p>
          <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-3xl lg:text-[2.5rem]">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">{description}</p>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <ColumnHeader type="do" variant="light" />
            <div className="space-y-3">
              {dos.map((item, i) => <LightCard key={item.title} title={item.title} detail={item.detail} type="do" index={i} />)}
            </div>
          </div>
          <div>
            <ColumnHeader type="dont" variant="light" />
            <div className="space-y-3">
              {donts.map((item, i) => <LightCard key={item.title} title={item.title} detail={item.detail} type="dont" index={i} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Main Component ── */

export function AdviceContent() {
  const active = useActiveSection();
  const heroRef = useRef<HTMLDivElement>(null);
  const jumpBarRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  // Auto-scroll the jump bar to keep active link visible on mobile
  useEffect(() => {
    if (!jumpBarRef.current) return;
    const activeEl = jumpBarRef.current.querySelector(`[data-section="${active}"]`) as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [active]);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative">

      {/* ══════════════════════════════════════════
          HERO — Dark with MeshGradient shader
         ══════════════════════════════════════════ */}
      <div ref={heroRef} className="relative overflow-hidden bg-[#04070f] pb-20 pt-28 sm:pb-28 sm:pt-36">
        {/* Shader background */}
        <div className="absolute inset-0">
          <MeshGradient
            width="100%"
            height="100%"
            colors={['#000000', '#0a0a1a', '#1668ff', '#ffffff']}
            speed={0.8}
            distortion={0.4}
            swirl={0.3}
            grainOverlay={0.12}
          />
        </div>
        {/* Dark overlay for text readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#04070f]/60 via-[#04070f]/30 to-[#04070f]/80" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container-shell relative">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-1.5 backdrop-blur-sm">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">Conference Guide</span>
              </div>

              <h1 className="text-[2.4rem] font-bold leading-[0.94] tracking-[-0.04em] text-white sm:text-[3.8rem] lg:text-[5rem]">
                Your first PI{' '}
                <br className="sm:hidden" />
                conference.
                <br />
                <span
                  className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_28%,#a855f7_62%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
                  style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
                >
                  Make it count.
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/35 sm:mt-6 sm:text-lg">
                The practical dos and don&apos;ts for investigators attending an industry conference for the first time — from first impressions to lasting relationships.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {[
                  { color: 'bg-blue-400', label: 'Written for first-timers' },
                  { color: 'bg-emerald-400', label: 'Industry-specific advice' },
                  { color: 'bg-amber-400', label: 'Networking, CPD & more' },
                ].map((pill) => (
                  <span key={pill.label} className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/40 backdrop-blur-sm">
                    <span className={`h-1.5 w-1.5 rounded-full ${pill.color}`} />
                    {pill.label}
                  </span>
                ))}
              </div>

              <motion.div
                className="mt-12 flex justify-center"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex h-8 w-5 items-start justify-center rounded-full border border-white/10 p-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-white/30" />
                </div>
              </motion.div>
            </div>
          </Reveal>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          STICKY JUMP BAR
         ══════════════════════════════════════════ */}
      <div className="sticky top-[3.25rem] z-40 border-b border-white/[0.06] bg-[#080f1e]/95 backdrop-blur-2xl sm:top-[4rem] md:top-[4.75rem]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div ref={jumpBarRef} className="no-scrollbar mx-auto flex max-w-6xl gap-0.5 overflow-x-auto px-4 sm:justify-center sm:gap-1 sm:px-6">
          {sectionLinks.map((link) => {
            const isActive = active === link.id;
            return (
              <a
                key={link.id}
                data-section={link.id}
                href={`#${link.id}`}
                className={`relative whitespace-nowrap px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 sm:px-4 sm:py-3.5 sm:text-[11px] sm:tracking-[0.16em] ${
                  isActive ? 'text-cyan-400' : 'text-white/25 hover:text-white/50'
                }`}
              >
                <span className="relative z-10">{link.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeJump"
                    className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 1 — DARK: Before You Arrive
         ══════════════════════════════════════════ */}
      <div className="relative bg-[linear-gradient(180deg,#080f1e_0%,#0b1630_50%,#0d1840_100%)]">
        <div className="pointer-events-none absolute left-0 top-[20%] h-[600px] w-[300px] bg-[radial-gradient(ellipse_at_left,rgba(22,104,255,0.04),transparent_70%)]" />
        <DarkDosDontsSection
          id="before" num="01"
          label="Before You Arrive"
          title="Preparation separates those who attend from those who benefit"
          description="Most people turn up and improvise. A small amount of prep changes everything."
          dos={beforeDos} donts={beforeDonts}
        />
      </div>

      {/* ══════════════════════════════════════════
          SECTION 2 — LIGHT: During the Event
         ══════════════════════════════════════════ */}
      <div className="relative bg-[linear-gradient(135deg,#f8faff_0%,#f0f4ff_40%,#f8fbff_100%)]">
        {/* Subtle grid pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.35]" style={{
          backgroundImage: 'linear-gradient(to right, rgba(22,104,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(22,104,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <LightDosDontsSection
          id="during" num="02"
          label="During the Event"
          title="How you conduct yourself in the room matters"
          description="Conferences in this industry are small worlds. Reputations travel. The standards you'd apply professionally apply here too."
          dos={duringDos} donts={duringDonts}
        />
      </div>

      {/* ── Photo divider — roundtable ── */}
      <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-80" style={{ contain: 'layout paint' }}>
        <Image src="/conference/conference2.jpg" alt="Investigators in discussion at a roundtable session" fill className="object-cover object-[center_35%]" sizes="100vw" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f4ff]/60 via-transparent to-[#080f1e]/80" />
      </div>

      {/* ══════════════════════════════════════════
          SECTION 3 — DARK: Networking (with shader)
         ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-[#080f1e]">
        <div className="absolute inset-0">
          <MeshGradient
            width="100%"
            height="100%"
            colors={['#000000', '#0a0a1a', '#6c3aff', '#ffffff']}
            speed={0.6}
            distortion={0.35}
            swirl={0.25}
            grainOverlay={0.1}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[#080f1e]/60" />
        <div className="relative">
          <DarkDosDontsSection
            id="networking" num="03"
            label="Networking"
            title="Relationship building is the primary purpose of attending"
            description="Formal sessions deliver knowledge. The conversations in the corridors, over lunch, and at the bar are where real professional value is created."
            dos={networkingDos} donts={networkingDonts}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          QUOTE — Light
         ══════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 p-8 text-center shadow-[0_24px_60px_-20px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-12">
              <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-blue-400/5 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-purple-400/5 blur-2xl" />
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-50">
                <span className="font-[var(--font-serif)] text-2xl font-bold text-blue-600">&ldquo;</span>
              </div>
              <blockquote className="relative font-[var(--font-serif)] text-xl font-medium italic leading-relaxed text-slate-700 sm:text-2xl lg:text-[1.65rem]">
                The referral you&apos;ll land next year starts with a thirty-second conversation at a conference today. Show up, be curious, and follow up.
              </blockquote>
              <cite className="mt-6 block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 not-italic">
                Investigator Events — Career Advice Series
              </cite>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Photo divider — networking ── */}
      <div className="relative h-48 w-full overflow-hidden sm:h-64 lg:h-80" style={{ contain: 'layout paint' }}>
        <Image src="/conference/conference3.jpg" alt="Investigators networking between conference sessions" fill className="object-cover" sizes="100vw" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8faff]/40 via-transparent to-white/60" />
      </div>

      {/* ══════════════════════════════════════════
          SECTION 4 — LIGHT: Speaking Tips
         ══════════════════════════════════════════ */}
      <div className="relative bg-[linear-gradient(135deg,#ffffff_0%,#f8faff_40%,#f0f4ff_100%)]">
        <section id="presenting" className="scroll-mt-[7.5rem] px-4 py-16 sm:scroll-mt-[8.5rem] sm:px-6 sm:py-24 md:scroll-mt-[9.5rem]">
          <div className="mx-auto max-w-6xl">
            <SectionBadge num="04" variant="light" />
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-600 sm:text-xs">If You&apos;re Speaking or Presenting</p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-3xl lg:text-[2.5rem]">Speaking at a conference raises your profile — get it right</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                Whether you&apos;re delivering a full session, sitting on a panel, or contributing to a workshop, how you present reflects directly on your professional standing.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {speakingTips.map((tip, i) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm transition-all duration-500 hover:border-blue-300/60 hover:shadow-[0_12px_40px_-12px_rgba(22,104,255,0.12)]"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-cyan-50 text-xs font-bold tabular-nums text-blue-600 ring-1 ring-blue-200/60 transition-all duration-500 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                    {tip.num}
                  </span>
                  <h3 className="text-[0.95rem] font-semibold text-slate-900 sm:text-base">{tip.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{tip.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════
          SECTION 5 — DARK: After the Conference
         ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-[linear-gradient(180deg,#080f1e_0%,#0d1840_50%,#080f1e_100%)]">
        <div className="pointer-events-none absolute right-0 top-[30%] h-[600px] w-[300px] bg-[radial-gradient(ellipse_at_right,rgba(139,92,246,0.03),transparent_70%)]" />
        <DarkDosDontsSection
          id="after" num="05"
          label="After the Conference"
          title="The follow-up is where most people fail — don't be one of them"
          description="Conferences generate goodwill and warm connections. Without follow-up, that goodwill has a half-life of about seventy-two hours."
          dos={afterDos} donts={afterDonts}
        />
      </div>

      {/* ══════════════════════════════════════════
          SECTION 6 — LIGHT: Checklist
         ══════════════════════════════════════════ */}
      <div className="relative bg-[linear-gradient(135deg,#f8faff_0%,#f0f4ff_40%,#f8fbff_100%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.3]" style={{
          backgroundImage: 'linear-gradient(to right, rgba(22,104,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(22,104,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <section id="checklist" className="relative scroll-mt-[7.5rem] px-4 py-16 sm:scroll-mt-[8.5rem] sm:px-6 sm:py-24 md:scroll-mt-[9.5rem]">
          <div className="mx-auto max-w-4xl">
            <SectionBadge num="06" variant="light" />
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-600 sm:text-xs">Quick Reference</p>
              <h2 className="mt-4 text-[1.75rem] font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-3xl">Conference-day checklist</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-500 sm:text-base">Run through this before you walk in.</p>
            </Reveal>

            <Reveal>
              <div className="relative mt-12 overflow-hidden rounded-2xl border border-blue-200/60 bg-white/80 p-6 shadow-[0_12px_40px_-16px_rgba(22,104,255,0.08)] backdrop-blur-sm sm:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/50 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-100/50 blur-3xl" />

                <h3 className="relative text-lg font-bold text-slate-900">Before you leave for the venue</h3>
                <p className="relative mt-1 text-sm text-slate-400">Print this, save it to your phone, or screenshot it.</p>

                <div className="relative mt-8 grid gap-x-10 gap-y-1 sm:grid-cols-2">
                  {checklist.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      className="group flex items-center gap-3 border-b border-slate-100 py-3 transition-colors duration-300 hover:border-blue-200"
                    >
                      <div className="h-4 w-4 flex-shrink-0 rounded border border-blue-300/60 bg-blue-50 transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.12)]" />
                      <span className="text-sm font-medium text-slate-600 transition-colors duration-300 group-hover:text-slate-800">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {/* ══════════════════════════════════════════
          CTA — Dark with shader
         ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-[#04070f] py-20 sm:py-28">
        <div className="absolute inset-0">
          <MeshGradient
            width="100%"
            height="100%"
            colors={['#000000', '#0a0a1a', '#1668ff', '#ffffff']}
            speed={0.5}
            distortion={0.3}
            swirl={0.2}
            grainOverlay={0.1}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[#04070f]/50" />
        <Reveal>
          <div className="relative mx-auto max-w-lg px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Find your next conference</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/35 sm:text-base">
              Browse upcoming forensic, fraud, and investigative events. Filter by region, specialism, and date.
            </p>
            <Link href={'/calendar' as Route} className="btn-glow mt-6 inline-flex items-center gap-2 px-8 py-4 text-base">
              Browse Events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
