'use client';

import { motion } from 'framer-motion';
import { useFormState, useFormStatus } from 'react-dom';
import { submitAdvertiserLead } from '@/app/advertise/actions';
import { advertiserInitialState } from '@/app/advertise/form-state';

function inputClasses() {
  return 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition duration-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100';
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? 'Submitting...' : 'Submit Enquiry'}
    </button>
  );
}

export function AdvertiserLeadForm() {
  const [state, formAction] = useFormState(submitAdvertiserLead, advertiserInitialState);

  return (
    <motion.form
      action={formAction}
      className="relative space-y-4 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      aria-label="Advertise form"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(139,169,255,0.06),transparent_24%),radial-gradient(circle_at_82%_20%,rgba(127,228,199,0.05),transparent_20%)]" />
      <h2 className="relative font-[var(--font-serif)] text-3xl text-slate-950">Advertising Inquiry</h2>
      <p className="relative text-sm text-slate-600">
        Tell us who you want to reach, what kind of placement you are considering, and which markets matter most.
      </p>

      {state.status === 'success' && (
        <p className="relative rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {state.message}
        </p>
      )}
      {state.status === 'error' && (
        <p className="relative rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{state.message}</p>
      )}

      <div className="relative grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Company Name
          <input type="text" name="companyName" required className={inputClasses()} placeholder="Your company" />
        </label>

        <label className="block text-sm text-slate-700">
          Contact Name
          <input type="text" name="contactName" required className={inputClasses()} placeholder="Full name" />
        </label>
      </div>

      <div className="relative grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Email
          <input type="email" name="email" required className={inputClasses()} placeholder="you@company.com" />
        </label>

        <label className="block text-sm text-slate-700">
          Website
          <input type="text" name="website" inputMode="url" className={inputClasses()} placeholder="example.com" />
        </label>
      </div>

      <label className="relative block text-sm text-slate-700">
        Inquiry Type
        <select name="inquiryType" required defaultValue="" className={inputClasses()}>
          <option value="" disabled>
            Select inquiry type
          </option>
          <option value="Advertising">Advertising</option>
          <option value="Sponsorship">Sponsorship</option>
          <option value="Vendor listing">Vendor listing</option>
          <option value="Association partnership">Association partnership</option>
        </select>
      </label>

      <label className="relative block text-sm text-slate-700">
        Region or Audience
        <input
          type="text"
          name="regionOrAudience"
          className={inputClasses()}
          placeholder="e.g. North America, UK associations, training providers"
        />
      </label>

      <label className="relative block text-sm text-slate-700">
        Message
        <textarea
          name="message"
          rows={5}
          required
          className={inputClasses()}
          placeholder="Share the placement you are considering, your target audience, timeline, and any relevant context."
        />
      </label>

      <SubmitButton />
      <p className="relative text-xs text-slate-500">Inquiries are stored securely and reviewed internally before any follow-up.</p>
    </motion.form>
  );
}
