'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, ChevronUp, Copy, ExternalLink, Link2, Loader2, Mail } from 'lucide-react';
import { updateAssociationOutreachAction } from '@/app/admin/outreach/actions';
import {
  buildAssociationPitchEmail,
  buildAssociationPitchSubject,
  buildConsoleFollowUpEmail,
  buildConsoleFollowUpSubject,
  buildConsolePitchEmail,
  buildConsolePitchSubject,
} from '@/lib/outreach/templates';

export interface AssociationPitchRow {
  slug: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  website: string;
  upcomingCount: number;
  status: 'not_started' | 'sent' | 'replied' | 'widget_live' | 'partner' | 'declined';
  contactName: string;
  contactEmail: string;
  notes: string;
  lastContactedAt: string | null;
  hasConsolePage: boolean;
  priorSendAt: string | null;
}

const STATUS_META: Record<AssociationPitchRow['status'], { label: string; classes: string }> = {
  not_started: { label: 'Not started', classes: 'bg-slate-100 text-slate-600' },
  sent: { label: 'Pitched', classes: 'bg-blue-100 text-blue-700' },
  replied: { label: 'Replied', classes: 'bg-amber-100 text-amber-700' },
  widget_live: { label: 'Widget live ✓', classes: 'bg-emerald-100 text-emerald-700' },
  partner: { label: 'Partner ★', classes: 'bg-violet-100 text-violet-700' },
  declined: { label: 'Declined', classes: 'bg-rose-100 text-rose-600' },
};

const STATUS_ORDER: AssociationPitchRow['status'][] = [
  'not_started',
  'sent',
  'replied',
  'widget_live',
  'partner',
  'declined',
];

type Filter = 'todo' | AssociationPitchRow['status'] | 'all';
type TemplateKey = 'console' | 'followup' | 'original';

export function AssociationPitchQueue({ rows }: { rows: AssociationPitchRow[] }) {
  const [filter, setFilter] = useState<Filter>('todo');
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length, todo: 0 };
    for (const s of STATUS_ORDER) c[s] = 0;
    for (const r of rows) {
      c[r.status] += 1;
      if (r.status === 'not_started') c.todo += 1;
    }
    return c;
  }, [rows]);

  const visible = rows.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'todo') return r.status === 'not_started';
    return r.status === filter;
  });

  const filters: { key: Filter; label: string }[] = [
    { key: 'todo', label: `To pitch (${counts.todo})` },
    { key: 'sent', label: `Pitched (${counts.sent})` },
    { key: 'replied', label: `Replied (${counts.replied})` },
    { key: 'widget_live', label: `Widget live (${counts.widget_live})` },
    { key: 'partner', label: `Partners (${counts.partner})` },
    { key: 'all', label: `All (${counts.all})` },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              filter === f.key
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Nothing in this filter.
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((row) => (
            <PitchRow
              key={row.slug}
              row={row}
              expanded={expanded === row.slug}
              onToggle={() => setExpanded(expanded === row.slug ? null : row.slug)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function PitchRow({ row, expanded, onToggle }: { row: AssociationPitchRow; expanded: boolean; onToggle: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [contactName, setContactName] = useState(row.contactName);
  const [contactEmail, setContactEmail] = useState(row.contactEmail);
  const [notes, setNotes] = useState(row.notes);
  const [copied, setCopied] = useState<string | null>(null);

  const partnerUrl = `https://www.investigatorevents.com/partners/${row.slug}`;
  const consoleUrl = `https://www.investigatorevents.com/associations/${row.slug}/manage`;
  const meta = STATUS_META[row.status];

  // Steer the template: already-contacted associations (tracker status OR a
  // send in the outreach ledger) get the follow-up; fresh ones get the
  // console pitch; associations without a console page fall back to the
  // original widget pitch.
  const alreadyContacted = row.priorSendAt !== null || row.status === 'sent' || row.status === 'replied';
  const defaultTemplate: TemplateKey = !row.hasConsolePage ? 'original' : alreadyContacted ? 'followup' : 'console';
  const [template, setTemplate] = useState<TemplateKey>(defaultTemplate);

  const templateSubject =
    template === 'console'
      ? buildConsolePitchSubject(row.name)
      : template === 'followup'
        ? buildConsoleFollowUpSubject(row.name)
        : buildAssociationPitchSubject(row.name);
  const templateBody =
    template === 'console'
      ? buildConsolePitchEmail(row.name, partnerUrl, consoleUrl, row.upcomingCount, contactName)
      : template === 'followup'
        ? buildConsoleFollowUpEmail(row.name, partnerUrl, consoleUrl, contactName)
        : buildAssociationPitchEmail(row.name, partnerUrl, row.upcomingCount, contactName);

  const save = (status: AssociationPitchRow['status']) => {
    const fd = new FormData();
    fd.set('associationSlug', row.slug);
    fd.set('status', status);
    fd.set('contactName', contactName);
    fd.set('contactEmail', contactEmail);
    fd.set('notes', notes);
    startTransition(() => {
      void updateAssociationOutreachAction(fd);
    });
  };

  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <li className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button onClick={onToggle} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{row.name}</p>
          <p className="truncate text-xs text-slate-500">
            {row.country} · {row.region} ·{' '}
            {row.upcomingCount > 0 ? `${row.upcomingCount} upcoming events tracked` : 'no upcoming events tracked'}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${meta.classes}`}>{meta.label}</span>
        {isPending ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
        ) : expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link
              href={`/partners/${row.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              Their magic link <ExternalLink className="h-3 w-3" />
            </Link>
            {row.website && (
              <a
                href={row.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Their website <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {row.lastContactedAt && (
              <span className="text-slate-400">
                Last pitched {new Date(row.lastContactedAt).toLocaleDateString('en-GB')}
              </span>
            )}
            {row.priorSendAt && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-600">
                emailed before ({new Date(row.priorSendAt).toLocaleDateString('en-GB')}) — follow-up preselected
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact name (president / secretary)"
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
            <input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Contact email"
              type="email"
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes — who Mike knows there, replies, next steps…"
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          />

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-slate-200 p-0.5 text-[11px] font-semibold">
              {(
                [
                  row.hasConsolePage && ['console', 'Console pitch'],
                  row.hasConsolePage && ['followup', 'Follow-up'],
                  ['original', 'Original'],
                ].filter(Boolean) as [TemplateKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTemplate(key)}
                  className={`rounded-full px-2.5 py-1 transition ${template === key ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => copy('email', templateBody)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                copied === 'email' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-700'
              }`}
            >
              {copied === 'email' ? <Check className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
              {copied === 'email' ? 'Email copied' : "Copy Mike's email"}
            </button>
            <button
              onClick={() => copy('subject', templateSubject)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                copied === 'subject'
                  ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {copied === 'subject' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              Subject
            </button>
            <button
              onClick={() => copy('link', partnerUrl)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                copied === 'link'
                  ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {copied === 'link' ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              Magic link
            </button>

            <div className="ml-auto flex flex-wrap gap-1.5">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => save(s)}
                  disabled={isPending}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                    row.status === s
                      ? STATUS_META[s].classes + ' ring-1 ring-inset ring-current'
                      : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
