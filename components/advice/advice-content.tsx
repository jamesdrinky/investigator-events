'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';

const dos = [
  {
    title: 'Research attendees before arriving',
    detail:
      'Review the attendee list, speaker bios, and sponsor roster. Know who you want to meet and why before you walk through the door.',
  },
  {
    title: 'Introduce yourself with your specialism',
    detail:
      'Not just your name and firm — say what you actually do. "I specialise in digital forensics for insurance disputes" is a conversation starter. "I\'m a PI" is not.',
  },
  {
    title: 'Go to the smaller breakout sessions',
    detail:
      "The main stage fills a room. The breakout holds thirty people and everyone actually talks. That's where the real connections happen.",
  },
  {
    title: 'Follow up within 48 hours',
    detail:
      'Send a short, specific message while the conversation is still fresh. Reference something you actually discussed, not a generic "great to meet you".',
  },
  {
    title: 'Attend the social events',
    detail:
      "Dinners, drinks, and evening sessions are where the guard comes down and the real conversations start. Don't retreat to your room.",
  },
  {
    title: 'Arrive early on day one',
    detail:
      'Registration queues are a rare moment where everyone is standing around with nothing to do. Walk in confident and ready to introduce yourself.',
  },
  {
    title: 'Bring something useful to share',
    detail:
      'An insight, a case study, a tool recommendation. People remember those who gave them something valuable — not those who collected business cards.',
  },
  {
    title: 'Take proper notes',
    detail:
      "Write down names, context, and what you promised. Your memory will not serve you when you're back at your desk on Monday morning with forty new contacts.",
  },
];

const donts = [
  {
    title: "Don't treat it like a sales pitch",
    detail:
      "Nobody came here to be sold to. Lead with curiosity, not capability. The work comes later — usually months later — if you built genuine trust.",
  },
  {
    title: "Don't spend the whole time with people you already know",
    detail:
      "It's comfortable. It's also a waste of your conference fee. Push yourself into unfamiliar conversations. That's the point.",
  },
  {
    title: "Don't hand cards to everyone you meet",
    detail:
      "A card given without context is a card binned. Exchange details with intention, after a real conversation, when there's a genuine reason to stay in touch.",
  },
  {
    title: "Don't skip sessions to work in the lobby",
    detail:
      'Your inbox will survive. The hallway track is not a substitute for actually attending — and people notice who disappears during the content.',
  },
  {
    title: "Don't dominate conversations",
    detail:
      'Ask more questions than you answer. The most respected people in any room are the ones who make others feel heard, not the ones who talk the most.',
  },
  {
    title: "Don't drink like it's a free bar",
    detail:
      "It usually is a free bar. That's the trap. You're still at work. The people you're trying to impress are watching.",
  },
  {
    title: "Don't complain about competitors publicly",
    detail:
      "It makes you look small. The industry is smaller than you think, and the person you're talking to may well have a relationship with the firm you're slagging off.",
  },
  {
    title: "Don't leave without a written follow-up plan",
    detail:
      "Before you get on the train or plane home, write down who you're contacting, what you're saying, and when. Intentions made in airport lounges do not survive Monday morning.",
  },
];

