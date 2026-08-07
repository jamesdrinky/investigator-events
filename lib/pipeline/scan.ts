// Automated event pipeline — scans monitored source pages (association sites,
// conference pages), extracts structured events with Claude, dedupes against
// the live calendar and existing drafts, and queues the rest for admin review.
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { slugifyEventTitle } from '@/lib/utils/event-slugs';

const REGIONS = ['Europe', 'North America', 'Asia-Pacific', 'Middle East', 'Latin America', 'Africa'] as const;
const CATEGORIES = [
  'Conference',
  'Annual Conference',
  'Association Meeting',
  'Regional Meeting',
  'Seminar',
  'Training',
  'Summit',
  'Expo',
  'Networking',
  'AGM',
] as const;

const ExtractedEventSchema = z.object({
  title: z.string(),
  start_date: z.string().nullable().describe('YYYY-MM-DD, or null if the page gives no resolvable date'),
  end_date: z.string().nullable().describe('YYYY-MM-DD, only when the event spans multiple days'),
  city: z.string().nullable(),
  country: z.string().nullable(),
  region: z.enum(REGIONS).nullable(),
  organiser: z.string().nullable(),
  category: z.enum(CATEGORIES).nullable(),
  description: z.string().nullable().describe('1-3 sentence factual summary written from the page content'),
  website: z.string().nullable().describe('Absolute URL for the event page, if linked'),
  confidence: z.enum(['high', 'medium', 'low']).describe('How certain the extraction is, given the page content'),
});

const ExtractionSchema = z.object({
  events: z.array(ExtractedEventSchema),
});

export type ExtractedEvent = z.infer<typeof ExtractedEventSchema>;

export interface SourceRow {
  id: string;
  name: string;
  url: string;
  association: string | null;
  country_hint: string | null;
  region_hint: string | null;
}

/** Strip a fetched HTML page down to readable text for extraction. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Keep link targets — event URLs usually live in hrefs.
    .replace(/<a\s[^>]*href=["']([^"']+)["'][^>]*>/gi, ' [link: $1] ')
    .replace(/<\/(p|div|li|tr|h[1-6]|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#?\w+;/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractEvents(pageText: string, source: SourceRow): Promise<ExtractedEvent[]> {
  const client = new Anthropic();
  const today = new Date().toISOString().slice(0, 10);

  // Large association pages can exceed sensible token budgets; the events we
  // care about are overwhelmingly announced in the first part of the page.
  const clipped = pageText.slice(0, 60_000);

  const response = await client.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 16000,
    system: `You extract professional events (conferences, seminars, trainings, association meetings) for the private-investigation and security industry from web page text. Today's date is ${today}.

Rules:
- Only include real, dated or clearly upcoming events announced on the page. Ignore past events (before ${today}) unless no year is given and the next occurrence is plausibly upcoming — then resolve to the next future date.
- Resolve relative or partial dates to ISO YYYY-MM-DD using today's date. If a date genuinely cannot be resolved, set start_date to null but still include the event when it is clearly upcoming.
- Do not invent details. Fields you cannot find on the page are null.
- Deduplicate: one entry per event, not per mention.
- [link: ...] markers in the text show where anchors pointed; use them to fill the website field with an absolute URL.`,
    messages: [
      {
        role: 'user',
        content: `Source: ${source.name} (${source.url})${source.association ? `\nAssociation: ${source.association}` : ''}${source.country_hint ? `\nLikely country: ${source.country_hint}` : ''}${source.region_hint ? `\nLikely region: ${source.region_hint}` : ''}

Page text:
${clipped}`,
      },
    ],
    output_config: {
      format: zodOutputFormat(ExtractionSchema),
    },
  });

  return response.parsed_output?.events ?? [];
}

export interface ScanResult {
  sourceId: string;
  name: string;
  status: 'ok' | 'fetch_error' | 'extract_error' | 'no_api_key';
  found: number;
  queued: number;
  duplicates: number;
  error?: string;
}

/** Scan one source end-to-end and queue new drafts. */
export async function scanSource(source: SourceRow): Promise<ScanResult> {
  const supabase = createSupabaseAdminServerClient();
  const base: Omit<ScanResult, 'status'> = { sourceId: source.id, name: source.name, found: 0, queued: 0, duplicates: 0 };

  const finish = async (result: ScanResult) => {
    await (supabase.from('event_sources' as any) as any)
      .update({
        last_scanned_at: new Date().toISOString(),
        last_status: result.status,
        last_error: result.error ?? null,
      })
      .eq('id', source.id);
    return result;
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    return finish({ ...base, status: 'no_api_key', error: 'ANTHROPIC_API_KEY not configured' });
  }

  let html: string;
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'InvestigatorEventsBot/1.0 (+https://www.investigatorevents.com)' },
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    return finish({ ...base, status: 'fetch_error', error: err instanceof Error ? err.message : 'fetch failed' });
  }

  let extracted: ExtractedEvent[];
  try {
    extracted = await extractEvents(htmlToText(html), source);
  } catch (err) {
    return finish({ ...base, status: 'extract_error', error: err instanceof Error ? err.message : 'extraction failed' });
  }

  base.found = extracted.length;

  // Dedupe against the live calendar by slug and by title+date.
  const { data: existingEvents } = await supabase.from('events').select('id, title, slug, start_date');
  const existingSlugs = new Map<string, string>();
  for (const e of existingEvents ?? []) {
    existingSlugs.set((e as any).slug ?? slugifyEventTitle((e as any).title), (e as any).id);
  }

  for (const event of extracted) {
    if (!event.title.trim()) continue;
    const titleSlug = slugifyEventTitle(event.title);
    const dedupeKey = `${titleSlug}::${event.start_date ?? 'undated'}`;
    const matchedEventId = existingSlugs.get(titleSlug) ?? null;

    if (matchedEventId) {
      base.duplicates += 1;
      continue;
    }

    const { error } = await (supabase.from('event_drafts' as any) as any).insert({
      source_id: source.id,
      title: event.title.trim(),
      start_date: event.start_date,
      end_date: event.end_date,
      city: event.city,
      region: event.region ?? source.region_hint,
      country: event.country ?? source.country_hint,
      organiser: event.organiser ?? source.association,
      association: source.association,
      category: event.category ?? 'Conference',
      description: event.description,
      website: event.website ?? source.url,
      confidence: event.confidence,
      dedupe_key: dedupeKey,
      matched_event_id: matchedEventId,
    });

    if (error) {
      // Unique violation on dedupe_key → we've already drafted this one.
      base.duplicates += 1;
    } else {
      base.queued += 1;
    }
  }

  if (base.queued > 0) {
    await (supabase.rpc as any)('increment_source_drafts', { sid: source.id, by: base.queued }).then(
      () => {},
      () => {}
    );
  }

  return finish({ ...base, status: 'ok' });
}

/** Scan sources that are due (never scanned, or scanned over 6 days ago). */
export async function scanDueSources(limit = 3): Promise<ScanResult[]> {
  const supabase = createSupabaseAdminServerClient();
  const cutoff = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString();

  const { data: sources } = await (supabase
    .from('event_sources' as any)
    .select('id, name, url, association, country_hint, region_hint')
    .eq('active', true)
    .or(`last_scanned_at.is.null,last_scanned_at.lt.${cutoff}`)
    .order('last_scanned_at', { ascending: true, nullsFirst: true })
    .limit(limit) as any);

  const results: ScanResult[] = [];
  for (const source of (sources ?? []) as SourceRow[]) {
    results.push(await scanSource(source));
  }
  return results;
}
