'use server';

import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import type { AdvertiserFormState } from '@/app/advertise/form-state';
import { normalizeOptionalUrl } from '@/lib/utils/url';
import { looksLikeRandomString } from '@/lib/utils/bot-filter';
import {
  enforceRateLimitAsync,
  enforceRateLimitForKeyAsync,
  assertSameOriginRequest,
  hashRateLimitKey,
  RateLimitError
} from '@/lib/security/server';

const SUCCESS_MESSAGE =
  'Thank you. Your inquiry has been received and will be reviewed by the partnerships team.';

export async function submitAdvertiserLead(
  _prevState: AdvertiserFormState,
  formData: FormData
): Promise<AdvertiserFormState> {
  try {
    assertSameOriginRequest();
    await enforceRateLimitAsync('advertiser-lead', { maxRequests: 5, windowMs: 60_000 });
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

  // Honeypot — bots fill every field, including the one humans never see.
  // Report success so the bot has nothing to tune against.
  if (String(formData.get('companyWebsite') ?? '').trim()) {
    return { status: 'success', message: SUCCESS_MESSAGE };
  }

  // Machine-generated gibberish in the identifying fields. Fifteen such leads
  // reached the admin portal before the honeypot existed; this catches the
  // variant that renders the honeypot and fills it anyway.
  if (looksLikeRandomString(companyName) || looksLikeRandomString(contactName)) {
    return { status: 'success', message: SUCCESS_MESSAGE };
  }

  try {
    await Promise.all([
      enforceRateLimitForKeyAsync('advertiser-lead-email', hashRateLimitKey(email), { maxRequests: 5, windowMs: 60 * 60_000 }),
      enforceRateLimitForKeyAsync('advertiser-lead-company', hashRateLimitKey(companyName), { maxRequests: 5, windowMs: 60 * 60_000 }),
    ]);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return { status: 'error', message: 'Too many submissions. Please try again later.' };
    }
    return { status: 'error', message: 'Unable to submit right now.' };
  }

  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('advertiser_leads').insert({
    company_name: companyName,
    contact_name: contactName,
    email,
    business_type: inquiryType,
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

  return { status: 'success', message: SUCCESS_MESSAGE };
}
