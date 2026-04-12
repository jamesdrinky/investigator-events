'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Check, ArrowRight, ShieldCheck, FileText, Users, Briefcase, Mail } from 'lucide-react';

interface ProfileCompletionProps {
  steps: {
    id: string;
    label: string;
    done: boolean;
    icon: React.ReactNode;
    href: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export function ProfileCompletion({ steps }: ProfileCompletionProps) {
  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percentage = Math.round((completed / total) * 100);

  if (percentage === 100) return null;

  const nextStep = steps.find((s) => !s.done && s.priority === 'high')
    || steps.find((s) => !s.done && s.priority === 'medium')
    || steps.find((s) => !s.done);

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
                <Link href={step.href as Route} className="text-[10px] font-semibold text-blue-600 hover:underline">
                  {step.id === 'newsletter' ? 'Subscribe' : 'Add'}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Next step CTA */}
        {nextStep && (
          <Link href={nextStep.href as Route} className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 px-4 py-3 transition hover:shadow-sm">
            <div>
              <p className="text-xs font-bold text-slate-900">Next: {nextStep.label}</p>
              <p className="text-[10px] text-slate-500">Complete your profile to build trust</p>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </Link>
        )}
      </div>
    </div>
  );
}
