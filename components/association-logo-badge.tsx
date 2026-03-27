import Image from 'next/image';
import { findAssociationBranding, getAssociationBadgeLabel, getAssociationBrandLogoSrc } from '@/lib/utils/association-branding';

interface AssociationLogoBadgeProps {
  associationName?: string;
  className?: string;
  compact?: boolean;
  mini?: boolean;
  tone?: 'light' | 'dark';
  overlay?: boolean;
  labelHidden?: boolean;
}

export function AssociationLogoBadge({
  associationName,
  className = '',
  compact = false,
  mini = false,
  tone = 'light',
  overlay = false,
  labelHidden = false
}: AssociationLogoBadgeProps) {
  if (!associationName) {
    return null;
  }

  const associationRecord = findAssociationBranding(associationName);
  const logoSrc = getAssociationBrandLogoSrc(associationName);
  const badgeLabel = getAssociationBadgeLabel(associationName);
  const shouldShowLogo = Boolean(logoSrc && !mini);
  const shellClasses =
    tone === 'dark'
      ? 'border-slate-950/18 bg-[rgba(15,23,42,0.82)] text-white shadow-[0_24px_44px_-28px_rgba(15,23,42,0.72)] backdrop-blur-md'
      : 'border-white/82 bg-[rgba(255,255,255,0.86)] text-slate-950 shadow-[0_20px_40px_-24px_rgba(8,17,32,0.34)] backdrop-blur-md';
  const tokenClasses =
    tone === 'dark'
      ? 'border-white/10 bg-white/10 text-white'
      : 'border-slate-200/70 bg-white/94 text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]';
  const labelClasses = tone === 'dark' ? 'text-white/90' : 'text-slate-800';
  const glowClasses = overlay
    ? 'before:pointer-events-none before:absolute before:inset-[-3px] before:-z-10 before:rounded-[1rem] before:bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.28),transparent_46%),radial-gradient(circle_at_82%_28%,rgba(124,58,237,0.2),transparent_42%)] before:opacity-100'
    : '';

  return (
    <div
      className={`relative inline-flex max-w-full items-center gap-2 rounded-[1rem] border ${shellClasses} ${glowClasses} ${
        mini ? 'px-2 py-1' : compact ? 'px-2.5 py-1.5' : 'px-3 py-2'
      } ${className}`}
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-[0.8rem] border ${tokenClasses} ${
          mini
            ? 'h-6 min-w-6 px-1.5 text-[9px]'
            : shouldShowLogo
              ? compact
                ? 'h-7 min-w-[3.35rem] px-2.5'
                : 'h-8 min-w-[3.9rem] px-3'
              : compact
                ? 'h-7 min-w-7 px-2 text-[10px]'
                : 'h-8 min-w-8 px-2 text-[11px]'
        } font-semibold uppercase tracking-[0.16em]`}
      >
        {shouldShowLogo ? (
          <Image
            src={logoSrc!}
            alt={`${associationRecord?.name ?? associationName} logo`}
            width={compact ? 68 : 84}
            height={compact ? 24 : 28}
            className={`w-auto object-contain ${tone === 'dark' ? 'brightness-[3.2] contrast-125' : 'contrast-110 saturate-110'} ${
              compact ? 'h-[1.05rem] max-w-[2.7rem]' : 'h-[1.2rem] max-w-[3.3rem]'
            }`}
          />
        ) : (
          badgeLabel
        )}
      </span>
      {!mini && !labelHidden ? (
        <span className={`truncate font-semibold ${labelClasses} ${compact ? 'max-w-[7rem] text-[10px]' : 'max-w-[8.5rem] text-xs'}`}>
          {associationRecord?.shortName ?? associationName}
        </span>
      ) : null}
    </div>
  );
}
