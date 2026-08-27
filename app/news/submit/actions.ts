'use server';

import { redirect } from 'next/navigation';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { createSupabaseSSRServerClient } from '@/lib/supabase/ssr-server';
import { associationRecords } from '@/lib/data/associations';
import {
  assertSameOriginRequest,
  enforceRateLimitAsync,
  enforceRateLimitForKeyAsync,
  hashRateLimitKey,
  verifySignedFormState,
} from '@/lib/security/server';
import { buildAdminAlertEmail, ADMIN_ALERT_INBOX } from '@/lib/email/admin-alert';
import { ARTICLE_CATEGORIES } from '@/lib/data/articles';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 4;
const categories = new Set<string>(ARTICLE_CATEGORIES);
const associationSlugs = new Set<string>(associationRecords.map((a) => a.slug));

function sanitizeText(value: string, maxLength: number) {
  return value.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function sanitizeMultiline(value: string, maxLength: number) {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function parseRequired(formData: FormData, key: string, maxLength: number): string {
  const value = sanitizeText(String(formData.get(key) ?? ''), maxLength);
  if (!value) throw new Error(`Missing required field: ${key}`);
  return value;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function submitStoryAction(formData: FormData) {
  try {
    assertSameOriginRequest();
    await enforceRateLimitAsync('submit-story', {
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });

    // Honeypot — bots fill every field.
    if (sanitizeText(String(formData.get('companyWebsite') ?? ''), 200)) {
      throw new Error('Bot submission');
    }

    verifySignedFormState(
      'submit-story',
      parseRequired(formData, 'issuedAt', 20),
      parseRequired(formData, 'formToken', 200)
    );

    const title = parseRequired(formData, 'title', 140);
    const category = parseRequired(formData, 'category', 60);
    const dek = sanitizeText(String(formData.get('dek') ?? ''), 240);
    const body = sanitizeMultiline(String(formData.get('body') ?? ''), 12000);
    const authorName = parseRequired(formData, 'authorName', 120);
    const authorTitle = sanitizeText(String(formData.get('authorTitle') ?? ''), 140);
    const email = parseRequired(formData, 'email', 160).toLowerCase();

    // Optional attribution to an association page. Anything not in our own
    // records is dropped rather than rejected — a bad value shouldn't cost
    // someone the article they just wrote.
    const rawAssociation = sanitizeText(String(formData.get('associationSlug') ?? ''), 80);
    const associationSlug = associationSlugs.has(rawAssociation) ? rawAssociation : null;

    // Signed-in submitters get the piece tied to their profile, so the byline
    // strip on /profile/[username] can find it later. Anonymous submissions
    // still work exactly as before.
    let authorUserId: string | null = null;
    try {
      const ssr = await createSupabaseSSRServerClient();
      const { data } = await ssr.auth.getUser();
      authorUserId = data.user?.id ?? null;
    } catch {
      authorUserId = null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
    if (!categories.has(category)) throw new Error('Invalid category');
    if (body.length < 200) throw new Error('Story too short');

    await enforceRateLimitForKeyAsync('submit-story-email', hashRateLimitKey(email), {
      maxRequests: 6,
      windowMs: 60 * 60 * 1000,
    });

    const supabase = createSupabaseAdminServerClient();
    const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`;

    const { error } = await (supabase.from('articles' as never).insert({
      slug,
      title,
      dek: dek || null,
      body,
      category,
      author_name: authorName,
      author_title: authorTitle || null,
      source: 'member',
      status: 'pending',
      submitter_name: authorName,
      submitter_email: email,
      association_slug: associationSlug,
      author_user_id: authorUserId,
    } as never) as unknown as Promise<{ error: { message: string } | null }>);
    if (error) throw new Error(error.message);

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: 'Investigator Events <info@investigatorevents.com>',
        to: ADMIN_ALERT_INBOX,
        subject: `New story submitted: ${title}`,
        html: buildAdminAlertEmail({
          heading: 'New story for The Brief',
          intro: 'A member submitted a story for review.',
          rows: [
            { label: 'Title', value: title },
            { label: 'Category', value: category },
            { label: 'Author', value: `${authorName}${authorTitle ? ` — ${authorTitle}` : ''}` },
            { label: 'Email', value: email },
            { label: 'Association', value: associationSlug ?? '—' },
          ],
          cta: { label: 'Review in admin', url: 'https://www.investigatorevents.com/admin/news' },
        }),
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Story submission failed:', err);
    redirect('/news/submit?status=error');
  }

  redirect('/news/submit?status=success');
}
