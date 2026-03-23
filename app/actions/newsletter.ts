'use server';

import type { NewsletterFormState } from '@/components/newsletter-signup-form';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';

export async function subscribeToNewsletter(
  _prevState: NewsletterFormState,
  formData: FormData
): Promise<NewsletterFormState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const region = String(formData.get('region') ?? '').trim();
  const interests = String(formData.get('interests') ?? '').trim();

  if (!email || !email.includes('@')) {
    return {
      status: 'error',
      message: 'Enter a valid email address to subscribe.'
    };
  }

  const supabase = createSupabaseAdminServerClient();
  const { error } = await supabase.from('newsletter_subscriptions').upsert(
    {
      email,
      region: region || null,
      interests: interests || null,
      status: 'active'
    },
    { onConflict: 'email' }
  );

  if (error) {
    return {
      status: 'error',
      message: 'Unable to save your subscription right now. Please try again shortly.'
    };
  }

  return {
    status: 'success',
    message: 'You are subscribed. Weekly event updates will be sent when the subscriber brief goes live.'
  };
}
