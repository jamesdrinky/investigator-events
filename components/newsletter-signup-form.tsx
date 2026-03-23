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
  return 'h-11 rounded-full border border-white/12 bg-[linear-gradient(180deg,rgba(12,19,30,0.96),rgba(7,12,21,0.98))] px-4 text-sm text-slate-100 outline-none transition duration-200 focus:border-signal';
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-70">
      {pending ? 'Subscribing...' : 'Subscribe'}
    </button>
  );
}

export function NewsletterSignupForm() {
  const [state, formAction] = useFormState(subscribeToNewsletter, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_auto]">
        <input type="email" name="email" required placeholder="Email address" className={inputClasses()} />
        <select name="region" defaultValue="" className={inputClasses()}>
          <option value="">Preferred region</option>
          <option value="Global">Global</option>
          <option value="North America">North America</option>
          <option value="Europe">Europe</option>
          <option value="Middle East">Middle East</option>
          <option value="Asia-Pacific">Asia-Pacific</option>
        </select>
        <select name="interests" defaultValue="" className={inputClasses()}>
          <option value="">Primary interest</option>
          <option value="Conferences">Conferences</option>
          <option value="Training">Training</option>
          <option value="Association events">Association events</option>
          <option value="Industry updates">Industry updates</option>
        </select>
        <SubmitButton />
      </div>

      {state.status === 'success' ? (
        <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{state.message}</p>
      ) : null}
      {state.status === 'error' ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{state.message}</p>
      ) : null}
    </form>
  );
}
