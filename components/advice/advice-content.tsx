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
}: {
  title: string;
  detail: string;
  accentColor: string;
  icon: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <li
      style={{
        borderBottom: '1px solid #141414',
        padding: '1.5rem 0.75rem',
        backgroundColor: hovered ? '#0f0f0f' : 'transparent',
        transition: 'background-color 0.15s ease',
        cursor: 'default',
        listStyle: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
        <span
          style={{
            color: accentColor,
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
            marginTop: '0.3rem',
            opacity: hovered ? 1 : 0.65,
            transition: 'opacity 0.15s ease',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {icon}
        </span>
        <div>
          <p
            style={{
              margin: '0 0 0.375rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: '#ede8e0',
              lineHeight: 1.35,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            {title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: '#5e5850',
              lineHeight: 1.8,
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

function CtaButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={'/calendar' as Route}
      style={{
        display: 'inline-block',
        backgroundColor: hovered ? '#c9a227' : '#d4af37',
        color: '#0a0a0a',
        padding: '0.9rem 2.5rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'background-color 0.15s ease, transform 0.15s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Browse Events
    </Link>
  );
}

export function AdviceContent() {
  return (
    <main
      style={{
        backgroundColor: '#0a0a0a',
        minHeight: '100vh',
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: '#e8e0d0',
      }}
    >
      {/* Hero */}
      <section
        style={{
          borderBottom: '1px solid #1e1e1e',
          padding: 'clamp(3rem, 8vw, 5rem) 1.5rem clamp(2.5rem, 6vw, 4rem)',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              color: '#d4af37',
              fontSize: '0.7rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            Field Intelligence
          </p>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              fontWeight: 400,
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              color: '#f5f0e8',
              letterSpacing: '-0.01em',
            }}
          >
            How to work a conference
          </h1>
          <div
            style={{
              width: '2.5rem',
              height: '1px',
              backgroundColor: '#d4af37',
              margin: '0 auto 1.75rem',
              opacity: 0.5,
            }}
          />
          <p
            style={{
              fontSize: '1.0625rem',
              color: '#7a7068',
              maxWidth: '42rem',
              margin: '0 auto',
              lineHeight: 1.8,
            }}
          >
            For investigators attending forensic, fraud, and intelligence conferences. Not theory —
            the things that actually make or break how you come across in a room full of peers.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 28rem), 1fr))',
            gap: '0 4rem',
            alignItems: 'start',
          }}
        >
          {/* Dos */}
          <div>
            <div
              style={{
                position: 'sticky',
                top: '4.75rem',
                backgroundColor: '#0a0a0a',
                zIndex: 10,
                borderBottom: '1px solid #1f3a1f',
                padding: '2rem 0.75rem 1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.375rem',
                    height: '1.375rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    color: '#4caf50',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  ✓
                </span>
                <h2
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#4caf50',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontFamily: 'system-ui, sans-serif',
                    margin: 0,
                  }}
                >
                  Do
                </h2>
              </div>
            </div>

            <ul style={{ margin: 0, padding: 0 }}>
              {dos.map((item, i) => (
                <AdviceRow
                  key={i}
                  title={item.title}
                  detail={item.detail}
                  accentColor="#4caf50"
                  icon="✓"
                />
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div>
            <div
              style={{
                position: 'sticky',
                top: '4.75rem',
                backgroundColor: '#0a0a0a',
                zIndex: 10,
                borderBottom: '1px solid #3a1f1f',
                padding: '2rem 0.75rem 1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '1.375rem',
                    height: '1.375rem',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(229, 57, 53, 0.1)',
                    color: '#e53935',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  ✕
                </span>
                <h2
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#e53935',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontFamily: 'system-ui, sans-serif',
                    margin: 0,
                  }}
                >
                  Don&apos;t
                </h2>
              </div>
            </div>

            <ul style={{ margin: 0, padding: 0 }}>
              {donts.map((item, i) => (
                <AdviceRow
                  key={i}
                  title={item.title}
                  detail={item.detail}
                  accentColor="#e53935"
                  icon="✕"
                />
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ height: '1px', backgroundColor: '#141414' }} />
      </div>

      {/* CTA */}
      <section style={{ padding: 'clamp(4rem, 8vw, 6rem) 1.5rem' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: '1px',
              height: '3rem',
              backgroundColor: '#d4af37',
              margin: '0 auto 2.5rem',
              opacity: 0.45,
            }}
          />
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 400,
              color: '#f5f0e8',
              marginBottom: '1rem',
              lineHeight: 1.3,
            }}
          >
            Find your next conference
          </h2>
          <p
            style={{
              color: '#5e5850',
              fontSize: '0.9375rem',
              lineHeight: 1.8,
              marginBottom: '2.5rem',
            }}
          >
            Browse upcoming forensic, fraud, and investigative events. Filter by region, specialism,
            and date — then go in prepared.
          </p>
          <CtaButton />
        </div>
      </section>
    </main>
  );
}
