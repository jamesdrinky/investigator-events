import { ImageResponse } from 'next/og';
import { createSupabasePublicServerClient } from '@/lib/supabase/public';
import { getCountryFlag } from '@/lib/utils/location';

export const runtime = 'edge';
export const alt = 'Profile preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: { username: string } }) {
  const supabase = createSupabasePublicServerClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, avatar_url, specialisation, headline, country, bio, profile_color')
    .eq('username', params.username)
    .eq('is_public', true)
    .single();

  if (!profile) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', background: '#06091a', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'white', fontSize: 48 }}>Profile not found</p>
        </div>
      ),
      size,
    );
  }

  const accentColor = profile.profile_color ?? '#3b82f6';
  const flag = profile.country ? getCountryFlag(profile.country) : '';
  const tagline = profile.headline || profile.specialisation || '';
  const initials = (profile.full_name ?? '?')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(145deg, #06091a 0%, #0d1840 50%, #1a1040 100%)',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow using accent color */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '100%',
            background: `radial-gradient(ellipse, ${accentColor}30, transparent 60%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-50px',
            width: '500px',
            height: '500px',
            borderRadius: '100%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.15), transparent 60%)',
          }}
        />

        {/* Top bar */}
        <div style={{ display: 'flex', position: 'absolute', top: '40px', left: '70px', right: '70px', justifyContent: 'space-between', alignItems: 'center' }}>
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
              alignItems: 'center',
              gap: '8px',
              borderRadius: '100px',
              background: `${accentColor}25`,
              border: `1px solid ${accentColor}40`,
              padding: '8px 18px',
            }}
          >
            <span style={{ color: accentColor, fontSize: '14px', fontWeight: 600 }}>
              Investigator Profile
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px', flex: 1, marginTop: '40px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', position: 'relative' }}>
            {/* Glow ring */}
            <div
              style={{
                position: 'absolute',
                inset: '-6px',
                borderRadius: '100%',
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                filter: 'blur(12px)',
                opacity: 0.5,
              }}
            />
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '100%',
                border: `4px solid ${accentColor}60`,
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
              }}
            >
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  width={180}
                  height={180}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '64px', fontWeight: 700, color: 'white' }}>{initials}</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
            <h1
              style={{
                color: 'white',
                fontSize: (profile.full_name?.length ?? 0) > 24 ? '48px' : '56px',
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              {profile.full_name ?? profile.username}
            </h1>

            {tagline && (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '22px', margin: 0, lineHeight: 1.4, maxWidth: '600px' }}>
                {tagline.length > 80 ? tagline.slice(0, 80) + '...' : tagline}
              </p>
            )}

            {/* Details chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              {profile.country && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '10px 18px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{flag}</span>
                  <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
                    {profile.country}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '100px',
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                  padding: '10px 22px',
                }}
              >
                <span style={{ color: 'white', fontSize: '15px', fontWeight: 700 }}>View Full Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
