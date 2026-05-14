import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, FileText, Shield, Trash2, MessageCircle, AlertCircle, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Support — Investigator Events',
  description: 'Get help, report a bug, or contact the Investigator Events team.',
};

const FAQ = [
  {
    q: 'How do I delete my account?',
    a: 'Sign in → tap your avatar (top right) → Edit profile → scroll to the bottom → tap "Delete account" and confirm. This permanently removes your profile, posts, connections, events, and messages. The action cannot be undone.',
  },
  {
    q: "I can't sign in / I forgot my password",
    a: 'If you signed up with Sign in with Apple or LinkedIn, use the same option on the sign-in screen. If you used email and password, tap "Forgot password?" on the sign-in screen — you\'ll receive an email with a reset link. If you don\'t see the email within a minute, check your spam folder.',
  },
  {
    q: 'How do I list my event?',
    a: 'Tap "+ Submit" on the Events page (or visit /submit-event). Submissions are reviewed by our team before going live — usually within 24 hours. Listings are free.',
  },
  {
    q: 'How do I verify my association membership?',
    a: 'Go to the association\'s page (Network tab) and tap "Verify membership". If you signed in with LinkedIn or have been admin-verified, your associations show as verified automatically. Otherwise an admin from the association can verify you directly.',
  },
  {
    q: 'How do I report inappropriate content or a user?',
    a: 'Tap the "⋯" menu on any profile or post → Report. Our moderation team reviews every report. Reports are confidential — the reported user is not told who reported them.',
  },
  {
    q: 'Does the app work offline?',
    a: 'Most of the app requires an internet connection to fetch the latest events, messages, and profiles. You\'ll see a banner if you go offline.',
  },
  {
    q: 'How does the app use my camera and photos?',
    a: 'Only when you tap to attach a photo (in messages, posts, or your profile). We never access your camera or library in the background. You can revoke permission anytime in iOS Settings → Investigator Events.',
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(165deg,#f0f4ff_0%,#e8eeff_25%,#f0e8ff_50%,#f4f0ff_75%,#f8fbff_100%)] pb-12">
      <div className="container-shell pt-24 sm:pt-32">
        {/* ── Hero ── */}
        <div className="max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600/75 sm:text-xs sm:tracking-[0.3em] sm:font-semibold sm:text-blue-600">Support</p>
          <h1 className="mt-2 text-[2.25rem] font-bold leading-[0.92] tracking-[-0.05em] text-slate-950 sm:mt-4 sm:text-[3.5rem] lg:text-[5rem]">
            How can we{' '}
            <span
              className="inline-block bg-[linear-gradient(92deg,#3b82f6_0%,#22d3ee_30%,#a855f7_65%,#ec4899_100%)] bg-[length:200%_100%] bg-clip-text text-transparent"
              style={{ animation: 'gradient-text-cycle 5s ease-in-out infinite' }}
            >
              help
            </span>
            ?
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-lg">
            Most questions are answered below. If you can&apos;t find what you need, get in touch — we read every message.
          </p>
        </div>

        {/* ── Contact cards ── */}
        <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4">
          <a
            href="mailto:support@investigatorevents.com"
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] transition active:scale-[0.99] hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] sm:p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-[0_8px_20px_-8px_rgba(59,130,246,0.4)]">
              <Mail className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-bold text-slate-950">Email support</p>
            <p className="mt-1 text-sm text-slate-500">support@investigatorevents.com</p>
            <p className="mt-2 text-xs text-slate-400">Typical reply within 24 hours, Monday–Friday.</p>
          </a>

          <a
            href="mailto:bugs@investigatorevents.com?subject=Bug%20report"
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] transition active:scale-[0.99] hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] sm:p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-[0_8px_20px_-8px_rgba(244,63,94,0.4)]">
              <AlertCircle className="h-5 w-5" />
            </div>
            <p className="mt-4 text-base font-bold text-slate-950">Report a bug</p>
            <p className="mt-1 text-sm text-slate-500">bugs@investigatorevents.com</p>
            <p className="mt-2 text-xs text-slate-400">Include your device, iOS version, and steps to reproduce.</p>
          </a>
        </div>

        {/* ── FAQ ── */}
        <div className="mt-12 sm:mt-16">
          <div className="flex items-center gap-3">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" />
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">Frequently asked</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          </div>
          <div className="mt-6 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200/60 bg-white px-5 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-slate-950 sm:text-base">
                  {item.q}
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* ── Quick links ── */}
        <div className="mt-12 sm:mt-16">
          <div className="flex items-center gap-3">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]" />
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">More resources</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <Link
              href="/privacy"
              className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 transition active:scale-[0.99] hover:shadow-md sm:p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">Privacy policy</p>
                <p className="text-xs text-slate-500">How we collect, use, and protect your data</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 transition active:scale-[0.99] hover:shadow-md sm:p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">Terms of service</p>
                <p className="text-xs text-slate-500">What you agree to when using Investigator Events</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
            <Link
              href="/guidelines"
              className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 transition active:scale-[0.99] hover:shadow-md sm:p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">Community guidelines</p>
                <p className="text-xs text-slate-500">What we expect from members on the platform</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
            <Link
              href="/profile/edit"
              className="flex items-center gap-4 rounded-2xl border border-rose-200/60 bg-rose-50/40 p-4 transition active:scale-[0.99] hover:shadow-md sm:p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-950">Delete my account</p>
                <p className="text-xs text-slate-500">Permanently delete your data (in Profile → Edit → bottom)</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
