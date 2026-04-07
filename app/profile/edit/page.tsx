'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, ShieldCheck, Trash2, Flame, Award, Zap, Crown, Star, Shield, Globe2, Sparkles } from 'lucide-react';
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
  'Private Investigation','Security Consulting','OSINT','Counter Surveillance',
  'Cyber Investigation','Asset Tracing','Compliance','Risk Management',
];

const ACCENT_COLORS = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#ef4444','#06b6d4','#6366f1','#0ea5e9','#d946ef'];

const PROFILE_BADGES = [
  { id: 'verified-pi', label: 'Verified PI', icon: Shield, color: '#3b82f6' },
  { id: 'speaker', label: 'Speaker', icon: Zap, color: '#8b5cf6' },
  { id: 'mentor', label: 'Mentor', icon: Award, color: '#10b981' },
  { id: 'early-adopter', label: 'Early Adopter', icon: Flame, color: '#f59e0b' },
  { id: 'top-contributor', label: 'Top Contributor', icon: Crown, color: '#ec4899' },
  { id: 'international', label: 'International', icon: Globe2, color: '#06b6d4' },
  { id: 'rising-star', label: 'Rising Star', icon: Star, color: '#d946ef' },
  { id: 'innovator', label: 'Innovator', icon: Sparkles, color: '#6366f1' },
];

const ALL_ASSOCIATIONS = [
  'ABI','WAD','IKD','CII','Intellenet','FEDERPOL','BuDEG','SNARP','EURODET','ODV','CKDS','FDDE',
  'SYL','IBPI','NFES','PSLD','LIDEPPE','ANDR','PDPR','ARD','SAD','DZRS','HDA',
  'APDPE','APDU','CODPC','FAPI','FSPD','IAIACE','SFPP','CALI','FALI','FEWA','NCAPI','NCISS','TALI',
];

type UserAssociation = { id?: string; association_name: string; association_slug: string; role: string; member_since: string };

const FLAGS: Record<string, string> = {
  'United Kingdom': '🇬🇧', 'United States': '🇺🇸', 'Australia': '🇦🇺', 'Austria': '🇦🇹', 'Belgium': '🇧🇪',
  'Canada': '🇨🇦', 'Czech Republic': '🇨🇿', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'France': '🇫🇷',
  'Germany': '🇩🇪', 'Hungary': '🇭🇺', 'India': '🇮🇳', 'Ireland': '🇮🇪', 'Israel': '🇮🇱', 'Italy': '🇮🇹',
  'Latvia': '🇱🇻', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Norway': '🇳🇴', 'Poland': '🇵🇱',
  'Portugal': '🇵🇹', 'Romania': '🇷🇴', 'Russia': '🇷🇺', 'Serbia': '🇷🇸', 'Singapore': '🇸🇬',
  'Slovenia': '🇸🇮', 'South Africa': '🇿🇦', 'Spain': '🇪🇸', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭',
};

