import Image from 'next/image';
import { findAssociationBranding, getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';

interface AssociationLogoBadgeProps {
  associationName?: string;
  className?: string;
  compact?: boolean;
}

export function AssociationLogoBadge({ associationName, className = '', compact = false }: AssociationLogoBadgeProps) {
  if (!associationName) {
    return null;
  }

  const associationRecord = findAssociationBranding(associationName);
  const logoSrc = getAssociationBrandLogoSrc(associationName);
  const fallbackLabel = associationRecord?.shortName ?? associationName;

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-[1rem] border border-white/90 bg-white/95 px-3 py-2 text-slate-800 shadow-[0_18px_34px_-24px_rgba(8,17,32,0.4)] backdrop-blur ${className}`}
    >
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={`${associationRecord?.name ?? associationName} logo`}
          width={compact ? 72 : 92}
          height={compact ? 26 : 34}
          className={`w-auto object-contain ${compact ? 'h-5' : 'h-7'}`}
        />
      ) : (
        <span className="max-w-[8rem] truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-800">
          {fallbackLabel}
        </span>
      )}
      <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:inline">Host</span>
    </div>
  );
}
