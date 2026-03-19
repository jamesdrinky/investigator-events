import type { EventItem } from '@/lib/data/events';

interface CategoryIconProps {
  category: EventItem['category'] | string;
  className?: string;
}

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase();
}

export function CategoryIcon({ category, className = 'h-4 w-4' }: CategoryIconProps) {
  const normalized = normalizeCategory(category);
  const strokeProps = {
    stroke: 'currentColor',
    strokeWidth: 1.7,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const
  };

  if (normalized.includes('training')) {
    return (
      <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
        <path d="M3.5 6.5L10 3l6.5 3.5L10 10 3.5 6.5Z" {...strokeProps} />
        <path d="M6 8.1v4.6c0 .8 1.8 2.3 4 2.3s4-1.5 4-2.3V8.1" {...strokeProps} />
      </svg>
    );
  }

  if (normalized.includes('association')) {
    return (
      <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
        <circle cx="6" cy="8" r="2" {...strokeProps} />
        <circle cx="14" cy="8" r="2" {...strokeProps} />
        <path d="M3.5 15c.7-1.8 2.2-3 4.5-3s3.8 1.2 4.5 3" {...strokeProps} />
        <path d="M9.5 15c.6-1.6 2-2.5 4-2.5 1.5 0 2.7.5 3.5 2" {...strokeProps} />
      </svg>
    );
  }

  if (normalized.includes('vendor') || normalized.includes('expo')) {
    return (
      <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
        <path d="M4 6.5h12V15H4z" {...strokeProps} />
        <path d="M7 6.5V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.5" {...strokeProps} />
        <path d="M4 10h12" {...strokeProps} />
      </svg>
    );
  }

  if (normalized.includes('webinar')) {
    return (
      <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
        <rect x="3.5" y="4.5" width="13" height="9" rx="1.5" {...strokeProps} />
        <path d="M8 16h4" {...strokeProps} />
        <path d="M10 13.5V16" {...strokeProps} />
        <path d="M8.2 8.4a2.6 2.6 0 0 1 3.6 0" {...strokeProps} />
        <path d="M6.4 6.7a5.1 5.1 0 0 1 7.2 0" {...strokeProps} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M6 4.5h8M6 15.5h8" {...strokeProps} />
      <path d="M4.5 7.5h11M5.5 12h9" {...strokeProps} />
      <rect x="3.5" y="3.5" width="13" height="13" rx="2" {...strokeProps} />
    </svg>
  );
}
