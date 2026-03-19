function withDefaultScheme(value: string): string {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

export function normalizeRequiredUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error('Missing required URL');
  }

  try {
    return new URL(withDefaultScheme(trimmed)).toString();
  } catch {
    throw new Error('Invalid URL');
  }
}

export function normalizeOptionalUrl(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return normalizeRequiredUrl(trimmed);
}