function AdviceRow({
  title,
  detail,
  accentColor,
  icon,
  index,
}: {
  title: string;
  detail: string;
  accentColor: string;
  icon: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      className="advice-item"
      style={{ animationDelay: `${index * 0.07}s`, listStyle: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.875rem',
          alignItems: 'flex-start',
          padding: '1.25rem',
          borderRadius: '1rem',
          border: `1px solid ${hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
          background: hovered
            ? 'linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))'
            : 'linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))',
          boxShadow: hovered
            ? '0 0 0 1px rgba(99,102,241,0.18), 0 20px 48px -24px rgba(0,0,50,0.5)'
            : '0 2px 12px -8px rgba(0,0,30,0.4)',
          backdropFilter: 'blur(8px)',
          transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
          cursor: 'default',
          marginBottom: '0.625rem',
        }}
      >
        {/* Icon badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            backgroundColor: accentColor === '#4caf50'
              ? 'rgba(76,175,80,0.15)'
              : 'rgba(239,68,68,0.15)',
            color: accentColor,
            fontSize: '0.65rem',
            fontWeight: 700,
            flexShrink: 0,
            marginTop: '0.125rem',
            opacity: hovered ? 1 : 0.75,
            transition: 'opacity 0.2s ease',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {icon}
        </span>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: '0 0 0.375rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: hovered ? '#ffffff' : 'rgba(237,232,224,0.9)',
              lineHeight: 1.35,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              transition: 'color 0.2s ease',
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'rgba(148,163,184,0.8)',
              lineHeight: 1.75,
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            {detail}
          </p>
        </div>
      </div>
    </li>
  );
}

function StickyColumnHeader({
  label,
  icon,
  accentColor,
  borderColor,
}: {
  label: React.ReactNode;
  icon: string;
  accentColor: string;
  borderColor: string;
}) {
  return (
    <div
      style={{
        position: 'sticky',
        top: '4.75rem',
        zIndex: 10,
        padding: '1.75rem 0 1rem',
        marginBottom: '0.75rem',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background:
          'linear-gradient(180deg,rgba(9,17,40,1) 60%,rgba(9,17,40,0))',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          paddingBottom: '0.875rem',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            backgroundColor:
              accentColor === '#4ade80'
                ? 'rgba(74,222,128,0.12)'
                : 'rgba(248,113,113,0.12)',
            color: accentColor,
            fontSize: '0.6rem',
            fontWeight: 700,
            flexShrink: 0,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {icon}
        </span>
        <h2
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: accentColor,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, sans-serif',
            margin: 0,
          }}
        >
          {label}
        </h2>
      </div>
    </div>
  );
}

export function AdviceContent() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* CSS-only scroll fade-in animation */}
      <style>{`
        @keyframes advice-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .advice-item {
          animation: advice-fade-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @supports (animation-timeline: view()) {
          .advice-item {
            animation: advice-fade-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
            animation-timeline: view();
            animation-range: entry 0% entry 32%;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .advice-item { animation: none; }
        }
      `}</style>

      {/* ── Deep navy base ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(165deg, #06091a 0%, #0a1128 28%, #0d1840 55%, #091028 100%)',
        }}
      />

      {/* ── Ambient glow orbs ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          animation: 'orb-drift 18s ease-in-out infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '6%',
            top: '6%',
            width: '38rem',
            height: '38rem',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse, rgba(22,104,255,0.32) 0%, transparent 65%)',
            filter: 'blur(3rem)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '8%',
            top: '12%',
            width: '30rem',
            height: '30rem',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse, rgba(111,86,255,0.26) 0%, transparent 62%)',
            filter: 'blur(3rem)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '38%',
            bottom: '15%',
            width: '22rem',
            height: '22rem',
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse, rgba(20,184,255,0.18) 0%, transparent 60%)',
            filter: 'blur(3rem)',
          }}
        />
      </div>

      {/* ── Content wrapper ── */}
      <div style={{ position: 'relative' }}>

        {/* ── Hero ── */}
        <section style={{ padding: 'clamp(4rem, 9vw, 6rem) 1.5rem clamp(3rem, 6vw, 4.5rem)' }}>
          <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
            {/* Glass hero card */}
            <div
              style={{
                textAlign: 'center',
                borderRadius: '2rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background:
                  'linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))',
                boxShadow:
                  '0 52px 150px -64px rgba(0,0,50,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: 'clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 5vw, 5rem)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Shimmer top line */}
              <div
                style={{
                  position: 'absolute',
                  inset: '0 0 auto',
                  height: '1px',
                  background:
                    'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(56,189,248,0.55), rgba(236,72,153,0.3), transparent)',
                }}
              />
              {/* Eyebrow badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.08)',
                  padding: '0.375rem 1rem',
                  marginBottom: '1.75rem',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span
                  style={{
                    width: '0.5rem',
                    height: '0.5rem',
                    borderRadius: '50%',
                    backgroundColor: '#22d3ee',
                    boxShadow: '0 0 0 4px rgba(34,211,238,0.2)',
                    flexShrink: 0,
                    animation: 'hero-pulse 3s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.75)',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  Field Intelligence
                </span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.25rem, 6vw, 4rem)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: '-0.04em',
                  color: '#ffffff',
                  margin: '0 0 1.25rem',
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                How to work a conference
              </h1>

              {/* Gold divider */}
              <div
                style={{
                  width: '2.5rem',
                  height: '1px',
                  background:
                    'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), transparent)',
                  margin: '0 auto 1.5rem',
                }}
              />

              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'rgba(186,200,230,0.75)',
                  maxWidth: '42rem',
                  margin: '0 auto',
                  lineHeight: 1.8,
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                For investigators attending forensic, fraud, and intelligence conferences. Not
                theory — the things that actually make or break how you come across in a room
                full of peers.
              </p>
            </div>
          </div>
        </section>

        {/* ── Two-column grid ── */}
        <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 28rem), 1fr))',
              gap: '0 3.5rem',
              alignItems: 'start',
            }}
          >
            {/* ── Do column ── */}
            <div>
              <StickyColumnHeader
                label="Do"
                icon="✓"
                accentColor="#4ade80"
                borderColor="rgba(74,222,128,0.2)"
              />
              <ul style={{ margin: 0, padding: 0 }}>
                {dos.map((item, i) => (
                  <AdviceRow
                    key={i}
                    title={item.title}
                    detail={item.detail}
                    accentColor="#4caf50"
                    icon="✓"
                    index={i}
                  />
                ))}
              </ul>
            </div>

            {/* ── Don't column ── */}
            <div>
              <StickyColumnHeader
                label={<>Don&apos;t</>}
                icon="✕"
                accentColor="#f87171"
                borderColor="rgba(248,113,113,0.2)"
              />
              <ul style={{ margin: 0, padding: 0 }}>
                {donts.map((item, i) => (
                  <AdviceRow
                    key={i}
                    title={item.title}
                    detail={item.detail}
                    accentColor="#ef4444"
                    icon="✕"
                    index={i}
                  />
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Signal divider ── */}
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div
            style={{
              height: '1px',
              background:
                'linear-gradient(90deg, rgba(22,104,255,0), rgba(22,104,255,0.6), rgba(20,184,255,0.6), rgba(111,86,255,0.4), rgba(22,104,255,0))',
              opacity: 0.5,
            }}
          />
        </div>

        {/* ── CTA ── */}
        <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem' }}>
          <div style={{ maxWidth: '40rem', margin: '0 auto', textAlign: 'center' }}>
            {/* Glass CTA card */}
            <div
              style={{
                borderRadius: '2rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background:
                  'linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))',
                boxShadow: '0 44px 100px -52px rgba(0,0,50,0.65), inset 0 1px 0 rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: 'clamp(2.5rem, 5vw, 3.5rem) clamp(1.5rem, 5vw, 3rem)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Shimmer top line */}
              <div
                style={{
                  position: 'absolute',
                  inset: '0 0 auto',
                  height: '1px',
                  background:
                    'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(56,189,248,0.5), transparent)',
                }}
              />
              {/* Vertical gold accent */}
              <div
                style={{
                  width: '1px',
                  height: '2.5rem',
                  background:
                    'linear-gradient(180deg, transparent, rgba(212,175,55,0.7), transparent)',
                  margin: '0 auto 2rem',
                }}
              />
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                  fontWeight: 700,
                  color: '#ffffff',
                  marginBottom: '1rem',
                  lineHeight: 1.2,
                  letterSpacing: '-0.03em',
                  fontFamily:
                    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                }}
              >
                Find your next conference
              </h2>
              <p
                style={{
                  color: 'rgba(148,163,184,0.8)',
                  fontSize: '0.9375rem',
                  lineHeight: 1.8,
                  marginBottom: '2.25rem',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                Browse upcoming forensic, fraud, and investigative events. Filter by region,
                specialism, and date — then go in prepared.
              </p>
              <Link
                href={'/calendar' as Route}
                className="btn-primary min-h-[3rem] px-8 text-[0.8125rem]"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
