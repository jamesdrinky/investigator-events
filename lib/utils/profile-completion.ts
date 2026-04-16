export interface ProfileCompletionFields {
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  country: string | null;
  specialisation: string | null;
  bio: string | null;
  website?: string | null;
  banner_url?: string | null;
  auth_provider?: string | null;
  hasAssociations?: boolean;
  hasExperience?: boolean;
}

export const PROFILE_COMPLETION_ITEMS = [
  { key: 'full_name', label: 'Full name', weight: 15 },
  { key: 'avatar_url', label: 'Profile photo', weight: 15 },
  { key: 'headline', label: 'Headline', weight: 15 },
  { key: 'country', label: 'Country', weight: 10 },
  { key: 'specialisation', label: 'Specialisation', weight: 10 },
  { key: 'bio', label: 'About / Bio', weight: 10 },
  { key: 'website', label: 'Website', weight: 5 },
  { key: 'banner_url', label: 'Banner image', weight: 5 },
  { key: 'auth_provider', label: 'LinkedIn verified', weight: 5 },
  { key: 'hasAssociations', label: 'Association membership', weight: 5 },
  { key: 'hasExperience', label: 'Work experience', weight: 5 },
] as const;

export const PROFILE_VISIBILITY_THRESHOLD = 65;

export function getProfileCompletion(fields: ProfileCompletionFields) {
  const checks = PROFILE_COMPLETION_ITEMS.map((item) => {
    let completed = false;
    switch (item.key) {
      case 'full_name': completed = !!fields.full_name?.trim(); break;
      case 'avatar_url': completed = !!fields.avatar_url; break;
      case 'headline': completed = !!fields.headline?.trim(); break;
      case 'country': completed = !!fields.country?.trim(); break;
      case 'specialisation': completed = !!fields.specialisation?.trim(); break;
      case 'bio': completed = !!fields.bio?.trim(); break;
      case 'website': completed = !!fields.website?.trim(); break;
      case 'banner_url': completed = !!fields.banner_url; break;
      case 'auth_provider': completed = fields.auth_provider === 'linkedin_oidc'; break;
      case 'hasAssociations': completed = !!fields.hasAssociations; break;
      case 'hasExperience': completed = !!fields.hasExperience; break;
    }
    return { ...item, completed };
  });

  const score = checks.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0);

  return { score, checks, isVisible: score >= PROFILE_VISIBILITY_THRESHOLD };
}
