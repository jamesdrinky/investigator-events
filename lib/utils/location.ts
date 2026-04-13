const countryCodes: Record<string, string> = {
  Argentina: 'AR',
  Australia: 'AU',
  Austria: 'AT',
  Belgium: 'BE',
  Brazil: 'BR',
  Canada: 'CA',
  Chile: 'CL',
  'Costa Rica': 'CR',
  'Czech Republic': 'CZ',
  Denmark: 'DK',
  France: 'FR',
  Germany: 'DE',
  India: 'IN',
  Ireland: 'IE',
  Italy: 'IT',
  Japan: 'JP',
  Mexico: 'MX',
  Netherlands: 'NL',
  'New Zealand': 'NZ',
  Norway: 'NO',
  Online: '',
  Portugal: 'PT',
  Singapore: 'SG',
  'South Africa': 'ZA',
  Spain: 'ES',
  Sweden: 'SE',
  Switzerland: 'CH',
  'United Arab Emirates': 'AE',
  'United Kingdom': 'GB',
  'United States': 'US',
  Finland: 'FI',
  Hungary: 'HU',
  Latvia: 'LV',
  Serbia: 'RS',
  Slovenia: 'SI',
  Poland: 'PL',
  Romania: 'RO'
};

function codeToFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function getCountryFlag(country: string): string {
  const code = countryCodes[country];

  if (!code) {
    return country.toLowerCase() === 'online' ? '◎' : '◦';
  }

  return codeToFlag(code);
}

export function getRegionPalette(region: string) {
  const normalized = region.toLowerCase();

  if (normalized.includes('europe')) {
    return {
      glow: 'rgba(77,163,255,0.24)',
      glow2: 'rgba(52,211,153,0.14)',
      line: 'rgba(184,228,255,0.2)'
    };
  }

  if (normalized.includes('asia')) {
    return {
      glow: 'rgba(52,211,153,0.24)',
      glow2: 'rgba(77,163,255,0.18)',
      line: 'rgba(184,228,255,0.18)'
    };
  }

  if (normalized.includes('north america')) {
    return {
      glow: 'rgba(77,163,255,0.28)',
      glow2: 'rgba(52,211,153,0.14)',
      line: 'rgba(184,228,255,0.2)'
    };
  }

  if (normalized.includes('latin')) {
    return {
      glow: 'rgba(52,211,153,0.26)',
      glow2: 'rgba(77,163,255,0.16)',
      line: 'rgba(184,228,255,0.18)'
    };
  }

  if (normalized.includes('middle east')) {
    return {
      glow: 'rgba(77,163,255,0.24)',
      glow2: 'rgba(229,201,143,0.18)',
      line: 'rgba(184,228,255,0.16)'
    };
  }

  if (normalized.includes('africa')) {
    return {
      glow: 'rgba(52,211,153,0.24)',
      glow2: 'rgba(77,163,255,0.16)',
      line: 'rgba(184,228,255,0.16)'
    };
  }

  return {
    glow: 'rgba(77,163,255,0.22)',
    glow2: 'rgba(52,211,153,0.14)',
    line: 'rgba(184,228,255,0.16)'
  };
}
