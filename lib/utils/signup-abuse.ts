const RANDOM_TOKEN_PATTERN = /^[A-Za-z0-9]{14,}$/;

export function normaliseEmailDomain(email: string) {
  return email.trim().toLowerCase().split('@')[1] ?? '';
}

export function looksLikeRandomSignupName(name: string | null | undefined): boolean {
  const value = name?.trim() ?? '';
  if (!value) return true;

  // Public profiles need a real display name. These random signup waves submit
  // one long token such as "mFspKZhOxcwdnyXwZi" instead of a human name.
  if (!value.includes(' ') && RANDOM_TOKEN_PATTERN.test(value)) return true;

  return false;
}
