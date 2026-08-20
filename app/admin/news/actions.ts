'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { Resend } from 'resend';
import { createSupabaseAdminServerClient } from '@/lib/supabase/admin';
import { hasValidAdminSessionCookie } from '@/lib/admin/session';
import { assertSameOriginRequest, escapeHtml } from '@/lib/security/server';

async function ensureAdmin() {
  if (!(await hasValidAdminSessionCookie())) {
    redirect('/admin?error=auth');
  }
}

function parseId(formData: FormData) {
  const id = String(formData.get('articleId') ?? '').trim();
  if (!id) throw new Error('Missing articleId');
  return id;
}

function refreshNews() {
  revalidateTag('articles');
  revalidatePath('/news', 'layout');
  revalidatePath('/admin/news');
}

export async function approveArticleAction(formData: FormData) {
  assertSameOriginRequest();
  await ensureAdmin();

  const id = parseId(formData);
  const admin = createSupabaseAdminServerClient();

  const { data: row } = await admin
    .from('articles' as any)
    .select('id, title, slug, submitter_name, submitter_email')
    .eq('id', id)
    .single();

  const { error } = await admin
    .from('articles' as any)
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);

  const resendKey = process.env.RESEND_API_KEY;
  const submitterEmail = (row as any)?.submitter_email as string | undefined;
  if (resendKey && submitterEmail) {
    const resend = new Resend(resendKey);
    const url = `https://www.investigatorevents.com/news/${(row as any).slug}`;
    await resend.emails.send({
      from: 'Investigator Events <info@investigatorevents.com>',
      to: submitterEmail,
      subject: `Your story is live: ${(row as any).title}`,
      html: `<p>Hi ${escapeHtml(((row as any)?.submitter_name as string) ?? 'there')},</p>
<p>Your story <strong>${escapeHtml((row as any).title)}</strong> is now live on The Brief:</p>
<p><a href="${url}">${url}</a></p>
<p>Share it far and wide — and thank you for writing for the community.</p>
<p>— Investigator Events</p>`,
    }).catch(() => {});
  }

  refreshNews();
}

export async function rejectArticleAction(formData: FormData) {
  assertSameOriginRequest();
  await ensureAdmin();

  const id = parseId(formData);
  const admin = createSupabaseAdminServerClient();
  const { error } = await admin
    .from('articles' as any)
    .update({ status: 'rejected' })
    .eq('id', id);
  if (error) throw new Error(error.message);

  refreshNews();
}

export async function toggleFeaturedAction(formData: FormData) {
  assertSameOriginRequest();
  await ensureAdmin();

  const id = parseId(formData);
  const featured = String(formData.get('featured') ?? '') === 'true';
  const admin = createSupabaseAdminServerClient();

  // Single featured slot: clearing others keeps the hub's hero unambiguous.
  if (featured) {
    await admin.from('articles' as any).update({ featured: false }).eq('featured', true);
  }
  const { error } = await admin.from('articles' as any).update({ featured }).eq('id', id);
  if (error) throw new Error(error.message);

  refreshNews();
}
