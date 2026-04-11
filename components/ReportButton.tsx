'use client';

import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

const REASONS = [
  { value: 'impersonation', label: 'Impersonation', desc: 'Pretending to be someone else' },
  { value: 'harassment', label: 'Harassment', desc: 'Bullying, threats, or intimidation' },
  { value: 'spam', label: 'Spam', desc: 'Unsolicited advertising or repetitive content' },
  { value: 'fraud', label: 'Fraud or scam', desc: 'Fraudulent listings, fake credentials, or scams' },
  { value: 'inappropriate_content', label: 'Inappropriate content', desc: 'Offensive or unprofessional material' },
  { value: 'false_information', label: 'False information', desc: 'Misleading claims or fake qualifications' },
  { value: 'illegal_activity', label: 'Illegal activity', desc: 'Content promoting unlawful conduct' },
  { value: 'other', label: 'Other', desc: 'Something else not listed above' },
] as const;

interface ReportButtonProps {
  reportedUserId?: string;
  contentType?: 'profile' | 'post' | 'comment' | 'message' | 'lfg_post';
  contentId?: string;
  variant?: 'icon' | 'text';
}

export function ReportButton({ reportedUserId, contentType = 'profile', contentId, variant = 'icon' }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason) {
      setError('Please select a reason.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be signed in to report.');
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from('reports' as any).insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId || null,
        reported_content_type: contentType,
        reported_content_id: contentId || null,
        reason,
        description: description.trim() || null,
      } as any);

      if (insertError) {
        setError('Failed to submit report. Please try again.');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch {
      setError('Something went wrong.');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => { setOpen(false); setSubmitted(false); }}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <Flag className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Report submitted</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Thank you. We will review this report and take appropriate action. Your identity will remain confidential.
                </p>
                <button onClick={() => { setOpen(false); setSubmitted(false); }} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          title="Report"
        >
          <Flag className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-red-500"
        >
          <Flag className="h-3 w-3" />
          Report
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Report {contentType === 'profile' ? 'user' : contentType}</h3>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
              <p className="mb-4 text-sm text-slate-600">
                Select the reason that best describes the issue. All reports are reviewed and your identity is kept confidential.
              </p>

              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                      reason === r.value ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{r.label}</p>
                      <p className="text-xs text-slate-500">{r.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-slate-700">Additional details (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any additional context that would help us investigate..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
