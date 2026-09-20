import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import type { EventAssociation } from '@/lib/data/events';
import { findAssociationRecordByLabel, getAssociationLogoSrc } from '@/lib/data/associations';

/**
 * Association logos for an event, capped so a four-patron event does not
 * turn a card into a row of unreadable 18px marks.
 *
 *   full   — event page. Every association, logo + name, roles grouped.
 *   stack  — cards. Up to `max` overlapping marks then a +N chip, the same
 *            geometry the attendee avatars already use, so it reads as
 *            native rather than bolted on.
 *
 * One logo reads as ownership, two as partnership, four as a committee —
 * past three, a count says more than the marks themselves.
 */

const ROLE_LABEL: Record<EventAssociation['role'], string> = {
  host: 'Host',
  'co-host': 'Co-host',
  patron: 'Under the patronage of',
  supporter: 'Supported by',
};

function logoFor(label: string) {
  return getAssociationLogoSrc(label);
}

export function AssociationLogoStack({
  associations,
  max = 3,
  size = 24,
}: {
  associations: EventAssociation[];
  max?: number;
  size?: number;
}) {
  if (!associations.length) return null;

  const shown = associations.slice(0, max);
  const extra = associations.length - shown.length;

  return (
    <span className="inline-flex items-center">
      {shown.map((a, i) => {
        const src = logoFor(a.label);
        return (
          <span
            key={a.label}
            title={a.label}
            className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white"
            style={{ width: size, height: size, marginLeft: i === 0 ? 0 : -size / 3, zIndex: max - i }}
          >
            {src ? (
              <Image src={src} alt={a.label} width={size} height={size} className="h-full w-full object-contain p-0.5" />
            ) : (
              <span className="text-[9px] font-bold text-slate-500">{a.label.slice(0, 2).toUpperCase()}</span>
            )}
          </span>
        );
      })}
      {extra > 0 && (
        <span
          className="inline-flex shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-600"
          style={{ width: size, height: size, marginLeft: -size / 3 }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}

export function AssociationLogoRow({ associations }: { associations: EventAssociation[] }) {
  if (!associations.length) return null;

  // Group by role so "Under the patronage of" reads once, not four times.
  const order: EventAssociation['role'][] = ['host', 'co-host', 'patron', 'supporter'];
  const groups = order
    .map((role) => ({ role, items: associations.filter((a) => a.role === role) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-3">
      {groups.map(({ role, items }) => (
        <div key={role}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {ROLE_LABEL[role]}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {items.map((a) => {
              const record = findAssociationRecordByLabel(a.label);
              const src = logoFor(a.label);
              const inner = (
                <span className="inline-flex items-center gap-2">
                  {src && (
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
                      <Image src={src} alt="" width={28} height={28} className="h-full w-full object-contain p-0.5" />
                    </span>
                  )}
                  <span className="text-sm font-semibold text-slate-700">{a.label}</span>
                </span>
              );
              return record ? (
                <Link
                  key={a.label}
                  href={`/associations/${record.slug}` as Route}
                  className="transition hover:opacity-70"
                >
                  {inner}
                </Link>
              ) : (
                <span key={a.label}>{inner}</span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
