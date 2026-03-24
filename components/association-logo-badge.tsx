import Image from 'next/image';
import { findAssociationBranding, getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';

interface AssociationLogoBadgeProps {
  associationName?: string;
  className?: string;
  compact?: boolean;
}

export function AssociationLogoBadge({
  associationName,
  className = '',
  compact = false
}: AssociationLogoBadgeProps) {
  if (!associationName) {
    return null;
  }

  const associationRecord = findAssociationBranding(associationName);
  const logoSrc = getAssociationBrandLogoSrc(associationName);
  const fallbackLabel = associationRecord?.shortName ?? associationName;

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200/70 bg-white/92 px-3 py-1.5 text-slate-700 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.45)] backdrop-blur-sm ${className}`}
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={`${associationRecord?.name ?? associationName} logo`}
          width={compact ? 68 : 84}
          height={compact ? 26 : 30}
          className={`w-auto object-contain ${compact ? 'h-5' : 'h-6'}`}
        />
      ) : (
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700">{fallbackLabel}</span>
      )}
      <span className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Host</span>
    </div>
  );
}
