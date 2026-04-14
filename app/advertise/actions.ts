'use server';

import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import type { AdvertiserFormState } from '@/app/advertise/form-state';
import { normalizeOptionalUrl } from '@/lib/utils/url';
import { enforceRateLimit, assertSameOriginRequest, RateLimitError } from '@/lib/security/server';

export async function submitAdvertiserLead(
  _prevState: AdvertiserFormState,
  formData: FormData
): Promise<AdvertiserFormState> {
  try {
    assertSameOriginRequest();
    enforceRateLimit('advertiser-lead', { maxRequests: 5, windowMs: 60_000 });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return { status: 'error', message: 'Too many submissions. Please try again later.' };
    }
    return { status: 'error', message: 'Unable to submit right now.' };
  }

  const companyName = String(formData.get('companyName') ?? '').trim();
  const contactName = String(formData.get('contactName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const website = String(formData.get('website') ?? '').trim();
  const inquiryType = String(formData.get('inquiryType') ?? '').trim();
  const regionOrAudience = String(formData.get('regionOrAudience') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  if (!companyName || !contactName || !email || !inquiryType || !message) {
    return {
      status: 'error',
      message: 'Please complete all required fields before submitting.'
    };
  }

  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('advertiser_leads').insert({
    company_name: companyName,
    contact_name: contactName,
    email,
    website: normalizeOptionalUrl(website),
    inquiry_type: inquiryType,
    region_or_audience: regionOrAudience || null,
    message,
    status: 'new'
  });

  if (error) {
    return {
      status: 'error',
      message: 'Unable to submit your enquiry right now. Please try again shortly.'
    };
  }

  return {
    status: 'success',
    message: 'Thank you. Your inquiry has been received and will be reviewed by the partnerships team.'
  };
}
