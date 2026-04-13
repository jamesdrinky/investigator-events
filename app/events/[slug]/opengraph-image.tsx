import { ImageResponse } from 'next/og';
import { fetchEventBySlug } from '@/lib/data/events';
import { formatEventDate } from '@/lib/utils/date';
import { getCountryFlag } from '@/lib/utils/location';

export const runtime = 'edge';
export const alt = 'Event preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: { slug: string } }) {
  const event = await fetchEventBySlug(params.slug);

  if (!event) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', background: '#06091a', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'white', fontSize: 48 }}>Event not found</p>
        </div>
      ),
      size,
    );
  }

  const flag = getCountryFlag(event.country);
  const dateStr = formatEventDate(event);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(145deg, #06091a 0%, #0d1840 50%, #1a1040 100%)',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '-80px',
            width: '500px',
            height: '500px',
            borderRadius: '100%',
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.25), transparent 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            right: '-60px',
            width: '500px',
            height: '500px',
            borderRadius: '100%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.2), transparent 60%)',
          }}
        />

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '100px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              padding: '8px 20px',
            }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px rgba(34,211,238,0.5)' }} />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
              Investigator Events
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              borderRadius: '100px',
              background: 'rgba(59,130,246,0.2)',
              padding: '8px 18px',
            }}
          >
            <span style={{ color: '#93c5fd', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
              {event.category}
            </span>
          </div>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', marginTop: '-20px' }}>
          <h1
            style={{
              color: 'white',
              fontSize: event.title.length > 40 ? '52px' : '64px',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              maxWidth: '900px',
              margin: 0,
            }}
          >
            {event.title}
          </h1>

          {/* Details row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '28px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                padding: '12px 20px',
              }}
            >
              <span style={{ fontSize: '18px', color: '#22d3ee', fontWeight: 700 }}>{dateStr}</span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.06)',
                padding: '12px 20px',
              }}
            >
              <span style={{ fontSize: '22px' }}>{flag}</span>
              <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
                {event.city}, {event.country}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '15px' }}>Hosted by</span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', fontWeight: 600 }}>
              {event.association || event.organiser}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '100px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              padding: '10px 24px',
            }}
          >
            <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>View Event Details</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
