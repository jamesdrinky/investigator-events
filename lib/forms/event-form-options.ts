export const eventRegions = [
  'Africa',
  'Asia-Pacific',
  'Europe',
  'Latin America',
  'Middle East',
  'North America',
  'Online / Global'
] as const;

export const eventCountries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Bermuda', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
  'Bulgaria', 'Cambodia', 'Cameroon', 'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica',
  'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Georgia',
  'Germany', 'Ghana', 'Greece', 'Guatemala', 'Guernsey', 'Honduras', 'Hong Kong', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Latvia', 'Lebanon',
  'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Malaysia', 'Maldives', 'Malta',
  'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Nigeria', 'North Macedonia',
  'Norway', 'Oman', 'Online', 'Pakistan', 'Palestine', 'Panama', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia',
  'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sweden',
  'Switzerland', 'Taiwan', 'Tanzania', 'Thailand', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Zambia', 'Zimbabwe'
] as const;

// Region → Country mapping for cascading validation
export const regionCountryMap: Record<string, string[]> = {
  'Africa': ['Algeria', 'Angola', 'Botswana', 'Cameroon', 'Egypt', 'Ethiopia', 'Ghana', 'Kenya', 'Libya', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Nigeria', 'Rwanda', 'Senegal', 'South Africa', 'Tanzania', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'],
  'Asia-Pacific': ['Afghanistan', 'Australia', 'Bangladesh', 'Brunei', 'Cambodia', 'China', 'Fiji', 'Hong Kong', 'India', 'Indonesia', 'Japan', 'Kazakhstan', 'Macau', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'New Zealand', 'Pakistan', 'Philippines', 'Singapore', 'South Korea', 'Sri Lanka', 'Taiwan', 'Thailand', 'Uzbekistan', 'Vietnam'],
  'Europe': ['Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Georgia', 'Germany', 'Greece', 'Guernsey', 'Hungary', 'Iceland', 'Ireland', 'Isle of Man', 'Italy', 'Jersey', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom'],
  'Latin America': ['Argentina', 'Barbados', 'Belize', 'Bermuda', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Dominican Republic', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Trinidad and Tobago', 'Uruguay', 'Venezuela'],
  'Middle East': ['Bahrain', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Kuwait', 'Lebanon', 'Oman', 'Palestine', 'Qatar', 'Saudi Arabia', 'United Arab Emirates'],
  'North America': ['Canada', 'United States'],
  'Online / Global': ['Online'],
};

// Get countries for a given region
export function getCountriesForRegion(region: string): string[] {
  return regionCountryMap[region] ?? [...eventCountries];
}
