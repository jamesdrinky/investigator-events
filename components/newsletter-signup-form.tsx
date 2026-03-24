'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { subscribeToNewsletter } from '@/app/actions/newsletter';

export interface NewsletterFormState {
  status: 'idle' | 'success' | 'error';
  message?: string;
}

const initialState: NewsletterFormState = {
  status: 'idle'
};

function inputClasses() {
  return 'h-13 rounded-[1.15rem] border border-white/80 bg-white/92 px-4 text-sm text-slate-800 outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition duration-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100';
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-13 items-center justify-center rounded-[1.15rem] bg-[linear-gradient(135deg,#1668ff,#14b8ff,#645bff)] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_24px_48px_-28px_rgba(22,104,255,0.46)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? 'Subscribing...' : 'Subscribe'}
    </button>
  );
}

export function NewsletterSignupForm() {
  const [state, formAction] = useFormState(subscribeToNewsletter, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-5 rounded-[2.3rem] border border-white/85 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(247,250,255,0.92))] p-5 shadow-[0_34px_96px_-54px_rgba(15,23,42,0.16)] sm:p-6 lg:p-7"
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-600">
          <span>Email</span>
          <input type="email" name="email" required placeholder="Email address" className={inputClasses()} />
        </label>
        <label className="grid gap-2 text-sm text-slate-600">
          <span>Preferred region</span>
          <select name="region" defaultValue="" className={inputClasses()}>
            <option value="">Choose region</option>
            <option value="Global">Global</option>
            <option value="North America">North America</option>
            <option value="Europe">Europe</option>
            <option value="Middle East">Middle East</option>
            <option value="Asia-Pacific">Asia-Pacific</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <label className="grid gap-2 text-sm text-slate-600">
          <span>Primary interest</span>
          <select name="interests" defaultValue="" className={inputClasses()}>
            <option value="">Choose focus</option>
            <option value="Conferences">Conferences</option>
            <option value="Training">Training</option>
            <option value="Association events">Association events</option>
            <option value="Industry updates">Industry updates</option>
          </select>
        </label>
        <div className="flex items-end">
          <SubmitButton />
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-500">
        Weekly updates focused on new events, approaching dates, and one standout event.
      </p>

      {state.status === 'success' ? (
        <p className="rounded-2xl border border-emerald-400/30 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.message}</p>
      ) : null}
      {state.status === 'error' ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p>
      ) : null}
    </form>
  );
}
