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
      className={`inline-flex max-w-full items-center gap-2 rounded-[1rem] border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] text-slate-800 shadow-[0_22px_44px_-28px_rgba(8,17,32,0.34)] backdrop-blur-xl ${
        compact ? 'max-w-[10rem] px-2.5 py-1.5' : 'px-3 py-2'
      } ${className}`}
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
        <span className={`truncate font-semibold uppercase text-slate-800 ${compact ? 'max-w-[6.25rem] text-[9px] tracking-[0.16em]' : 'max-w-[8rem] text-[10px] tracking-[0.2em]'}`}>
          {fallbackLabel}
        </span>
      )}
      <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 ${compact ? 'hidden' : 'hidden sm:inline'}`}>Host</span>
    </div>
  );
}
