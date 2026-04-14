'use client';

import { ShieldCheck } from 'lucide-react';

interface Verification {
  association_name: string;
  status: string;
  expires_at?: string | null;
}

interface VerifiedBadgesProps {
  verifications: Verification[];
  authProvider?: string | null;
  linkedinUrl?: string | null;
  size?: 'sm' | 'md';
  showLinkedIn?: boolean;
}

export function VerifiedBadges({ verifications, authProvider, linkedinUrl, size = 'md', showLinkedIn = true }: VerifiedBadgesProps) {
  const activeVerifications = verifications.filter(
    (v) => v.status === 'verified' && (!v.expires_at || new Date(v.expires_at) > new Date())
  );

  const isLinkedIn = authProvider === 'linkedin_oidc';
  const isSm = size === 'sm';

  if (activeVerifications.length === 0 && !isLinkedIn) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {/* LinkedIn verified */}
      {showLinkedIn && isLinkedIn && (
        linkedinUrl ? (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className={`group inline-flex items-center gap-1 rounded-full bg-[#0077B5]/10 font-bold text-[#0077B5] transition hover:bg-[#0077B5]/20 ${isSm ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'}`}
            style={{ border: '1px solid rgba(0,119,181,0.2)' }}
          >
            <LinkedInMiniIcon size={isSm ? 10 : 12} />
            LinkedIn
            <svg className={`opacity-50 group-hover:opacity-100 ${isSm ? 'h-2 w-2' : 'h-2.5 w-2.5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        ) : (
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-[#0077B5]/10 font-bold text-[#0077B5] ${isSm ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'}`}
            style={{ border: '1px solid rgba(0,119,181,0.2)' }}
          >
            <LinkedInMiniIcon size={isSm ? 10 : 12} />
            LinkedIn Verified
          </span>
        )
      )}

      {/* Association badges */}
      {activeVerifications.map((v) => (
        <span
          key={v.association_name}
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 font-bold text-emerald-700 shadow-sm ${isSm ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-[11px]'}`}
          style={{ border: '1px solid rgba(16,185,129,0.25)' }}
        >
          <ShieldCheck className={isSm ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
          {v.association_name} Member
        </span>
      ))}
    </div>
  );
}

/** Compact inline badge for use in lists, posts, comments */
export function VerifiedInlineBadge({ verifications, authProvider, size = 'sm' }: { verifications: Verification[]; authProvider?: string | null; size?: 'sm' | 'md' }) {
  const activeCount = verifications.filter(
    (v) => v.status === 'verified' && (!v.expires_at || new Date(v.expires_at) > new Date())
  ).length;

  const isLinkedIn = authProvider === 'linkedin_oidc';
  const isSm = size === 'sm';

  if (activeCount === 0 && !isLinkedIn) return null;

  return (
    <span className="inline-flex items-center gap-1">
      {isLinkedIn && (
        <span className={`inline-flex items-center rounded-full bg-[#0077B5]/10 text-[#0077B5] ${isSm ? 'p-0.5' : 'p-1'}`} title="LinkedIn Verified">
          <LinkedInMiniIcon size={isSm ? 10 : 12} />
        </span>
      )}
      {activeCount > 0 && (
        <span className={`inline-flex items-center gap-0.5 rounded-full bg-emerald-50 text-emerald-600 ${isSm ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'}`} title={`Verified member of ${activeCount} association${activeCount > 1 ? 's' : ''}`}>
          <ShieldCheck className={isSm ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
          {activeCount > 1 && <span className="font-bold">{activeCount}</span>}
        </span>
      )}
    </span>
  );
}

function LinkedInMiniIcon({ size = 12 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 48 48">
      <path fill="currentColor" d="M42 37a5 5 0 01-5 5H11a5 5 0 01-5-5V11a5 5 0 015-5h26a5 5 0 015 5v26z" />
      <path fill="white" d="M12 19h5v17h-5V19zm2.485-2h-.028C12.965 17 12 15.888 12 14.499 12 13.08 12.995 12 14.514 12c1.521 0 2.458 1.08 2.486 2.499C17 15.887 16.035 17 14.485 17zM36 36h-5v-9.099c0-2.198-1.225-3.698-3.192-3.698-1.501 0-2.313 1.012-2.707 1.99-.144.35-.101.858-.101 1.365V36h-5s.07-16 0-17h5v2.616C25.721 21.865 27.085 20 30.1 20c3.386 0 5.9 2.215 5.9 6.978V36z" />
    </svg>
  );
}
