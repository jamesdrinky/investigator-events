'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { submitPartnerRequestAction } from '@/app/partners/[slug]/actions';
import { trackEvent } from '@/lib/analytics';

export function PartnerRequestForm({
  associationSlug,
  associationName,
}: {
  associationSlug: string;
  associationName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
        <p className="mt-2 text-sm font-bold text-emerald-800">Brilliant — we&apos;re on it.</p>
        <p className="mt-1 text-xs leading-relaxed text-emerald-700">
          We&apos;ll be in touch within a day to get the calendar live on your site.
        </p>
      </div>
    );
  }

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await submitPartnerRequestAction(formData);
      if (result.ok) {
        trackEvent('partner_request_submitted', { association: associationSlug });
        setDone(true);
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  };

  return (
    <form action={submit} className="mt-6 space-y-3">
      <input type="hidden" name="associationSlug" value={associationSlug} />
      <input type="hidden" name="associationName" value={associationName} />
      {/* Honeypot */}
      <input type="text" name="website_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="contactName"
          required
          placeholder="Your name"
          className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
        <input
          name="contactEmail"
          type="email"
          required
          placeholder="Your email"
          className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
      </div>
      <input
        name="webmasterEmail"
        type="email"
        placeholder="Your web person's email (optional — we'll handle the rest)"
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      />
      <textarea
        name="message"
        rows={2}
        placeholder="Anything we should know? (optional)"
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      />
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Set it up for us — free
      </button>
      <p className="text-center text-[11px] text-slate-400">
        No commitment, no cost. Remove it any time by deleting one line.
      </p>
    </form>
  );
}
