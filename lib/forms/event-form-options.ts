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
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'Costa Rica',
  'Czech Republic',
  'Denmark',
  'France',
  'Germany',
  'India',
  'Ireland',
  'Italy',
  'Japan',
  'Mexico',
  'Netherlands',
  'New Zealand',
  'Norway',
  'Online',
  'Portugal',
  'Singapore',
  'South Africa',
  'Spain',
  'Sweden',
  'Switzerland',
  'United Arab Emirates',
  'United Kingdom',
  'United States'
] as const;

// Region → Country mapping for cascading validation
export const regionCountryMap: Record<string, string[]> = {
  'Africa': ['South Africa'],
  'Asia-Pacific': ['Australia', 'India', 'Japan', 'New Zealand', 'Singapore'],
  'Europe': ['Austria', 'Belgium', 'Czech Republic', 'Denmark', 'France', 'Germany', 'Ireland', 'Italy', 'Netherlands', 'Norway', 'Portugal', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom'],
  'Latin America': ['Argentina', 'Brazil', 'Chile', 'Costa Rica', 'Mexico'],
  'Middle East': ['United Arab Emirates'],
  'North America': ['Canada', 'United States'],
  'Online / Global': ['Online'],
};

// Get countries for a given region
export function getCountriesForRegion(region: string): string[] {
  return regionCountryMap[region] ?? [...eventCountries];
}
