'use client';

import { useState } from 'react';
import { Zap, ClipboardPaste, ArrowRight, ExternalLink, Check } from 'lucide-react';

const KNOWN_ASSOCIATIONS = [
  'ABI','WAD','IKD','CII','Intellenet','FEDERPOL','BuDEG','SNARP','EURODET',
  'NCAPI','NCISS','FALI','CALI','TALI','FEWA','NFES','PSLD','LIDEPPE',
  'ANDR','HDA','IBPI','DAF','SYL','FDDE','CKDS','FAPI','FSPD','SFPP',
  'APDPE','APDU','CODPCAT','IAIACE','DeZRS','SAD','ARD','PDPR','ODV','NALI','ALDONYS','WAPI','SPI',
];

// Event-specific URLs override the default association website when available
const ASSOC_EVENT_URLS: Record<string, string> = {
  'ABI': 'https://www.theabi.org.uk/events',
  'WAD': 'https://www.wad.net/conferences-events',
  'CII': 'https://www.cii2.org/index.php?option=com_content&view=article&catid=19:site-content&id=38:events',
  'Intellenet': 'https://intellenet.org/Annual-Conference',
  'CALI': 'https://www.cali-pi.org/events',
  'FALI': 'https://www.fali.org/page/FALICONFERENCE',
  'TALI': 'https://members.tali.org/event-calendar',
  'NCISS': 'https://www.nciss.org/events',
  'FEWA': 'https://forensic.org/events/event_list.asp',
  'ALDONYS': 'https://aldonys.org/meetinginfo.php',
};

// Simple date extraction — looks for patterns like "22-26 April 2026", "Apr 17, 2026", "2026-04-22", etc.
function extractDates(text: string): { start?: string; end?: string } {
  // ISO format: 2026-04-22
  const isoMatch = text.match(/(\d{4}-\d{2}-\d{2})/g);
  if (isoMatch && isoMatch.length >= 1) {
    return { start: isoMatch[0], end: isoMatch[1] };
  }

  // "17-18 April 2026" or "17–18 April 2026"
  const rangeMatch = text.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
  if (rangeMatch) {
    const months: Record<string, string> = { january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12' };
    const m = months[rangeMatch[3].toLowerCase()];
    const y = rangeMatch[4];
    return {
      start: `${y}-${m}-${rangeMatch[1].padStart(2,'0')}`,
      end: `${y}-${m}-${rangeMatch[2].padStart(2,'0')}`,
    };
  }

  // "April 17, 2026" or "17 April 2026"
  const singleMatch = text.match(/(?:(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})|(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4}))/i);
  if (singleMatch) {
    const months: Record<string, string> = { january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12' };
    if (singleMatch[1]) {
      const m = months[singleMatch[2].toLowerCase()];
      return { start: `${singleMatch[3]}-${m}-${singleMatch[1].padStart(2,'0')}` };
    }
    if (singleMatch[4]) {
      const m = months[singleMatch[4].toLowerCase()];
      return { start: `${singleMatch[6]}-${m}-${singleMatch[5].padStart(2,'0')}` };
    }
  }

  return {};
}

function extractUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s<>"']+/);
  return match?.[0];
}

function extractAssociation(text: string): string | undefined {
  const upper = text.toUpperCase();
  return KNOWN_ASSOCIATIONS.find((a) => upper.includes(a.toUpperCase()));
}

function extractCity(text: string): string | undefined {
  // Look for "City, Country" or "in City" patterns
  const inMatch = text.match(/(?:in|at|held in|venue[:\s]+)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/);
  if (inMatch) return inMatch[1];
  return undefined;
}

interface ParsedEvent {
  title: string;
  startDate: string;
  endDate: string;
  city: string;
  country: string;
  association: string;
  website: string;
  organiser: string;
  description: string;
}

