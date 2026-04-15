const countryCodes: Record<string, string> = {
  Afghanistan:'AF',Albania:'AL',Algeria:'DZ',Andorra:'AD',Angola:'AO',Argentina:'AR',Armenia:'AM',
  Australia:'AU',Austria:'AT',Azerbaijan:'AZ',Bahamas:'BS',Bahrain:'BH',Bangladesh:'BD',Barbados:'BB',
  Belarus:'BY',Belgium:'BE',Belize:'BZ',Bermuda:'BM',Bolivia:'BO','Bosnia and Herzegovina':'BA',
  Botswana:'BW',Brazil:'BR',Brunei:'BN',Bulgaria:'BG',Cambodia:'KH',Cameroon:'CM',Canada:'CA',
  Chile:'CL',China:'CN',Colombia:'CO','Costa Rica':'CR',Croatia:'HR',Cuba:'CU',Cyprus:'CY',
  'Czech Republic':'CZ',Denmark:'DK','Dominican Republic':'DO',Ecuador:'EC',Egypt:'EG',
  'El Salvador':'SV',Estonia:'EE',Ethiopia:'ET',Fiji:'FJ',Finland:'FI',France:'FR',Georgia:'GE',
  Germany:'DE',Ghana:'GH',Greece:'GR',Guatemala:'GT',Guernsey:'GG',Honduras:'HN','Hong Kong':'HK',
  Hungary:'HU',Iceland:'IS',India:'IN',Indonesia:'ID',Iran:'IR',Iraq:'IQ',Ireland:'IE',
  'Isle of Man':'IM',Israel:'IL',Italy:'IT',Jamaica:'JM',Japan:'JP',Jersey:'JE',Jordan:'JO',
  Kazakhstan:'KZ',Kenya:'KE',Kuwait:'KW',Latvia:'LV',Lebanon:'LB',Libya:'LY',Liechtenstein:'LI',
  Lithuania:'LT',Luxembourg:'LU',Macau:'MO',Malaysia:'MY',Maldives:'MV',Malta:'MT',Mauritius:'MU',
  Mexico:'MX',Moldova:'MD',Monaco:'MC',Mongolia:'MN',Montenegro:'ME',Morocco:'MA',Mozambique:'MZ',
  Myanmar:'MM',Namibia:'NA',Nepal:'NP',Netherlands:'NL','New Zealand':'NZ',Nicaragua:'NI',Nigeria:'NG',
  'North Macedonia':'MK',Norway:'NO',Oman:'OM',Online:'',Pakistan:'PK',Palestine:'PS',Panama:'PA',
  Paraguay:'PY',Peru:'PE',Philippines:'PH',Poland:'PL',Portugal:'PT',Qatar:'QA',Romania:'RO',
  Russia:'RU','Russian Federation':'RU',Rwanda:'RW','Saudi Arabia':'SA',Senegal:'SN',Serbia:'RS',
  Singapore:'SG',Slovakia:'SK',Slovenia:'SI','South Africa':'ZA','South Korea':'KR',Spain:'ES',
  'Sri Lanka':'LK',Sweden:'SE',Switzerland:'CH',Taiwan:'TW',Tanzania:'TZ',Thailand:'TH',
  'Trinidad and Tobago':'TT',Tunisia:'TN',Turkey:'TR',Uganda:'UG',Ukraine:'UA',
  'United Arab Emirates':'AE','United Kingdom':'GB','United States':'US',Uruguay:'UY',Uzbekistan:'UZ',
  Venezuela:'VE',Vietnam:'VN',Zambia:'ZM',Zimbabwe:'ZW',
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
