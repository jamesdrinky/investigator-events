'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { AvatarCropUpload } from '@/components/AvatarCropUpload';

const COUNTRIES = [
  'United Kingdom','United States','Australia','Austria','Belgium','Canada','Czech Republic','Denmark','Finland',
  'France','Germany','Hungary','India','Ireland','Israel','Italy','Latvia','Netherlands','New Zealand','Norway',
  'Poland','Portugal','Romania','Russia','Serbia','Singapore','Slovenia','South Africa','Spain','Sweden','Switzerland',
];

const SPECIALISATIONS = [
  'Corporate Investigation','Due Diligence','Fraud Investigation','Insurance Investigation',
  'Background Checks','Digital Forensics','Surveillance','Missing Persons',
  'Financial Crime','Intellectual Property','Employment Screening','Legal Support',
];

const FLAGS: Record<string, string> = {
  'United Kingdom': '🇬🇧', 'United States': '🇺🇸', 'Australia': '🇦🇺', 'Austria': '🇦🇹', 'Belgium': '🇧🇪',
  'Canada': '🇨🇦', 'Czech Republic': '🇨🇿', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'France': '🇫🇷',
  'Germany': '🇩🇪', 'Hungary': '🇭🇺', 'India': '🇮🇳', 'Ireland': '🇮🇪', 'Israel': '🇮🇱', 'Italy': '🇮🇹',
  'Latvia': '🇱🇻', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Norway': '🇳🇴', 'Poland': '🇵🇱',
  'Portugal': '🇵🇹', 'Romania': '🇷🇴', 'Russia': '🇷🇺', 'Serbia': '🇷🇸', 'Singapore': '🇸🇬',
  'Slovenia': '🇸🇮', 'South Africa': '🇿🇦', 'Spain': '🇪🇸', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭',
};

export default function ProfileSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fields
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [specialisation, setSpecialisation] = useState('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/signin'); return; }

      // Google OAuth users already have profile data — skip setup
      const meta = data.user.user_metadata;
      if (meta?.avatar_url || meta?.picture) {
        router.push('/calendar');
        return;
      }

      setUserId(data.user.id);
      setFullName(meta?.full_name ?? '');
    });
  }, [router]);

  const canContinue = () => {
    if (step === 1) return !!avatarUrl;
    if (step === 2) return !!fullName.trim();
    if (step === 3) return !!country;
    return false;
  };

  const handleContinue = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    // Final step — save everything
    if (!userId) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('profiles').upsert({
      id: userId,
      avatar_url: avatarUrl,
      full_name: fullName.trim(),
      username: fullName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      country,
      specialisation: specialisation || null,
      is_public: true,
    });
    setSaving(false);
    router.push('/calendar');
  };

  if (!userId) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div>;
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-6 py-4">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  s < step ? 'bg-emerald-500 text-white' : s === step ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'bg-slate-100 text-slate-400'
                }`}>
                  {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <div className={`h-1 w-full rounded-full ${s <= step ? 'bg-blue-500' : 'bg-slate-100'}`} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">Step {step} of 3</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Step 1: Avatar */}
          {step === 1 && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">Add a profile photo</h1>
              <p className="mt-2 text-sm text-slate-500">Help other investigators recognise you</p>

              <div className="mx-auto mt-8 flex justify-center">
                <AvatarCropUpload
                  currentAvatar={avatarUrl}
                  fallbackInitial="?"
                  accentColor="#3b82f6"
                  onUploaded={(url) => setAvatarUrl(url)}
                  userId={userId}
                />
              </div>
            </div>
          )}

          {/* Step 2: Name + Username */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Your name</h1>
              <p className="mt-2 text-sm text-slate-500">How other investigators will see you</p>

              <div className="mt-8">
                <label className="text-sm font-medium text-slate-700">Full name</label>
                <input className="field-input mt-1.5 w-full text-lg" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" autoFocus />
                <p className="mt-2 text-xs text-slate-400">This is your public display name, like LinkedIn.</p>
              </div>
            </div>
          )}

          {/* Step 3: Country + Specialisation */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Almost there</h1>
              <p className="mt-2 text-sm text-slate-500">Tell us where you are and what you do</p>

              <div className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-700">Country</label>
                  <select className="field-input mt-1.5 w-full" value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{FLAGS[c] ?? ''} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Specialisation <span className="text-slate-400">(optional)</span></label>
                  <select className="field-input mt-1.5 w-full" value={specialisation} onChange={(e) => setSpecialisation(e.target.value)}>
                    <option value="">Select specialisation</option>
                    {SPECIALISATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Continue button */}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue() || saving}
            className="btn-primary mt-8 flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm disabled:opacity-40"
          >
            {saving ? 'Saving...' : step === 3 ? 'Complete setup' : 'Continue'}
            {!saving && <ArrowRight className="h-4 w-4" />}
          </button>

          {step > 1 && (
            <button type="button" onClick={() => setStep(step - 1)} className="mt-3 w-full text-center text-sm text-slate-400 hover:text-slate-600">
              Back
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
