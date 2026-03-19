import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import type { Database } from '@/lib/types/database';

type AdvertiserLeadRow = Database['public']['Tables']['advertiser_leads']['Row'];

export interface AdvertiserLeadItem {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  website?: string;
  inquiryType: string;
  regionOrAudience?: string;
  message: string;
  status: string;
  createdAt: string;
}

function mapAdvertiserLead(row: AdvertiserLeadRow): AdvertiserLeadItem {
  return {
    id: row.id,
    companyName: row.company_name,
    contactName: row.contact_name,
    email: row.email,
    website: row.website ?? undefined,
    inquiryType: row.inquiry_type,
    regionOrAudience: row.region_or_audience ?? undefined,
    message: row.message,
    status: row.status,
    createdAt: row.created_at
  };
}

export async function fetchAdvertiserLeads(limit = 20): Promise<AdvertiserLeadItem[]> {
  const supabase = createSupabaseAdminServerClient();
  const { data, error } = await supabase
    .from('advertiser_leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch advertiser inquiries: ${error.message}`);
  }

  return ((data ?? []) as AdvertiserLeadRow[]).map(mapAdvertiserLead);
}
