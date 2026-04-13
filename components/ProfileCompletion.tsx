'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Check, ArrowRight } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  done: boolean;
  icon: React.ReactNode;
  href: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProfileCompletionProps {
  steps: Step[];
  userEmail?: string;
}

export function ProfileCompletion({ steps: initialSteps, userEmail }: ProfileCompletionProps) {
  const [steps, setSteps] = useState(initialSteps);
  const [subscribing, setSubscribing] = useState(false);

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percentage = Math.round((completed / total) * 100);

  if (percentage === 100) return null;

  const nextStep = steps.find((s) => !s.done && s.priority === 'high')
    || steps.find((s) => !s.done && s.priority === 'medium')
    || steps.find((s) => !s.done);

  const handleNewsletterSubscribe = async () => {
    if (!userEmail || subscribing) return;
    setSubscribing(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      if (res.ok) {
        setSteps((prev) => prev.map((s) => s.id === 'newsletter' ? { ...s, done: true } : s));
      }
    } catch {}
    setSubscribing(false);
  };

  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm">
      <div className="p-5 sm:p-6">
        {/* Progress header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Profile strength</h3>
            <p className="mt-0.5 text-xs text-slate-400">{completed} of {total} steps completed</p>
          </div>
          <div className="relative flex h-14 w-14 items-center justify-center">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="24" fill="none"
                stroke={percentage >= 80 ? '#10b981' : percentage >= 50 ? '#3b82f6' : '#f59e0b'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - percentage / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-900">{percentage}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${percentage}%`,
              background: percentage >= 80
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : percentage >= 50
                ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            }}
          />
        </div>

        {/* Steps */}
        <div className="mt-4 space-y-1.5">
          {steps.map((step) => (
            <div key={step.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${step.done ? 'opacity-50' : 'hover:bg-slate-50'}`}>
              <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {step.done ? <Check className="h-3.5 w-3.5" /> : step.icon}
              </div>
              <span className={`flex-1 text-xs font-medium ${step.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {step.label}
              </span>
              {!step.done && (
                step.id === 'newsletter' ? (
                  <button
                    onClick={handleNewsletterSubscribe}
                    disabled={subscribing}
                    className="text-[10px] font-semibold text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                ) : (
                  <Link href={step.href as Route} className="text-[10px] font-semibold text-blue-600 hover:underline">
                    Add
                  </Link>
                )
              )}
            </div>
          ))}
        </div>

        {/* Next step CTA */}
        {nextStep && nextStep.id !== 'newsletter' && (
          <Link href={nextStep.href as Route} className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 px-4 py-3 transition hover:shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-900">Next: {nextStep.label}</p>
              <p className="text-[10px] text-slate-500">Complete your profile to build trust</p>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </Link>
        )}
        {nextStep && nextStep.id === 'newsletter' && (
          <button
            onClick={handleNewsletterSubscribe}
            disabled={subscribing}
            className="mt-4 flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 px-4 py-3 transition hover:shadow-sm disabled:opacity-50"
          >
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900">Next: Subscribe to newsletter</p>
              <p className="text-[10px] text-slate-500">One click — we'll use your account email</p>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </button>
        )}
      </div>
    </div>
  );
}