function parseText(raw: string): Partial<ParsedEvent> {
  const dates = extractDates(raw);
  const url = extractUrl(raw);
  const assoc = extractAssociation(raw);
  const city = extractCity(raw);

  // First line is usually the title
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0]?.slice(0, 140) ?? '';

  return {
    title,
    startDate: dates.start ?? '',
    endDate: dates.end ?? '',
    city: city ?? '',
    association: assoc ?? '',
    website: url ?? '',
    organiser: assoc ?? '',
    description: raw.slice(0, 500),
  };
}

export function QuickAddEvent({ associationUrls }: { associationUrls?: Record<string, string> }) {
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<Partial<ParsedEvent> | null>(null);
  const [showAssocLinks, setShowAssocLinks] = useState(false);

  // Merge: event-specific URLs override base association websites
  const allAssocUrls = { ...(associationUrls ?? {}), ...ASSOC_EVENT_URLS };

  const handleParse = () => {
    if (!raw.trim()) return;
    const result = parseText(raw);
    setParsed(result);
  };

  const handleUse = () => {
    if (!parsed) return;
    const setVal = (name: string, val: string) => {
      const el = document.querySelector(`#create-${name}`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
      if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
    };
    if (parsed.title) setVal('title', parsed.title);
    if (parsed.startDate) setVal('date', parsed.startDate);
    if (parsed.endDate) setVal('end-date', parsed.endDate);
    if (parsed.city) setVal('city', parsed.city);
    if (parsed.association) setVal('association', parsed.association);
    if (parsed.organiser) setVal('organiser', parsed.organiser);
    if (parsed.website) setVal('website', parsed.website);
    if (parsed.description) setVal('description', parsed.description);
    document.querySelector('#create-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setRaw('');
    setParsed(null);
  };

  return (
    <div className="space-y-4">
      {/* Association quick links */}
      <div>
        <button
          type="button"
          onClick={() => setShowAssocLinks(!showAssocLinks)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
        >
          <ExternalLink className="h-4 w-4" />
          {showAssocLinks ? 'Hide' : 'Show'} association events pages
        </button>

        {showAssocLinks && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(allAssocUrls).sort(([a], [b]) => a.localeCompare(b)).map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="font-bold text-slate-900">{name}</span>
                <ExternalLink className="ml-auto h-3 w-3 text-slate-400" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Paste area */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ClipboardPaste className="h-4 w-4" />
          Paste event details from any source
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Copy text from an association website, email, or anywhere. Paste it below and we'll extract the event details.
        </p>
        <textarea
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setParsed(null); }}
          placeholder="Paste event details here — title, dates, location, website, anything..."
          rows={5}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
        <button
          type="button"
          onClick={handleParse}
          disabled={!raw.trim()}
          className="mt-2 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
        >
          <Zap className="h-4 w-4" /> Extract event details
        </button>
      </div>

      {/* Parsed preview */}
      {parsed && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Extracted</p>
          <div className="mt-3 grid gap-2 text-sm">
            {parsed.title && <div><span className="font-medium text-slate-500">Title:</span> <span className="font-semibold text-slate-900">{parsed.title}</span></div>}
            {parsed.startDate && <div><span className="font-medium text-slate-500">Start:</span> <span className="text-slate-900">{parsed.startDate}</span></div>}
            {parsed.endDate && <div><span className="font-medium text-slate-500">End:</span> <span className="text-slate-900">{parsed.endDate}</span></div>}
            {parsed.city && <div><span className="font-medium text-slate-500">City:</span> <span className="text-slate-900">{parsed.city}</span></div>}
            {parsed.association && <div><span className="font-medium text-slate-500">Association:</span> <span className="font-bold text-blue-600">{parsed.association}</span></div>}
            {parsed.website && <div><span className="font-medium text-slate-500">Website:</span> <a href={parsed.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{parsed.website}</a></div>}
            {!parsed.title && !parsed.startDate && !parsed.association && (
              <p className="text-xs text-amber-600">Couldn't extract much — try pasting more detailed text, or fill in the form manually below.</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleUse}
            className="mt-3 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Check className="h-4 w-4" /> Use these details in form below
          </button>
        </div>
      )}
    </div>
  );
}