export default function EditProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [specialisation, setSpecialisation] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [useCustomTitle, setUseCustomTitle] = useState(false);
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [profileColor, setProfileColor] = useState('#3b82f6');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  // Profile sections
  const [profileSections, setProfileSections] = useState<Array<{ type: string; title: string; content: string }>>([]);

  // Associations
  const [associations, setAssociations] = useState<UserAssociation[]>([]);
  const [newAssoc, setNewAssoc] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newYear, setNewYear] = useState('');
  const [verifications, setVerifications] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/signin'); return; }
      setUserId(data.user.id);

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profile) {
        setFullName(profile.full_name ?? '');
        setCountry(profile.country ?? '');
        setBio(profile.bio ?? '');
        setWebsite(profile.website ?? '');
        setProfileColor(profile.profile_color ?? '#3b82f6');
        setAvatarUrl(profile.avatar_url);

        // Check if specialisation is custom (not in list)
        const spec = profile.specialisation ?? '';
        if (spec && !SPECIALISATIONS.includes(spec)) {
          setUseCustomTitle(true);
          setCustomTitle(spec);
        } else {
          setSpecialisation(spec);
        }

        // Load badges
        const profileBadges = profile.badges as string[] | null;
        if (profileBadges) setSelectedBadges(profileBadges);
      }

      // Load profile sections
      const { data: sects } = await supabase.from('profile_sections').select('*').eq('user_id', data.user.id).order('sort_order');
      if (sects) {
        setProfileSections(sects.map((s) => ({ type: s.type, title: s.title, content: s.content ?? '' })));
      }

      const { data: assocs } = await supabase.from('user_associations').select('*').eq('user_id', data.user.id);
      if (assocs) {
        setAssociations(assocs.map((a) => ({
          id: a.id, association_name: a.association_name, association_slug: a.association_slug,
          role: a.role ?? '', member_since: a.member_since ?? '',
        })));
      }

      const { data: verifs } = await supabase.from('member_verifications').select('association_name, status').eq('user_id', data.user.id);
      if (verifs) {
        const map: Record<string, string> = {};
        verifs.forEach((v) => { map[v.association_name] = v.status; });
        setVerifications(map);
      }
    });
  }, [router]);

  const addAssociation = () => {
    if (!newAssoc) return;
    const slug = newAssoc.toLowerCase().replace(/\s+/g, '-');
    if (associations.some((a) => a.association_slug === slug)) return;
    setAssociations((prev) => [...prev, { association_name: newAssoc, association_slug: slug, role: newRole, member_since: newYear }]);
    setNewAssoc(''); setNewRole(''); setNewYear('');
  };

  const removeAssociation = (index: number) => setAssociations((prev) => prev.filter((_, i) => i !== index));

  const addSection = () => setProfileSections((prev) => [...prev, { type: 'custom', title: '', content: '' }]);
  const removeSection = (index: number) => setProfileSections((prev) => prev.filter((_, i) => i !== index));
  const updateSection = (index: number, field: string, value: string) => {
    setProfileSections((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const requestVerification = async (assocName: string) => {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('member_verifications').insert({ user_id: userId, association_name: assocName, status: 'pending' });
    setVerifications((prev) => ({ ...prev, [assocName]: 'pending' }));
  };

  const toggleBadge = (id: string) => {
    setSelectedBadges((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setMessage('');
    const supabase = createSupabaseBrowserClient();

    const finalSpec = useCustomTitle ? customTitle.trim() : specialisation;

    await supabase.from('profiles').upsert({
      id: userId,
      full_name: fullName || null,
      username: fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || null,
      country: country || null,
      specialisation: finalSpec || null,
      bio: bio || null,
      website: website || null,
      profile_color: profileColor,
      avatar_url: avatarUrl,
      badges: selectedBadges.length > 0 ? selectedBadges : null,
      is_public: true,
    });

    // Sync associations
    await supabase.from('user_associations').delete().eq('user_id', userId);
    if (associations.length > 0) {
      await supabase.from('user_associations').insert(
        associations.map((a) => ({
          user_id: userId, association_name: a.association_name, association_slug: a.association_slug,
          role: a.role || null, member_since: a.member_since || null,
        }))
      );
    }

    // Sync profile sections
    await supabase.from('profile_sections').delete().eq('user_id', userId);
    if (profileSections.length > 0) {
      await supabase.from('profile_sections').insert(
        profileSections.filter((s) => s.title.trim()).map((s, i) => ({
          user_id: userId, type: s.type, title: s.title.trim(), content: s.content.trim() || null, sort_order: i, visible: true,
        }))
      );
    }

    setSaving(false);
    setMessage('Profile saved!');
    setTimeout(() => setMessage(''), 3000);
  };

  if (!userId) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /></div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      <div className="container-shell py-24 sm:py-32">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Edit profile</h1>
          <p className="mt-1 text-sm text-slate-500">Your professional presence on Investigator Events</p>

          {/* Avatar with crop */}
          <div className="mt-8">
            <AvatarCropUpload
              currentAvatar={avatarUrl}
              fallbackInitial={fullName.charAt(0) || '?'}
              accentColor={profileColor}
              onUploaded={(url) => setAvatarUrl(url)}
              userId={userId}
            />
          </div>

          {/* Form fields */}
          <div className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">Full name</label>
              <input className="field-input mt-1.5 w-full" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Country</label>
                <select className="field-input mt-1.5 w-full" value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{FLAGS[c] ?? ''} {c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Title / Specialisation
                  <button type="button" onClick={() => { setUseCustomTitle(!useCustomTitle); setSpecialisation(''); setCustomTitle(''); }} className="ml-2 text-xs font-normal text-blue-600 hover:text-blue-700">
                    {useCustomTitle ? 'Choose from list' : 'Custom title'}
                  </button>
                </label>
                {useCustomTitle ? (
                  <input className="field-input mt-1.5 w-full" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} placeholder="e.g. Founder & CEO, OSINT Analyst..." />
                ) : (
                  <select className="field-input mt-1.5 w-full" value={specialisation} onChange={(e) => setSpecialisation(e.target.value)}>
                    <option value="">Select specialisation</option>
                    {SPECIALISATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Bio</label>
              <textarea className="field-input mt-1.5 w-full" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short bio about your work and expertise" />
              <p className="mt-1 text-xs text-slate-400">{bio.length}/280 characters</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Website</label>
              <input className="field-input mt-1.5 w-full" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
            </div>

            {/* Accent colour */}
            <div>
              <label className="text-sm font-medium text-slate-700">Profile accent colour</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setProfileColor(c)}
                    className={`h-8 w-8 rounded-full transition-all ${profileColor === c ? 'scale-110 ring-2 ring-offset-2' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c, ['--tw-ring-color' as string]: c }}
                  />
                ))}
              </div>
            </div>

            {/* Profile badges */}
            <div>
              <label className="text-sm font-medium text-slate-700">Profile badges <span className="font-normal text-slate-400">(choose up to 3)</span></label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PROFILE_BADGES.map((badge) => {
                  const Icon = badge.icon;
                  const isSelected = selectedBadges.includes(badge.id);
                  return (
                    <button
                      key={badge.id}
                      type="button"
                      onClick={() => toggleBadge(badge.id)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-transparent shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                      }`}
                      style={isSelected ? { backgroundColor: `${badge.color}15`, color: badge.color, borderColor: `${badge.color}30` } : undefined}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {badge.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Associations */}
          <div className="mt-10 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Professional memberships</h2>
            <p className="text-sm text-slate-400">Add your association memberships for credibility</p>

            {associations.length > 0 && (
              <div className="mt-4 space-y-2">
                {associations.map((a, i) => {
                  const status = verifications[a.association_name];
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">{a.association_name}</span>
                          {status === 'verified' && <ShieldCheck className="h-4 w-4 flex-shrink-0 text-blue-500" />}
                          {status === 'pending' && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">Pending</span>}
                        </div>
                        <p className="text-xs text-slate-400">{a.role}{a.role && a.member_since ? ' · ' : ''}{a.member_since ? `Since ${a.member_since}` : ''}</p>
                      </div>
                      {!status && (
                        <button type="button" onClick={() => requestVerification(a.association_name)} className="flex-shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100">
                          Request verify
                        </button>
                      )}
                      <button type="button" onClick={() => removeAssociation(i)} className="flex-shrink-0 text-slate-300 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add new */}
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <select className="field-input sm:col-span-1" value={newAssoc} onChange={(e) => setNewAssoc(e.target.value)}>
                <option value="">Association</option>
                {ALL_ASSOCIATIONS.filter((a) => !associations.some((ua) => ua.association_name === a)).map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <input className="field-input" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Role" />
              <input className="field-input" value={newYear} onChange={(e) => setNewYear(e.target.value)} placeholder="Year joined" />
              <button type="button" onClick={addAssociation} disabled={!newAssoc} className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:opacity-40">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          </div>

          {/* Profile sections — customisable */}
          <div className="mt-10 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Profile sections</h2>
            <p className="text-sm text-slate-400">Add custom sections to your public profile — services, case studies, testimonials, anything.</p>

            {profileSections.map((s, i) => (
              <div key={i} className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center justify-between">
                  <select className="border-0 bg-transparent text-sm font-semibold text-slate-900 outline-none" value={s.type} onChange={(e) => updateSection(i, 'type', e.target.value)}>
                    <option value="about">About</option>
                    <option value="services">Services</option>
                    <option value="experience">Experience</option>
                    <option value="case-studies">Case Studies</option>
                    <option value="testimonials">Testimonials</option>
                    <option value="certifications">Certifications</option>
                    <option value="custom">Custom</option>
                  </select>
                  <button type="button" onClick={() => removeSection(i)} className="text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
                <input className="mt-2 w-full border-0 bg-transparent text-sm font-medium text-slate-800 outline-none" value={s.title} onChange={(e) => updateSection(i, 'title', e.target.value)} placeholder="Section title" />
                <textarea className="mt-2 w-full resize-none border-0 bg-transparent text-sm text-slate-600 outline-none" rows={3} value={s.content} onChange={(e) => updateSection(i, 'content', e.target.value)} placeholder="Section content..." />
              </div>
            ))}

            <button type="button" onClick={addSection} className="mt-4 flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
              <Plus className="h-4 w-4" /> Add section
            </button>
          </div>

          {/* Save */}
          <div className="mt-8 flex items-center gap-4">
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-6 py-3 text-sm">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save profile'}
            </button>
            {message && <span className="text-sm font-medium text-emerald-600">{message}</span>}
          </div>
        </div>
      </div>
    </main>
  );
}
