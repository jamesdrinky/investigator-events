import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/types/database';

type SubmissionRow = Database['public']['Tables']['event_submissions']['Row'];
export type EventSubmissionInsert = Database['public']['Tables']['event_submissions']['Insert'];

export interface EventSubmissionItem {
  id: string;
  eventName: string;
  organiser: string;
  city: string;
  region: string;
  country: string;
  startDate: string;
  endDate?: string;
  category: string;
  website: string;
  contactEmail: string;
  notes?: string;
  eventScope: 'main' | 'secondary';
  status: SubmissionRow['status'];
  createdAt: string;
}

function mapSubmissionRow(row: SubmissionRow): EventSubmissionItem {
  return {
    id: row.id,
    eventName: row.event_name,
    organiser: row.organiser,
    city: row.city,
    region: row.region,
    country: row.country,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    category: row.category,
    website: row.website,
    contactEmail: row.contact_email,
    notes: row.notes ?? undefined,
    eventScope: row.event_scope as 'main' | 'secondary',
    status: row.status,
    createdAt: row.created_at
  };
}

export async function fetchPendingEventSubmissions(): Promise<EventSubmissionItem[]> {
  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await supabase
    .from('event_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('start_date', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch event submissions: ${error.message}`);
  }

  return ((data ?? []) as SubmissionRow[]).map(mapSubmissionRow);
}
